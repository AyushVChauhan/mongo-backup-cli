import { createLogger, format, transports } from "winston";

export const logger = createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        }),
        format.colorize(),
    ),
    transports: [new transports.Console()],
});
