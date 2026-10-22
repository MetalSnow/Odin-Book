const express = require('express');
const { signupUser } = require('../controllers/authController');

const authRouter = express.Router();

authRouter.post('/signup', signupUser);

module.exports = authRouter;
