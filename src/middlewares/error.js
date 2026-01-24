/**
 * Centralized Error Handling Middleware that will catch all errors and format them consistently
 * This must be the last middleware in the server.js, after all routes and controllers sets up
 * Instead of sending responses directly from the controller, throw errors when necessary,
 * which will be caught by this centralized error handler.
 */

import { StatusCodes } from "http-status-codes";
import { NODE_ENV } from "../config/envConfig.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
    isOperational: err.isOperational || false,
    ...(NODE_ENV === "development" && { stack: err.stack }), // Include stack trace in development only
  };

  // Add validation errors if they exist
  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
};
