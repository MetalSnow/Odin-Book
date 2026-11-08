const asyncHandler = require('express-async-handler');
const { prisma } = require('../lib/prisma');

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

const findUsers = asyncHandler(async (req, res) => {
  const query = req.query.q;

  const data = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      username: true,
      profile: { select: { profilePic: true } },
    },
    take: 25,
    orderBy: {
      username: 'asc',
    },
  });

  res.json({
    success: true,
    data,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);

  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });

  if (!data)
    return res.status(404).json({
      success: false,
      error: 'User Not Found',
    });

  res.json({
    success: true,
    data,
  });
});

module.exports = { getCurrentUser, findUsers, getUserById };
