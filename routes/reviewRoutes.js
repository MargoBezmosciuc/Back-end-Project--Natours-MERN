const express = require('express');
const reviewController = require('./../controllers/reviewController.js');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createNewReview
  );

// router.post('/createNewReview', reviewController.createNewReview);
// router.get('/getAllReviews', reviewController.getAllReviews);
/// till here from udemy
router.patch('/updateReview', reviewController.updateReview);
router.delete('/deleteReview', reviewController.deleteReview);

module.exports = router;
