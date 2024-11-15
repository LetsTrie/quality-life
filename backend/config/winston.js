const winston = require("winston");
const chalk = require("chalk");

const logger = new winston.createLogger({
  levels: winston.config.npm.levels,
  defaultMeta: { service: "user-service" },
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.metadata(),
    winston.format.json(),
    winston.format.timestamp(),
    winston.format.prettyPrint(),
    winston.format.printf((log) => {
      const message = `${log.level}: [${process.pid}] ${log.message} ${log.timestamp} `;
      if (log.level === "error") return chalk.redBright(message);
      return message;
    })
  ),
  transports: [
    new winston.transports.Console({ colorize: true }),
    new winston.transports.File({
      colorize: true,
      json: false,
      filename: "app.error.log",
      level: "error",
    }),
  ],
});

module.exports = logger;
