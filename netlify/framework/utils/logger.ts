import winston from 'winston'

// Define log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}

// Custom format for console output
export const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`
    }
    
    return log
  })
)

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Create the Winston logger
const createLogger = () => {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels: winston.config.npm.levels,
    defaultMeta: { 
      service: 'netlify-api',
      environment: process.env.NODE_ENV || 'development'
    },
    transports: [
      // Console transport
      new winston.transports.Console({
        format: consoleFormat,
        level: process.env.CONSOLE_LOG_LEVEL || 'info'
      })
    ],
    // Handle uncaught exceptions
    exceptionHandlers: [
      new winston.transports.Console({
        format: consoleFormat
      })
    ],
    // Handle unhandled promise rejections
    rejectionHandlers: [
      new winston.transports.Console({
        format: consoleFormat
      })
    ]
  })

  // Add file transports in production or when specified
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGGING === 'true') {
    // Error log file
    logger.add(new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }))

    // Combined log file
    logger.add(new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }))
  }

  return logger
}

// Create the logger instance
const winstonLogger = createLogger()

// Logger interface that matches the existing logger API
export const logger = {
  /**
   * Log an info message
   */
  info: (message: string, meta?: Record<string, unknown>) => {
    winstonLogger.info(message, meta)
  },

  /**
   * Log a warning message
   */
  warn: (message: string, meta?: Record<string, unknown>) => {
    winstonLogger.warn(message, meta)
  },

  /**
   * Log an error message
   */
  error: (message: string, meta?: Record<string, unknown> | Error) => {
    if (meta instanceof Error) {
      winstonLogger.error(message, { 
        error: meta.message, 
        stack: meta.stack 
      })
    } else {
      winstonLogger.error(message, meta)
    }
  },

  /**
   * Log a debug message
   */
  debug: (message: string, meta?: Record<string, unknown>) => {
    winstonLogger.debug(message, meta)
  },

  /**
   * Log an HTTP request
   */
  http: (message: string, meta?: Record<string, unknown>) => {
    winstonLogger.http(message, meta)
  },

  /**
   * Log a verbose message
   */
  verbose: (message: string, meta?: Record<string, unknown>) => {
    winstonLogger.verbose(message, meta)
  },

  /**
   * Log a silly message (most verbose)
   */
  silly: (message: string, meta?: Record<string, unknown>) => {
    winstonLogger.silly(message, meta)
  },

  /**
   * Create a child logger with additional metadata
   */
  child: (defaultMeta: Record<string, unknown>) => {
    const childLogger = winstonLogger.child(defaultMeta)
    
    return {
      info: (message: string, meta?: Record<string, unknown>) => childLogger.info(message, meta),
      warn: (message: string, meta?: Record<string, unknown>) => childLogger.warn(message, meta),
      error: (message: string, meta?: Record<string, unknown> | Error) => {
        if (meta instanceof Error) {
          childLogger.error(message, { error: meta.message, stack: meta.stack })
        } else {
          childLogger.error(message, meta)
        }
      },
      debug: (message: string, meta?: Record<string, unknown>) => childLogger.debug(message, meta),
      http: (message: string, meta?: Record<string, unknown>) => childLogger.http(message, meta),
      verbose: (message: string, meta?: Record<string, unknown>) => childLogger.verbose(message, meta),
      silly: (message: string, meta?: Record<string, unknown>) => childLogger.silly(message, meta)
    }
  },

  /**
   * Set the log level
   */
  setLevel: (level: LogLevel) => {
    winstonLogger.level = level
  },

  /**
   * Get the current log level
   */
  getLevel: (): string => {
    return winstonLogger.level
  },

  /**
   * Access to the underlying Winston logger for advanced usage
   */
  raw: winstonLogger
}

// Backward compatibility - keeping the simple log function
export function log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: unknown): void {
  const meta = data ? { data } : undefined
  
  switch (level) {
    case 'error':
      logger.error(message, meta)
      break
    case 'warn':
      logger.warn(message, meta)
      break
    case 'debug':
      logger.debug(message, meta)
      break
    case 'info':
    default:
      logger.info(message, meta)
      break
  }
}

// Export the Winston logger instance for direct access if needed
export default logger

// Request logging helper
export function logRequest(
  method: string, 
  url: string, 
  statusCode?: number, 
  duration?: number,
  requestId?: string
): void {
  const meta: Record<string, unknown> = {
    method,
    url,
    requestId
  }
  
  if (statusCode !== undefined) {
    meta.statusCode = statusCode
  }
  
  if (duration !== undefined) {
    meta.duration = `${duration}ms`
  }
  
  const message = statusCode 
    ? `${method} ${url} - ${statusCode}${duration ? ` (${duration}ms)` : ''}`
    : `${method} ${url}`
  
  // Use different log levels based on status code
  if (statusCode && statusCode >= 500) {
    logger.error(message, meta)
  } else if (statusCode && statusCode >= 400) {
    logger.warn(message, meta)
  } else {
    logger.http(message, meta)
  }
}

// Performance logging helper
export function logPerformance(
  operation: string,
  duration: number,
  meta?: Record<string, unknown>
): void {
  const logMeta = {
    operation,
    duration: `${duration}ms`,
    ...meta
  }
  
  if (duration > 1000) {
    logger.warn(`Slow operation: ${operation}`, logMeta)
  } else if (duration > 500) {
    logger.info(`Operation: ${operation}`, logMeta)
  } else {
    logger.debug(`Operation: ${operation}`, logMeta)
  }
}

// Error logging helper
export function logError(
  error: Error | string, 
  context?: string,
  meta?: Record<string, unknown>
): void {
  const message = typeof error === 'string' ? error : error.message
  const logMeta: Record<string, unknown> = {
    context,
    ...meta
  }
  
  if (error instanceof Error) {
    logMeta.stack = error.stack
    logMeta.name = error.name
  }
  
  logger.error(message, logMeta)
}
