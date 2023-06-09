const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
//create User
const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  /// Send and Define Cookies

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // time now + expire in 90 days *24 h*60min*60sec*1000 milliseconds
    ),
    // secure: true, // cookies would be send only in https, in encrypted connection
    httpOnly: true, // cannot be accessed or modified in any way by the browser//receive the cookie, store it, and then send it automatically along with every request.
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // we need secure true only in production environment
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined; //remove password from output

  res.status(statusCode).json({ status: 'Molodets', token, data: { user } });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //2) check if user exist & password is correct
  const user = await User.findOne({ email }).select('+password'); // + to show the property that you need
  //const correct = await user.correctPassword(password, user.password);

  // If the first operand evaluates to true, the || operator immediately returns the value of the first operand without evaluating the second operand. This is known as short-circuiting.
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3) If everything is OK send Token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting Token and check if it exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(token);
  if (!token) {
    return next(
      new AppError('You are not log In! Please log in to get access')
    );
  }
  //2) Verification Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3) Check if User still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(AppError("The User belonging this Token doesn't exist", 401));
  }

  //4)check if user change password after JWT/Token was issued
  if (currentUser.changedPasswordsAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! please log in Again', 401)
    );
  } //.iat -> Issued at

  ////GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

/// Authorization : Roles and Permissions

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

///// Passwords Reset

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on POST email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(' There is no User with this email', 404));
  }

  //2)Generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // This will then deactivate all the validators that we specified in our schema

  //3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.\nIf you didn't forget your password, please ignore this email! `;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token(valid for 10 min)',
      message,
    });
    res
      .status(200)
      .json({ status: 'success', message: 'Token sent to email! ' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3) Update changPassword property for the user
  //4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2) Check if POSTed current password is correct

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError('Your current password is an Invalid password', 401)
    );
  }
  //3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //User.findByIDAndUpdate will not work as intended!  Document middleware are working only in save and create not in update mode
  //4) Log use in, send JWT
  createSendToken(user, 200, res);
});
