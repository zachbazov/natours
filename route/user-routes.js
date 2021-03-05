const express = require('express');

const userController = require('../controller/user-controller');
const authController = require('../controller/auth-controller');

const router = express.Router();

router
    .post('/signup', authController.signup);

router
    .post('/login', authController.login);

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
