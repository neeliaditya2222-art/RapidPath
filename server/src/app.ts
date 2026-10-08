import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger, apiRateLimiter } from './middleware/authMiddleware';
import apiRouter from './routes';
import { NotFoundError } from './utils/errors';

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false, // For local dev and map tile loading
  }));

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        const allowedOrigins = [
          config.frontendUrl,
          'https://rapidpath-bff9c.web.app',
          'https://rapidpath-bff9c.firebaseapp.com',
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:3000',
        ];
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in dev/hackathon preview
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Operator-Id', 'X-Operator-Role', 'X-Request-Id'],
    })
  );

  // Body parser with size limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request logger
  app.use(requestLogger);

  // Rate Limiting on API routes
  app.use('/api', apiRateLimiter);

  // Root and Health endpoint for cloud platforms & uptime monitors (Render, AWS, Railway)
  app.all(['/', '/health', '/api/health'], (req: Request, res: Response) => {
    res.status(200).json({
      service: 'RapidPath Emergency Routing API',
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: config.env,
      endpoints: {
        health: '/api/health',
        api: '/api',
        routes: '/api/routes',
        auth: '/api/auth',
        hospitals: '/api/hospitals'
      }
    });
  });

  // Mount API router
  app.use('/api', apiRouter);

  // 404 Handler for undefined routes
  app.use('*', (req: Request, res: Response, next) => {
    next(new NotFoundError(`Endpoint ${req.method} ${req.originalUrl}`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
