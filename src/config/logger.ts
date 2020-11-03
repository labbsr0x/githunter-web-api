import { createLogger, format, transports } from 'winston';

const { combine, timestamp, colorize, align, printf } = format;

const myFormat = combine(
  colorize(),
  timestamp(),
  align(),
  printf(log => `${log.timestamp} [${log.level}]: ${log.message}`),
);

const logger = createLogger({
  transports: [new transports.Console({ format: myFormat })],
});

export default logger;
