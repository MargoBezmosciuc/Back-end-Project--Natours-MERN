const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A User must have a name'], // validator
    // unique: true,
    // trim: true,
    // maxlength: [40, 'A User name must have less or equal to 40 characters'],
    // minlength: [10, 'A User name must have more or equal to 10 characters'],
  },
  email: {
    type: String,
    required: [true, 'A User must have a email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid Email'],
    //trim: true,
  },
  photo: {
    type: String,
    //required: [true, 'A User must have a photo'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  // createdAt: { type: Date, default: Date.now(), select: false },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, // property that will never show up in DB
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm password'],
    validate: {
      //This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false, // no showing this property
  },
});

/*  Disable when you want to import Data because we have encrypted Passwords 
---------------------From here to disable ---------------------------------- */
//Encryption
userSchema.pre('save', async function (next) {
  //Only run this function if passwords was actually modify
  if (!this.isModified('password')) return next();

  // Hash the passwords with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete password confirmation, we don't need it in the Data Base.
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000; // save change at 1 sec in the past after token
  next();
});
///-----------------till here to disable in case of import-----------------------

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } }); // filter object
  next();
});
//Instance Method// Instances of Models are documents.->  We may also define our own custom document instance methods.
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordsAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changeTimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changeTimestamp;
  }
  //False mean NOT Changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  //create a random crypto Token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 min but have to be written in milliseconds

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
