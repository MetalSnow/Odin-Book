const express = require('express');
const { signupUser, loginUser } = require('../controllers/authController');
const {
  authenticate,
  isAuth,
  logout,
} = require('../middlewares/authMiddleware');

const authRouter = express.Router();

authRouter.post('/signup', signupUser);
authRouter.post('/login', authenticate, loginUser);
authRouter.post('/logout', isAuth, logout);

module.exports = authRouter;
