const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

//CRUD Review
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createNewReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
///////////////////////////////////////////////////////////////
exports.seTourUserIds = (req, res, next) => {
  //Allow Nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

//// till here came from Udemy
/* 
exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!review) {
    return next(new AppError('NO review found', 404));
  }
  res.status(200).json({ status: 'success', data: { review } });
});
 */
