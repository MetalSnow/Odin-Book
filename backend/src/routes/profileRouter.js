const express = require('express');
const { getProfile } = require('../controllers/profileController');
const { isAuth } = require('../middlewares/authMiddleware');

const profileRouter = express.Router();

profileRouter.use(isAuth);

profileRouter.get('/profile/:username', getProfile);

module.exports = profileRouter;
