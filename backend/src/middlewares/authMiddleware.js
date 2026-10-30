const passport = require('../config/passport');

const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  });
};

const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  return res.status(401).json({
    success: false,
    message: 'You are not authorized!',
  });
};

const authenticate = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error.',
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: info.message || 'Authentication failed.',
      });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      next();
    });
  })(req, res, next);
};

module.exports = { authenticate, isAuth, logout };
