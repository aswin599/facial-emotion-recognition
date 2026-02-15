const rateLimit = require('express-rate-limit');
const { createAuditLog } = require('../services/auditService');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    if (req.user) {
      await createAuditLog({
        userId: req.user._id,
        eventType: 'RATE_LIMIT_EXCEEDED',
        status: 'warning',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    }

    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  }
});

// Strict rate limiter for prediction endpoints
const predictionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.PREDICTION_RATE_LIMIT) || 50,
  message: {
    success: false,
    message: 'Too many prediction requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

// Login rate limiter (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  predictionLimiter,
  loginLimiter
};
