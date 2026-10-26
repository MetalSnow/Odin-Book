const express = require('express');
const { signupUser, loginUser } = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

const authRouter = express.Router();

authRouter.post('/signup', signupUser);
authRouter.post('/login', authenticate, loginUser);

module.exports = authRouter;
