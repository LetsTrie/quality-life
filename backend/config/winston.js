const winston = require('winston');
const chalk = require('chalk');

const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        verbose: 5,
        debug: 6,
    },
    colors: {
        fatal: 'magenta',
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'cyan',
        verbose: 'blue',
        debug: 'grey',
    },
};

winston.addColors(customLevels.colors);

const transports = [
    new winston.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ level, message, timestamp, stack }) => {
                const base = `${chalk.bold(`[${timestamp}]`)} ${chalk.underline(
                    `[${process.pid}]`,
                )} ${level}:`;
                return stack
                    ? `${base} ${chalk.red(message)}\n${stack}`
                    : `${base} ${message}`;
            }),
        ),
    }),
    new winston.transports.File({
        filename: 'logs/errors.log',
        level: 'error',
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.json(),
        ),
    }),
];

const logger = winston.createLogger({
    levels: customLevels.levels,
    level:
        process.env.LOG_LEVEL ||
        (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    defaultMeta: { service: 'user-service' },
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.metadata(),
        winston.format.json(),
    ),
    transports,
});

logger.exceptions.handle(
    new winston.transports.File({
        filename: 'logs/exceptions.log',
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.json(),
        ),
    }),
);

process.on('unhandledRejection', reason => {
    logger.error('Unhandled Rejection:', reason);
});

module.exports = logger;
