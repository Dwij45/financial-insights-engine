import type{ Request, Response, NextFunction } from 'express'

interface AppError extends Error {
  statusCode?: number
  code?: number
}

// Global error handler — catches everything thrown anywhere in the app
const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  // Mongoose duplicate key (email already exists)
  if (err.code === 11000) {
    statusCode = 409
    message = 'Email already exists.'
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format.'
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token.'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired. Please log in again.'
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export default errorHandler