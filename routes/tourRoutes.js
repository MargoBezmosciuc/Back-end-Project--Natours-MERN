const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);

//POST / tour/154544/review
//GET   /tour/154544/review
//GET   /tour/154544/review/4545454
/* 
router
  .route('/:tourId/review')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createNewReview
  ); */

router.use('/:tourId/review', reviewRouter); // this specific route here,we want to use the review router instead.

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id') //- req.params.id
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
