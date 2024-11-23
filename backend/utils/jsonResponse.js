const chalk = require("chalk");
const httpStatus = require("http-status");

const pino = require("pino");
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
  },
});

const sendJSONresponse = (res, status, content) => {
  res.status(status).json(content);

  logger.info(chalk.green(`Response sent with status ${statusCode}`));
};

const sendErrorResponse = function (res, status, type, content) {
  const errorBody = {
    success: false,
    status: status,
    type: type || httpStatus.INTERNAL_SERVER_ERROR,
    errors: Array.isArray(content) ? content : [content],
  };

  logger.error(
    {
      status,
      type,
      content,
    },
    chalk.redBright(content?.message || "An error occurred")
  );

  res.status(status).json(errorBody);
};

const logInfo = (message, context = {}) => {
  logger.info(context, chalk.blue(message));
};

const logWarn = (message, context = {}) => {
  logger.warn(context, chalk.yellow(message));
};

const logError = (message, context = {}) => {
  logger.error(context, chalk.redBright(message));
};

module.exports = {
  sendJSONresponse,
  sendErrorResponse,
  logInfo,
  logWarn,
  logError,
};
