import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { ApiError } from '../utils/ApiError.js'

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`))
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let { statusCode = 500, message } = err

  // Translate common non-ApiError failures into clean HTTP responses.
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors).map((e) => e.message).join(', ')
  } else if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid value for ${err.path}`
  } else if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue || {})[0]
    message = field ? `${field} already exists` : 'Duplicate value'
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Invalid or expired token'
  } else if (!message) {
    message = 'Something went wrong'
  }

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${message}`, { stack: err.stack })
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${statusCode} ${message}`)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
    ...(env.isProd ? {} : { stack: err.stack }),
  })
}
