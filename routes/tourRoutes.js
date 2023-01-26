const express = require('express')
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')
const reviewRouter =  require('./reviewRoutes')
//This controller works for this url - http://127.0.0.1:3000/api/v1/tours/top-5-cheap

const router = express.Router()

// NESTED ROUTES - POST /tour_id/userID_234fas4/reviews
// NESTED ROUTES - GET /tour_id/userID_234fas4/reviews

//Mounting a router / redirecting
//For this specific route we want to use this route instead, the tour controller gives responsibility to the review controller basically
//reviewRouter doesnt have access to the ':tourId' parameter so we need to implement that
router.use('/:tourId/reviews', reviewRouter)

router.route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours)

router.route('/tour-stats')
  .get(tourController.getTourStats)

router.route('/monthly-plan/:year')
  .get(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.getMonthlyPlan)

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour)

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
//tours-distance?distance=233,center=40, 45&unit=mi

//compare the distance of a certain tour to all the others
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.uploadTourImages,
  tourController.resizeTourImages, tourController.updateTour)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour)
  


// NESTED ROUTES - POST /tour_id/userID_234fas4/reviews
// NESTED ROUTES - GET /tour_id/userID_234fas4/reviews
// NESTED ROUTES - GET /tour_id/userID_234fas4/reviews_id 345345
//this doesnt really belong in the router because it uses reviews and almost this same code is in the review router, so duplicate code.
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect, 
//     authController.restrictTo('user'), 
//     reviewController.createReview
//   )

module.exports = router