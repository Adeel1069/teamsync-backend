import { body } from "express-validator";
import { validate } from "../middlewares/validate.js";

export const registerValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First Name is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("First Name must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "First Name can only contain letters, numbers, and underscores",
    ),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last Name is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Last Name must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Last Name can only contain letters, numbers, and underscores",
    ),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required")
    .isLength({ max: 100 })
    .withMessage("Email must not exceed 100 characters"),
  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage(
      "Password must contain uppercase, lowercase, number, and special character (@$!%*?&#)",
    ),
  // This is the validate middleware to handle the input validation results/errors
  // You can also add this middleware in your project routers directly if preferred
  validate,
];

export const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];
