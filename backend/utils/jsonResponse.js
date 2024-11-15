const chalk = require("chalk");
const { logger } = require("../config");
const httpStatus = require("http-status");

const sendJSONresponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

const sendErrorResponse = function (res, status, type, content) {
  const errorBody = {
    success: false,
    status: status,
    type: type || httpStatus.INTERNAL_SERVER_ERROR,
    errors: [content],
  };
  if (content && content.message) {
    logger.error(chalk.redBright(content.message));
  }
  res.status(status);
  res.json(errorBody);
};

module.exports = {
  sendJSONresponse,
  sendErrorResponse,
};
