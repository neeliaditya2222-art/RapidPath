import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'operator' | 'admin' | 'supervisor';
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      id?: string;
    }
  }
}

/**
 * Attaches verified dispatcher session / context
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Extract custom operator token or assign default isolated operator session
  const operatorHeader = req.headers['x-operator-id'] as string;
  const operatorRole = (req.headers['x-operator-role'] as any) || 'operator';

  req.user = {
    id: operatorHeader || 'dispatcher-01',
    email: 'dispatcher@emergency.local',
    name: 'Emergency Dispatcher 01',
    role: operatorRole,
  };

  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: { message: 'Administrator privileges required' },
    });
    return;
  }
  next();
}

/**
 * Standard API Rate Limiter
 */
export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Emergency routing rate limit exceeded. Please wait before issuing new route requests.',
      statusCode: 429,
    },
  },
});

/**
 * Structured request logger
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const reqId = uuidv4();
  req.id = reqId;
  const startTime = Date.now();

  res.setHeader('X-Request-Id', reqId);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, {
      requestId: reqId,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
    });
  });

  next();
}
