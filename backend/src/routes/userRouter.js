const express = require('express');
const {
  getCurrentUser,
  findUsers,
  getUserById,
  updateUserInfo,
  UpdateUserPwd,
  deleteUser,
} = require('../controllers/userController');
const { isAuth } = require('../middlewares/authMiddleware');

const userRouter = express.Router();

userRouter.use(isAuth);

userRouter.get('/user', getCurrentUser);
userRouter.get('/users', findUsers);
userRouter.get('/user/:userId', getUserById);
userRouter.patch('/user', updateUserInfo);
userRouter.patch('/user/password', UpdateUserPwd);
userRouter.delete('/user', deleteUser);

module.exports = userRouter;
