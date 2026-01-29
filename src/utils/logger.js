import { NODE_ENV } from "../config/envConfig.js";

// Log levels for structured logging
const LOG_LEVELS = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  DEBUG: "DEBUG",
};

/**
 * Format timestamp for log messages
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Format log message with metadata
 * level - Log level
 * context - Context/source of the log (e.g., "CRON", "API")
 * message - Log message
 * meta - Additional metadata
 */
const formatLog = (level, context, message, meta = null) => {
  const timestamp = getTimestamp();
  const baseLog = `[${timestamp}] [${level}] [${context}] ${message}`;

  if (meta && NODE_ENV === "development") {
    return `${baseLog}\n${JSON.stringify(meta, null, 2)}`;
  }

  if (meta) {
    return `${baseLog} | ${JSON.stringify(meta)}`;
  }

  return baseLog;
};

/**
 * Logger utility for structured logging across the application
 * Provides context-aware logging with support for cron jobs, API, and general use
 */
const logger = {
  // Log info level message
  info: (context, message, meta = null) => {
    console.info(formatLog(LOG_LEVELS.INFO, context, message, meta));
  },

  // Log warning level message
  warn: (context, message, meta = null) => {
    console.warn(formatLog(LOG_LEVELS.WARN, context, message, meta));
  },

  // Log error level message
  error: (context, message, meta = null) => {
    if (meta instanceof Error) {
      meta = {
        name: meta.name,
        message: meta.message,
        stack: NODE_ENV === "development" ? meta.stack : undefined,
      };
    }
    console.error(formatLog(LOG_LEVELS.ERROR, context, message, meta));
  },

  // Log debug level message (only in development)
  debug: (context, message, meta = null) => {
    if (NODE_ENV === "development") {
      console.debug(formatLog(LOG_LEVELS.DEBUG, context, message, meta));
    }
  },

  /**
   * Create a child logger with a fixed context
   * Fixed context for all logs from this logger
   * Logger instance with fixed context
   */
  child: (context) => ({
    info: (message, meta) => logger.info(context, message, meta),
    warn: (message, meta) => logger.warn(context, message, meta),
    error: (message, meta) => logger.error(context, message, meta),
    debug: (message, meta) => logger.debug(context, message, meta),
  }),
};

export default logger;
