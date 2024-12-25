const { logger } = require('../config');

const sendJSONresponse = (res, status, content) => {
    res.status(status).json(content);
};

const sendErrorResponse = (res, status, type, content) => {
    const errorBody = {
        success: false,
        status,
        type: type || 'INTERNAL_SERVER_ERROR',
        errors: Array.isArray(content) ? content : [content],
    };

    logger.error({
        message: content?.message || 'An error occurred',
        status,
        type,
        content,
    });

    res.status(status).json(errorBody);
};

const logInfo = (message, context = {}) => {
    logger.info({
        message,
        ...context,
    });
};

const logWarn = (message, context = {}) => {
    logger.warn({
        message,
        ...context,
    });
};

const logError = (message, context = {}) => {
    logger.error({
        message,
        ...context,
    });
};

module.exports = {
    sendJSONresponse,
    sendErrorResponse,
    logInfo,
    logWarn,
    logError,
};
