const express = require('express');
const reviewController = require('./../controllers/reviewController.js');

const router = express.Router();

router.post('/createNewReview', reviewController.createNewReview);
router.get('/getAllReviews', reviewController.getAllReviews);
router.patch('/updateReview', reviewController.updateReview);
router.delete('/deleteReview', reviewController.deleteReview);

module.exports = router;
