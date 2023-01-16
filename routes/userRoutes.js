const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')


const router = express.Router()

// Doesn't follows REST philosophy
router.post('/signup', authController.signup)

router.post('/login', authController.login)

// Follows REST philosophy
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser)

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router
