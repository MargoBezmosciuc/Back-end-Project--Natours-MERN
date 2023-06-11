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
});

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
//Instance Method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
