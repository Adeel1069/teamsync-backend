// This is the example with express-jwt
// For this project, I preferred custom auth, but keeping this for now

import { expressjwt } from "express-jwt";
import { JWT_SECRET } from "../config/env.js";
import AppError from "../utils/AppError.js";

/**
 * This authenticate middleware checks the token in the request and verifies it against the secret key.
 * If valid, it adds the user data to req.user.
 */
const authenticate = expressjwt({
  secret: JWT_SECRET,
  algorithms: ["HS256"],
});

/**
 * This authorize middleware ensures that the user has the appropriate role to access a particular route.
 */
export const authorize = (roles = []) => {
  // roles param can be a string or an array of strings
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (roles.length && !roles.includes(req.auth.role)) {
      // Forbidden if role doesn't match
      return next(new AppError("Access denied", 403));
    }
    next();
  };
};

export default authenticate;
