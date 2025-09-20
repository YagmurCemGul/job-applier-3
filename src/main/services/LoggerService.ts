import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import { LogEntry } from '../../shared/types';

export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    // Ensure logs directory exists
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'job-applier-3' },
      transports: [
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: path.join(logsDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });

    // Add console transport for development
    if (process.env.NODE_ENV === 'development') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        })
      );
    }
  }

  info(message: string, category: string = 'general', details?: any): void {
    this.logger.info(message, { category, details });
  }

  warn(message: string, category: string = 'general', details?: any): void {
    this.logger.warn(message, { category, details });
  }

  error(message: string, category: string = 'general', details?: any): void {
    this.logger.error(message, { category, details });
  }

  debug(message: string, category: string = 'general', details?: any): void {
    this.logger.debug(message, { category, details });
  }

  createLogEntry(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    category: string,
    details?: any
  ): LogEntry {
    return {
      timestamp: new Date(),
      level,
      message,
      category,
      details,
    };
  }
}