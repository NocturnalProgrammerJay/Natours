const express = require('express')
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')
//This controller works for this url - http://127.0.0.1:3000/api/v1/tours/top-5-cheap

const router = express.Router()

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

module.exports = router