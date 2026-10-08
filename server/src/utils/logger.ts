import winston from 'winston';

const sensitiveKeys = ['password', 'apiKey', 'gemini_api_key', 'google_maps_server_api_key', 'token', 'authorization', 'secret'];

const sanitizeLog = winston.format((info) => {
  if (typeof info.message === 'object' && info.message !== null) {
    const sanitized: Record<string, any> = { ...info.message };
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    info.message = sanitized;
  }
  return info;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    sanitizeLog(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'rapidpath-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          const msg = typeof message === 'object' ? JSON.stringify(message) : message;
          return `[${timestamp}] [${level}] [${service}]: ${msg}${metaStr}`;
        })
      ),
    }),
  ],
});
