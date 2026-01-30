import dotenv from "dotenv";
dotenv.config();

export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT || 8000;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRE = process.env.JWT_EXPIRE || "15m";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || "7d";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Cron Job Configuration
export const CRON_ENABLED = process.env.CRON_ENABLED || true; // Enabled by default
export const CRON_SOFT_DELETE_AUDIT_SCHEDULE =
  process.env.CRON_SOFT_DELETE_AUDIT_SCHEDULE || "0 2 * * *"; // Daily at 2:00 AM
export const SOFT_DELETE_RETENTION_DAYS =
  parseInt(process.env.SOFT_DELETE_RETENTION_DAYS, 10) || 30;

// SMTP Configuration
export const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
export const SMTP_PORT = parseInt(process.env.SMTP_PORT, 10) || 587;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || SMTP_USER;
export const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || "TeamSync";

// Password Reset Configuration
export const OTP_EXPIRY_MINUTES =
  parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 15;
export const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5;
