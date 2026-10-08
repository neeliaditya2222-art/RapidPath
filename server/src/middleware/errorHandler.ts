import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const statusCode = (err as AppError).statusCode || 500;
  const isOperational = (err as AppError).isOperational || false;
  const details = (err as AppError).details || undefined;

  // Log error safely without exposing keys
  logger.error(`[${req.method}] ${req.originalUrl} - Status ${statusCode}: ${err.message}`, {
    requestId: (req as any).id,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Security: Never leak database connection strings or internal errors
  const userMessage =
    isOperational || statusCode < 500
      ? err.message
      : 'An unexpected system error occurred while processing your emergency route request.';

  res.status(statusCode).json({
    success: false,
    error: {
      message: userMessage,
      statusCode,
      details: isOperational ? details : undefined,
    },
    timestamp: new Date().toISOString(),
  });
}
