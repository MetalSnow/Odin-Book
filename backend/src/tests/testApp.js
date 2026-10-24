const request = require('supertest');
const express = require('express');
const userRouter = require('../routes/userRouter');
const errorHandler = require('../middlewares/errorHandler');
const authRouter = require('../routes/authRouter');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(userRouter);
app.use(authRouter);
app.use(errorHandler);

module.exports = { request, app };
