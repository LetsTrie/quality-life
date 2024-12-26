const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');

require('./config/database');

const rateLimiter = require('./middlewares/rateLimiter');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const {
    isProdEnvironment,
    isDevEnvironment,
    sendErrorResponse,
} = require('./utils');
const madge = require('madge');
const { logger } = require('./config');

const app = express();

if (isDevEnvironment()) {
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

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.frameguard());
app.use(helmet.noSniff());

app.use(compression());

if (!isProdEnvironment()) {
    app.use(requestLogger());
}
// app.use(morgan('dev'));
app.use(rateLimiter);
app.set('view engine', 'ejs');

app.use(
    express.static(path.join(__dirname, 'public'), {
        maxAge: '1d',
    }),
);

app.get('/', (req, res, next) => {
    return res.send('Server is up!');
});

app.use(require('./index.routes'));

app.use((_, res) => {
    return sendErrorResponse(res, 405, 'MethodNotAllowed', {
        message: 'API Method not found',
    });
});

app.use(errorHandler);

process.on('unhandledRejection', (reason, _promise) => {
    logger.error(`Unhandled Rejection: ${reason}`);
});

process.on('uncaughtException', error => {
    logger.error(`Uncaught Exception: ${error.message}`);
    process.exit(1);
});

module.exports = app;
