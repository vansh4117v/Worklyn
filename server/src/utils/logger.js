import winston from "winston";

const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "info";
};

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""}`;
  })
);

export const logger = winston.createLogger({
  level: level(),
 
  transports:
    process.env.NODE_ENV === "production"
      ? [
          new winston.transports.Console({
            format: consoleFormat,
          }),
        ]
      : [
          new winston.transports.Console({
            format: consoleFormat,
          }),
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: fileFormat,
          }),
          new winston.transports.File({
            filename: "logs/all.log",
            format: fileFormat,
          }),
        ],
});

export const morganMiddleware = (tokens, req, res) => {
  return JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number.parseFloat(tokens.status(req, res)),
    content_length: tokens.res(req, res, "content-length"),
    response_time: Number.parseFloat(tokens["response-time"](req, res)),
    ip: tokens['remote-addr'](req, res),
  });
}