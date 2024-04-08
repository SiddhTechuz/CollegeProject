const express = require('express');
const multer = require('multer')
const userController = require('../controllers/userController')


const router = express.Router();
const authController = require('../controllers/authController')



router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logOut)
router.post('/forgetPassword', authController.forgetPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

router.use(authController.protect)

// all of the routsbelow needs to be protected 
router.patch('/updateMyPassword', authController.updatePassword)

router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe)
router.patch('/deleteMe', userController.deleteMe)
router.get('/me', userController.getMe, userController.getUser)


// allowed to admin only  
router.use(authController.restrictTo('admin'))
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)


module.exports = router;