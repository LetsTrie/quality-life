const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
    },
    headers: true,
    validate: { xForwardedForHeader: false },
});

module.exports = limiter;
