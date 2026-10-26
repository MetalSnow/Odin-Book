const express = require('express');
const errorHandler = require('./src/middlewares/errorHandler');
const userRouter = require('./src/routes/userRouter');
const authRouter = require('./src/routes/authRouter');
const passport = require('./src/config/passport');
const sessionMiddleware = require('./src/middlewares/sessionMidlleware');
require('dotenv').config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(sessionMiddleware);
app.use(passport.session());

app.get('/', (req, res) => {
  res.json({ message: 'Spark App Server' });
});

app.use(userRouter);
app.use(authRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Spark App is listening on port: ${PORT}`);
});
