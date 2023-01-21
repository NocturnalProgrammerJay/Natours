const express = require('express')
const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')

//options for routers '{mergeParams: true}'
//By default, each router only have access to the parameters of their specific routes, so now these routes have access from the previous routers params
const router = express.Router({mergeParams: true})

// NESTED ROUTES - POST /tour_id/userID_234fas4/reviews
// NESTED ROUTES - GET /tour_id/userID_234fas4/reviews
//Post/reviews

router.use(authController.protect)

router.route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview //has access to merged params
    )

router.route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user','admin'), reviewController.updateReview)
    .delete(authController.restrictTo('user','admin'), reviewController.deleteReview)

module.exports = router