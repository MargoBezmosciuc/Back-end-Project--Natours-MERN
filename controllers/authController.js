const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
//create User
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({ status: 'Molodets', data: { usr: newUser } });
});
