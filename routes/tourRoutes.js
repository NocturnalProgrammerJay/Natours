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
  .get(tourController.getMonthlyPlan)
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour)

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
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