import winston from "winston";
import LokiTransport from "winston-loki";
import os from "os";

const getLogger = (name: string) => {
  const logger = winston.createLogger({
    level: "trace",
    defaultMeta: {
      service: name,
      host: os.hostname(),
      pid: process.pid,
    },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console({
        level: "info",
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf(
            ({ level, message, timestamp, ...meta }) =>
              `[${timestamp}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""
              }`
          )
        ),
      }),

      new LokiTransport({
        host: "http://localhost:3100",
        labels: { app: name },
        json: true,
        batching: true,
        interval: 5,
        level: "info"
      }),

      // new winston.transports.File({
      //   filename: "logs/ml-service.log",
      //   level: "info",
      // }),
    ],
  });

  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception", { message: err.message, stack: err.stack });
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection", { reason, promise });
  });

  return logger;
}

export default getLogger;
