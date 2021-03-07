const express = require('express');

const userController = require('../controller/user-controller');
const authController = require('../controller/auth-controller');

const router = express.Router();

router
    .get('/personal-info', authController.protect, userController.getPersonalInfo, userController.getUser);

router
    .post('/signup', authController.signup);

router
    .post('/login', authController.login);

router
    .post('/forgot-password', authController.forgotPassword);

router
    .patch('/reset-password/:token', authController.resetPassword);

router
    .patch('/update-password', authController.protect, authController.updatePassword);

router
    .patch('/update-personal-info', authController.protect, userController.updatePersonalInfo);

router
    .delete('/deactivate', authController.protect, userController.deactivate);

router
    .route('/')
    .get(userController.getAllUsers);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
