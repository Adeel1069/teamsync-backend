import { NODE_ENV } from "./envConfig.js";

export const getAccessTokenCookieOptions = () => {
  return {
    httpOnly: true,
    secure: NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // after this time, access token will be removed automatically from cookie
    path: "/",
  };
};

export const getRefreshTokenCookieOptions = () => {
  return {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth/refresh", // Only sent to refresh endpoint
  };
};
