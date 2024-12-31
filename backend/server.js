const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs');

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

const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory);

if (isDevEnvironment()) {
    app.use(morgan('dev'));
} else if (isProdEnvironment()) {
    const errorLogStream = fs.createWriteStream(
        path.join(logDirectory, 'error.log'),
        { flags: 'a' },
    );
    app.use(
        morgan('combined', {
            skip: (_req, res) => res.statusCode < 400 || res.statusCode === 405,
            stream: errorLogStream,
        }),
    );
}

app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms', {
        skip: (_req, res) => res.statusCode < 400 || res.status === 405,
        stream: process.stderr,
    }),
);

app.use(rateLimiter);
app.set('view engine', 'ejs');

app.use(
    express.static(path.join(__dirname, 'public'), {
        maxAge: '1d',
    }),
);

app.get('/', (_req, res, _next) => {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
