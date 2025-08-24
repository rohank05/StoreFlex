import winston from 'winston';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(meta).length > 0) {
    msg += ` ${JSON.stringify(meta)}`;
  }
  
  return msg;
});

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: {
    service: 'storeflex-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Write to all logs with level `info` and below to `combined.log`
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'HH:mm:ss' }),
      consoleFormat
    )
  }));
}

// Create logs directory if it doesn't exist
import { mkdirSync } from 'fs';
try {
  mkdirSync('logs', { recursive: true });
} catch (error) {
  // Directory already exists or cannot be created
}