const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const expressWinston = require('express-winston');
const { logger } = require('./config');
const madge = require('madge');
const path = require('path');

// const pino = require("pino-http")();

const app = express();

// app.use(pino);

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
require('dotenv').config();
app.use(express.json());

if (
  process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === 'test' ||
  process.env.NODE_ENV === 'sandbox' ||
  process.env.NODE_ENV === 'local'
) {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(
    expressWinston.logger({
      winstonInstance: logger,
      meta: true,
      msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
      colorStatus: true,
    }),
  );
}

if (process.env.NODE_ENV === 'development') {
  madge('./').then(res => {
    const data = res.circularGraph();
    if (data && Object.keys(data).length > 0) {
      logger.error('Circular file dependency detected!!');
      console.log(data);
    } else {
      logger.info('Ok, No circular file dependency');
    }
  });
}

const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('Database is running'))
  .catch(e => console.log(`MongoDB Connection Error: ${e.message}`));

app.set('view engine', 'ejs');

app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.frameguard());
app.use(helmet.noSniff());

app.use(morgan('dev'));

app.get('/', (req, res, next) => {
  return res.json({ success: true, message: 'server is up and running' });
});

app.use(require('./index.routes'));

app.use((req, res) => {
  return sendErrorResponse(res, 405, 'MethodNotAllowed', {
    message: 'API Method not found',
  });
});

app.use(require('./middlewares/errorHandler'));

const deleteAll = require('./controllers/deleteScript');
const { sendErrorResponse } = require('./utils');
if (process.argv[2] === '--D' && process.env.NODE_ENV !== 'production') {
  deleteAll()
    .then(() => console.log('Deleted'))
    .catch(err => console.log(err));
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server is running at port: ${port}`));
