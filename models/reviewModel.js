//review/rating/createAt/ ref to tour/ ref to user
const mongoose = require('mongoose');
const User = require('./userModel');
const validator = require('validator');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A Review must have a message'],
      // trim: true,
      // maxlength: [500, 'A review must have less or equal to 500 characters'],
      // minlength: [2, 'A review must have more or equal to 2 characters'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      //select: false
    },
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour'],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user'],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  /*  this.populate({
    path: 'user',
    select: 'name photo ',
  }).populate({
    path: 'tour',
    select: 'name ',
  }); */
  this.populate({
    path: 'user',
    select: 'name photo ',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
