const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { prisma } = require('../lib/prisma');

const lengthErr = 'must be minimum 3 characters.';
const emailErr = 'Please enter a valid email.';
const passwordErr = 'Password must be minimum 5 characters.';

const validateUser = [
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
  body('password').isLength({ min: 5 }).withMessage(passwordErr),
  body('confirmedPassword')
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage('Confirmed password does not match.'),
];

const signupUser = [
  validateUser,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { username, email, password: pswd } = req.body;

    const hashedPassword = await bcrypt.hash(pswd, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profile: { create: {} },
      },
      include: {
        profile: true,
      },
    });

    const { password, ...rest } = user;

    res.json({
      success: true,
      data: rest,
      message: 'Account created successfully. You can now log in.',
    });
  }),
];

const loginUser = (req, res) => {
  const { password, ...rest } = req.user;

  res.json({
    success: true,
    data: rest,
    message: 'Login successful.',
  });
};

module.exports = { signupUser, loginUser };
