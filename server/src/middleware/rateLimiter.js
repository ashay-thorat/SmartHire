import rateLimit from 'express-rate-limit';

// General rate limiter for most API routes (100 reqs per 15 minutes)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Stricter rate limiter for authentication routes (login/register/forgot-password)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 15, // Max 15 attempts per 15 minutes
  message: { error: 'Too many authentication attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for AI operations (evaluation)
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Max 20 evaluations per hour
  message: { error: 'You have reached the AI evaluation limit for this hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});
