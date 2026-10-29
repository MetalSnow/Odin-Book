const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { prisma } = require('../lib/prisma');
const bcrypt = require('bcryptjs');

const INVALID_LOGIN = 'Invalid username/email or password.';

passport.use(
  new LocalStrategy(
    { usernameField: 'usernameEmail' },
    async (username, password, done) => {
      try {
        const user = await prisma.user.findFirst({
          where: { OR: [{ username }, { email: username }] },
          include: {
            profile: true,
          },
        });

        if (!user) {
          return done(null, false, { message: INVALID_LOGIN });
        }

        const isMatched = await bcrypt.compare(password, user.password);

        if (!isMatched) {
          return done(null, false, { message: INVALID_LOGIN });
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await prisma.user.findUnique({
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

    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
