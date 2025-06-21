/**
 * Centralized logging utility that respects environment settings
 * Only shows warnings and errors in production
 * Supports log level configuration via environment variables
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Determine log level from environment
const getLogLevel = () => {
  if (process.env.NODE_ENV === 'production') {
    return LOG_LEVELS.ERROR; // Only errors in production
  }
  
  // Allow override via environment variable
  const envLevel = process.env.VITE_LOG_LEVEL || process.env.LOG_LEVEL;
  if (envLevel) {
    return LOG_LEVELS[envLevel.toUpperCase()] || LOG_LEVELS.WARN;
  }
  
  // Default to WARN in development (much quieter)
  return LOG_LEVELS.WARN;
};

const currentLogLevel = getLogLevel();

const logger = {
  debug: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.log(...args);
    }
  },
  
  info: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log(...args);
    }
  },
  
  log: (...args) => {
    // Alias for info
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log(...args);
    }
  },
  
  warn: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn(...args);
    }
  },
  
  error: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error(...args);
    }
  }
};

export default logger;
