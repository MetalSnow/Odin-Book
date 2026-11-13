const asyncHandler = require('express-async-handler');
const { prisma } = require('../lib/prisma');

const getProfile = asyncHandler(async (req, res) => {
  const username = req.params.username;

  const profile = await prisma.user.findUnique({
    where: {
      username,
    },
    include: {
      profile: true,
    },
    omit: {
      email: true,
      password: true,
    },
  });

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'User Not Found',
    });
  }

  res.json({
    success: true,
    data: profile,
  });
});

module.exports = { getProfile };
