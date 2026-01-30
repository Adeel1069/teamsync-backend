import rateLimit from "express-rate-limit";

/**
 * Rate limiter for login attempts
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per Ip
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

/**
 * Rate limiter for user registration
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: "Too many accounts created. Please try again after an hour.",
  },
});

/**
 * Rate limiter for forgot password requests
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message:
      "Too many password reset requests. Please try again after an hour.",
  },
});
