import { body } from "express-validator";
import { validate } from "../middlewares/validate.js";
import { PROJECT_STATUSES } from "../constants/index.js";

/**
 * Validation rules for project creation
 * Note: Project key is auto-generated from name, no need to provide it
 */
export const createProjectValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Project name must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),

  body("status")
    .optional()
    .trim()
    .isIn(Object.values(PROJECT_STATUSES))
    .withMessage(
      `Status must be one of: ${Object.values(PROJECT_STATUSES).join(", ")}`,
    ),

  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date")
    .custom((value, { req }) => {
      if (req.body.startDate && value) {
        const startDate = new Date(req.body.startDate);
        const dueDate = new Date(value);
        if (dueDate < startDate) {
          throw new Error("Due date must be after start date");
        }
      }
      return true;
    }),

  validate,
];

/**
 * Validation rules for project update
 */
export const updateProjectValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Project name must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),

  body("status")
    .optional()
    .trim()
    .isIn(Object.values(PROJECT_STATUSES))
    .withMessage(
      `Status must be one of: ${Object.values(PROJECT_STATUSES).join(", ")}`,
    ),

  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date")
    .custom((value, { req }) => {
      if (req.body.startDate && value) {
        const startDate = new Date(req.body.startDate);
        const dueDate = new Date(value);
        if (dueDate < startDate) {
          throw new Error("Due date must be after start date");
        }
      }
      return true;
    }),

  validate,
];
