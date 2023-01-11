const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

//router.param('id', tourController.checkID)

router
  .route('/') //child route
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id') //child route
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
