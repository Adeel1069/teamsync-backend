import multer from "multer";
import { StatusCodes } from "http-status-codes";
import AppError from "../utils/AppError.js";

/**
 * Handle multer-specific errors
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new AppError(
          "File too large. Maximum file size is 10MB",
          StatusCodes.REQUEST_TOO_LONG,
        ),
      );
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return next(
        new AppError(
          "Too many files. Only one file can be uploaded at a time",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(
        new AppError(
          "Unexpected field name. Use 'file' as the field name",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    // Generic multer error
    return next(new AppError(err.message, StatusCodes.BAD_REQUEST));
  }

  // Not a multer error, pass to next error handler
  next(err);
};
