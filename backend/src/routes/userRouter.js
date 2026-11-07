const express = require('express');
const { getCurrentUser } = require('../controllers/userController');
const { isAuth } = require('../middlewares/authMiddleware');

const userRouter = express.Router();

userRouter.get('/user', isAuth, getCurrentUser);

module.exports = userRouter;
