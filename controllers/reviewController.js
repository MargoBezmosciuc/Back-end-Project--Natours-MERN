const Review = require('../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

//const APIFeatures = require('./../utils/apiFeatures'); // not sure?
const AppError = require('../utils/appError');

exports.createNewReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { review: newReview },
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await await Review.find();

  ///Send Response
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!review) {
    return next(new AppError('NO review found', 404));
  }
  res.status(200).json({ status: 'success', data: { review } });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    return next(new AppError('No review was found', 404));
  }
  res.status(204).json({ status: 'success', data: null });
});
