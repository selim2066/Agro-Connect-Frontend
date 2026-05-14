import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env } from '../config/env';

const { combine, timestamp, errors, json, colorize, printf } = format;

// ─────────────────────────────────────────────────────────────────────────────
// Dev format — human-readable, colorized console output
// ─────────────────────────────────────────────────────────────────────────────

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return stack
      ? `[${ts}] ${level}: ${message}\n${stack}`
      : `[${ts}] ${level}: ${message}`;
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Production format — structured JSON for log aggregation tools
// ─────────────────────────────────────────────────────────────────────────────

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

// ─────────────────────────────────────────────────────────────────────────────
// Transports
// ─────────────────────────────────────────────────────────────────────────────

const loggerTransports: Parameters<typeof createLogger>[0]['transports'] = [
  // Combined log — all levels, daily rotation, 14 day retention
  new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    level: env.LOG_LEVEL,
    format: prodFormat,
  }),

  // Error log — only errors, 30 day retention
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    level: 'error',
    format: prodFormat,
  }),
];

// Console transport only in non-production environments
if (env.NODE_ENV !== 'production') {
  loggerTransports.push(
    new transports.Console({
      format: devFormat,
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Logger instance — singleton, imported everywhere in the app
//
// Rules from backend-rules.md:
//  - Never log passwords, tokens, or payment data
//  - Log all AI calls (metadata only, NOT response content)
//  - Log all failed BullMQ jobs at error level
// ─────────────────────────────────────────────────────────────────────────────

export const logger = createLogger({
  level: env.LOG_LEVEL,
  transports: loggerTransports,
  exitOnError: false, // never crash on logger error
});
