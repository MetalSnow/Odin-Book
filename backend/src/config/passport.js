const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { prisma } = require('../lib/prisma');
const bcrypt = require('bcryptjs');

passport.use(
  new LocalStrategy(async (usernameEmail, password, done) => {
    try {
      const user = await prisma.user.findFirst({
        where: { OR: [{ username: usernameEmail }, { email: usernameEmail }] },
      });

      if (!user) {
        return done(null, false, { message: 'Incorrect Username/Email.' });
      }

      const isMatched = await bcrypt.compare(password, user.password);

      if (!isMatched) {
        return done(null, false, { message: 'Incorrect Password.' });
      }

      done(null, user);
    } catch (error) {
      done(error);
    }
  }),
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
    });

    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
