const asyncHandler = require('express-async-handler');
const { prisma } = require('../lib/prisma');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const lengthErr = 'must be minimum 3 characters.';
const emailErr = 'Please enter a valid email.';
const passwordErr = 'password must be minimum 5 characters.';

const validateUserInfo = [
  body('username')
    .trim()
    .custom(async (value) => {
      const user = await prisma.user.findUnique({
        where: {
          username: value,
        },
      });
      if (user) throw new Error('Username already exist.');
    })
    .isLength({ min: 3 })
    .withMessage(`Username ${lengthErr}`)
    .isAlphanumeric()
    .withMessage('Username cannot contains symbols.'),
  body('email')
    .trim()
    .custom(async (value) => {
      const user = await prisma.user.findUnique({
        where: {
          email: value,
        },
      });
      if (user) throw new Error('Email is already in use.');
    })
    .isEmail()
    .withMessage(emailErr),
];

const validateNewPassword = [
  body('currentPassword').custom(async (value, { req }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });
    const isMatched = await bcrypt.compare(value, user.password);

    if (!isMatched) throw new Error('Current password is incorrect.');
  }),
  body('newPassword').isLength({ min: 5 }).withMessage(`New ${passwordErr}`),
  body('confirmedPassword')
    .custom((value, { req }) => {
      return value === req.body.newPassword;
    })
    .withMessage('Confirmed password does not match.'),
];

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

const updateUserInfo = [
  validateUserInfo,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { name, username, email } = req.body;

    const data = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        name,
        username,
        email,
      },
      omit: {
        password: true,
      },
    });

    res.json({
      success: true,
      data,
      message: 'Account details updated.',
    });
  }),
];

const UpdateUserPwd = [
  validateNewPassword,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { newPassword, ...rest } = req.body;
    const userId = req.user.id;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  }),
];

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  res.json({
    success: true,
    message: 'Account deleted successfuly.',
  });
});

module.exports = {
  getCurrentUser,
  findUsers,
  getUserById,
  updateUserInfo,
  UpdateUserPwd,
  deleteUser,
};
