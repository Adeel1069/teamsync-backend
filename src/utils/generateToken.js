import jwt from "jsonwebtoken";
import {
  JWT_SECRET,
  JWT_EXPIRE,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRE,
} from "../config/envConfig.js";

// Token types for unified generation and verification
const TOKEN_TYPES = {
  ACCESS: "access",
  REFRESH: "refresh",
};

// Validate that required secrets are configured
const validateSecrets = () => {
  if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error(
      "JWT secrets are not configured. Check JWT_SECRET and JWT_REFRESH_SECRET in environment variables.",
    );
  }
};

// Generate a JWT token (unified function for both access and refresh tokens)
const generateToken = (type, userId) => {
  validateSecrets();

  if (!userId) {
    throw new Error("userId is required to generate a token");
  }

  const isAccessToken = type === TOKEN_TYPES.ACCESS;
  const secret = isAccessToken ? JWT_SECRET : JWT_REFRESH_SECRET;
  const expiresIn = isAccessToken ? JWT_EXPIRE : JWT_REFRESH_EXPIRE;
  const payload = { userId };

  return jwt.sign(payload, secret, {
    expiresIn,
    issuer: "teamsync-api",
    audience: isAccessToken ? "teamsync-client" : "teamsync-refresh",
  });
};

// Verify a JWT token (unified function for both access and refresh tokens)
const verifyToken = (type, token) => {
  validateSecrets();

  if (!token) {
    throw new Error("Token is required for verification");
  }

  const isAccessToken = type === TOKEN_TYPES.ACCESS;
  const secret = isAccessToken ? JWT_SECRET : JWT_REFRESH_SECRET;

  return jwt.verify(token, secret, {
    issuer: "teamsync-api",
    audience: isAccessToken ? "teamsync-client" : "teamsync-refresh",
  });
};

// Generate an access token for authenticated API requests
export const generateAccessToken = (userId) => {
  return generateToken(TOKEN_TYPES.ACCESS, userId);
};

// Generate a refresh token for obtaining new access tokens
export const generateRefreshToken = (userId) => {
  return generateToken(TOKEN_TYPES.REFRESH, userId);
};

// Verify and decode an access token
export const verifyAccessToken = (token) => {
  return verifyToken(TOKEN_TYPES.ACCESS, token);
};

// Verify and decode a refresh token
export const verifyRefreshToken = (token) => {
  return verifyToken(TOKEN_TYPES.REFRESH, token);
};
