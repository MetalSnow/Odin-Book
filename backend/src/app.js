const express = require('express');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Social Media App is listening on port: ${PORT}`);
});
