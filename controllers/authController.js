const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
//create User
const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({ status: 'Molodets', token, data: { usr: newUser } });
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
  const token = signToken(user._id);
  res.status(200).json({ status: 'Success', token });
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
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(AppError("The User belonging this Token doesn't exist", 401));
  }

  //4)check if user change password after JWT/Token was issued
  if (freshUser.changedPasswordsAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! please log in Again', 401)
    );
  } //.iat Issued at

  ////GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});
