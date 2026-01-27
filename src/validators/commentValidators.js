import { body } from "express-validator";
import { validate } from "../middlewares/validate.js";

/**
 * Validation rules for comment creation
 * Task Id and Author Id are validated in the controller
 */
export const createCommentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ min: 1, max: 5000 })
    .withMessage("Comment content must be between 1 and 5000 characters"),

  validate,
];

/**
 * Validation rules for comment update
 */
export const updateCommentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ min: 1, max: 5000 })
    .withMessage("Comment content must be between 1 and 5000 characters"),

  validate,
];
