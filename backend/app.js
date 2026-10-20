const express = require('express');
require('dotenv').config();
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Spark App Server' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Spark App is listening on port: ${PORT}`);
});
