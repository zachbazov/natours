const express = require('express');

const userController = require('../controller/user-controller');
const authController = require('../controller/auth-controller');

const router = express.Router();

router
    .post('/sign-up', authController.signUp);

router
    .post('/sign-in', authController.signIn);

router
    .get('/sign-out', authController.signOut);

router
    .post('/forgot-password', authController.forgotPassword);

router
    .patch('/reset-password/:token', authController.resetPassword);

router
    .use(authController.protect);

router
    .get('/user-profile',
        userController.getUserProfile,
        userController.getUser);

router
    .patch('/update-password', authController.updatePassword);

router
    .patch(
        '/update-user-profile',
            userController.uploadUserPhoto,
            userController.resizeUserPhoto,
            userController.updateUserProfile);

router
    .delete('/deactivate', userController.deactivate);

router
    .use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getAllUsers);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
