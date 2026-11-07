const express = require('express');
const { getCurrentUser, findUsers } = require('../controllers/userController');
const { isAuth } = require('../middlewares/authMiddleware');

const userRouter = express.Router();

userRouter.use(isAuth);

userRouter.get('/user', getCurrentUser);
userRouter.get('/users', findUsers);

module.exports = userRouter;
