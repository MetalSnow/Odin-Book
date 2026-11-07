const asyncHandler = require('express-async-handler');

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

module.exports = { getCurrentUser };
