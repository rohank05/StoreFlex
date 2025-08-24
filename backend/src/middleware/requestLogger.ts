import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    headers: {
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? '[REDACTED]' : undefined,
      'x-tenant-id': req.get('X-Tenant-ID'),
    }
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - start;
    
    logger.info('Outgoing response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
    });

    return originalJson.call(this, body);
  };

  next();
};