const express = require('express');
const {
  getCurrentUser,
  findUsers,
  getUserById,
} = require('../controllers/userController');
const { isAuth } = require('../middlewares/authMiddleware');

const userRouter = express.Router();

userRouter.use(isAuth);

userRouter.get('/user', getCurrentUser);
userRouter.get('/users', findUsers);
userRouter.get('/user/:userId', getUserById);

module.exports = userRouter;
