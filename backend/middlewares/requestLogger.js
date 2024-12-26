const expressWinston = require('express-winston');
const winston = require('winston'); // Import winston for format and transports
const { logger } = require('../config');

const requestLogger = () => {
    // Whitelist fields to log for requests and responses
    expressWinston.requestWhitelist.push('body', 'headers', 'query', 'params');
    expressWinston.responseWhitelist.push('body');

    return expressWinston.logger({
        winstonInstance: logger,
        meta: true, // Logs detailed metadata
        level: (req, res) => {
            // Log at 'error' level for responses with status codes >= 400
            return res.statusCode >= 400 ? 'error' : 'info';
        },
        msg: (req, res) => {
            // Custom log message
            return `HTTP ${req.method} ${req.originalUrl} ${res.statusCode} ${res.responseTime}ms`;
        },
        colorize: process.env.NODE_ENV !== 'production', // Disable colors in production
        ignoreRoute: req => {
            // Ignore health check or unimportant routes
            return req.path === '/health';
        },
        dynamicMeta: (req, res) => {
            // Add custom metadata such as user ID, request ID, or environment
            return {
                requestId: req.headers['x-request-id'] || 'N/A',
                user: req.user ? req.user.id : 'Anonymous',
                environment: process.env.NODE_ENV,
            };
        },
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    winston.format.printf(({ level, message, timestamp }) => {
                        return `[${timestamp}] ${level}: ${message}`;
                    }),
                ),
            }),
        ],
    });
};

module.exports = requestLogger;
