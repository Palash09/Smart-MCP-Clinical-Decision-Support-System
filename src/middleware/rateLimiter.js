const { RateLimiterMemory } = require('rate-limiter-flexible');
const { logger } = require('../utils/logger');

// Create rate limiter instance
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => {
    // Use IP address as key, or user ID if authenticated
    return req.user?.id || req.ip;
  },
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // Per 15 minutes
});

// Rate limiting middleware
async function rateLimiterMiddleware(req, res, next) {
  try {
    await rateLimiter.consume(req.user?.id || req.ip);
    next();
  } catch (rejRes) {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      userId: req.user?.id,
      remainingPoints: rejRes.remainingPoints,
      msBeforeNext: rejRes.msBeforeNext
    });

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(rejRes.msBeforeNext / 1000)
    });
  }
}

module.exports = {
  rateLimiter: rateLimiterMiddleware,
}; 