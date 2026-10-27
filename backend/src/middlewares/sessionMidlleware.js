const session = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { prisma } = require('../lib/prisma');
// require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

const store = new PrismaSessionStore(prisma, {
  checkPeriod: 2 * 60 * 1000,
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: undefined,
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
  },

  store,
});

module.exports = { sessionMiddleware, store };
