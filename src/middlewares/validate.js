import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import { StatusCodes } from "http-status-codes";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));

    // To make error logic consistent
    const error = new AppError("Validation failed", StatusCodes.BAD_REQUEST);
    error.errors = errorMessages;

    return next(error); // Pass to centralized error handler
  }

  next();
};
