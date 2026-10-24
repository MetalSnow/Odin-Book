const express = require('express');
const { getCurrentUser } = require('../controllers/userController');

const userRouter = express.Router();

userRouter.get('/user', getCurrentUser);

module.exports = userRouter;
