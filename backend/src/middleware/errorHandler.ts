import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '@/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Object.setPrototypeOf(this, CustomError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Log error
  logger.error('Error caught by error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new CustomError(message, 404);
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        const target = err.meta?.target as string[] | undefined;
        const field = target ? target[0] : 'field';
        error = new CustomError(`Duplicate value for ${field}`, 400);
        break;
      case 'P2025':
        // Record not found
        error = new CustomError('Record not found', 404);
        break;
      case 'P2003':
        // Foreign key constraint violation
        error = new CustomError('Invalid reference to related record', 400);
        break;
      case 'P2014':
        // Required relation violation
        error = new CustomError('Required relation missing', 400);
        break;
      default:
        error = new CustomError('Database operation failed', 500);
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    error = new CustomError('Invalid data provided', 400);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    error = new CustomError(`Validation error: ${message}`, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new CustomError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new CustomError('Token expired', 401);
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error.statusCode = 500;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    }),
  });
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};