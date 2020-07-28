require('dotenv/config');
const express = require('express');
const path = require('path');
const app = express();

// Configure templating engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Register routes
const router = require('./routes/index');
app.use('/', router);

const serverPort = process.env.PORT || 3000;
app.listen(serverPort, () => {
  console.log(`Server listening on port ${serverPort}`);
});
