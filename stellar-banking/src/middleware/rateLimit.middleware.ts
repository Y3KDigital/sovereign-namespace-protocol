import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import config from '../config';
import logger from '../utils/logger';

/**
 * Rate limiter instance
 */
const rateLimiter = new RateLimiterMemory({
  points: config.api.rateLimit,
  duration: config.api.rateWindow / 1000,
});

/**
 * Rate limiting middleware
 */
export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    await rateLimiter.consume(ip);
    next();
  } catch (error) {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });

    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests. Please try again later.',
        statusCode: 429,
      },
    });
  }
};
