const { logger } = require('../config');
const ErrRes = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.error(err);

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = `${Object.keys(error.keyPattern)[0]} is already used.`;
        error = new ErrRes(message, 409, Object.keys(error.keyPattern)[0]);
    }

    // Mongoose bad objectID
    if (error.name === 'CastError') {
        const message = `Resource not found with ID of ${error.value}`;
        error = new ErrRes(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrRes(message, 400);
    }

    logger.error(
        `${error.statusCode || 500} - ${error.message} - ${req.originalUrl} - ${
            req.method
        } - ${req.ip}`,
    );

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        errorField: error.errorField || undefined,
    });
};

module.exports = errorHandler;
