import { body } from "express-validator";
import { validate } from "../middlewares/validate.js";
import { TASK_STATUSES, TASK_PRIORITIES } from "../constants/index.js";

/**
 * Validation rules for task creation
 */
export const createTaskValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Task title must be between 3 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description must not exceed 5000 characters"),

  body("status")
    .optional()
    .trim()
    .isIn(Object.values(TASK_STATUSES))
    .withMessage(
      `Status must be one of: ${Object.values(TASK_STATUSES).join(", ")}`,
    ),

  body("priority")
    .optional()
    .trim()
    .isIn(Object.values(TASK_PRIORITIES))
    .withMessage(
      `Priority must be one of: ${Object.values(TASK_PRIORITIES).join(", ")}`,
    ),

  body("assignees")
    .optional()
    .isArray()
    .withMessage("Assignees must be an array of user IDs"),

  body("assignees.*")
    .optional()
    .isMongoId()
    .withMessage("Each assignee must be a valid user ID"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),

  body("estimatedHours")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Estimated hours must be a positive number"),

  validate,
];

/**
 * Validation rules for task update
 */
export const updateTaskValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Task title must be between 3 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description must not exceed 5000 characters"),

  body("status")
    .optional()
    .trim()
    .isIn(Object.values(TASK_STATUSES))
    .withMessage(
      `Status must be one of: ${Object.values(TASK_STATUSES).join(", ")}`,
    ),

  body("priority")
    .optional()
    .trim()
    .isIn(Object.values(TASK_PRIORITIES))
    .withMessage(
      `Priority must be one of: ${Object.values(TASK_PRIORITIES).join(", ")}`,
    ),

  body("assignees")
    .optional()
    .isArray()
    .withMessage("Assignees must be an array of user IDs"),

  body("assignees.*")
    .optional()
    .isMongoId()
    .withMessage("Each assignee must be a valid user ID"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),

  body("estimatedHours")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Estimated hours must be a positive number"),

  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a positive integer"),

  validate,
];
