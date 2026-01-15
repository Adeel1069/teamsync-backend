import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";

// export const validate = (req, res, next) => {
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       message: "Validation failed",
//       errors: errors.array().map((e) => ({
//         field: e.path,
//         message: e.msg,
//       })),
//     });
//   }

//   next();
// };

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));

    // To make error logic consistent
    const error = new AppError("Validation failed", 400);
    error.errors = errorMessages;

    return next(error); // Pass to centralized error handler
  }

  next();
};
