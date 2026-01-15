import { body, param } from "express-validator";
import { PROJECT_STATUS } from "../constants/projects.js";

const isISODate = (value) => {
  // Strict ISO date: YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

export const validateProjectId = [
  param("id").isMongoId().withMessage("Invalid project id"),
];

export const createProjectValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 3, max: 120 })
    .withMessage("name must be between 3 and 120 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("description is required")
    .isLength({ min: 3, max: 120 })
    .withMessage("name must be between 3 and 120 characters")
    .withMessage("description must be at most 2000 characters"),

  body("startDate")
    .notEmpty()
    .withMessage("startDate is required")
    .custom((v) => isISODate(v))
    .withMessage("startDate must be in YYYY-MM-DD format"),

  body("endDate")
    .notEmpty()
    .withMessage("endDate is required")
    .custom((v) => isISODate(v))
    .withMessage("endDate must be in YYYY-MM-DD format"),

  body("status")
    .optional()
    .isIn(Object.values(PROJECT_STATUS))
    .withMessage(
      `status must be one of: ${Object.values(PROJECT_STATUS).join(", ")}`
    ),

  // cross-field validation: startDate <= endDate
  body("endDate").custom((endDate, { req }) => {
    if (
      !req.body.startDate ||
      !isISODate(req.body.startDate) ||
      !isISODate(endDate)
    )
      return true;

    const start = new Date(req.body.startDate);
    const end = new Date(endDate);

    if (start > end) throw new Error("startDate cannot be after endDate");
    return true;
  }),
];

export const updateProjectValidator = [
  // For update, fields are optional, but if present must be valid
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("name cannot be empty")
    .isLength({ min: 3, max: 120 })
    .withMessage("name must be between 3 and 120 characters"),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("description cannot be empty")
    .isLength({ min: 3, max: 1000 })
    .withMessage("description must be between 3 and 1000 characters"),

  body("startDate")
    .optional()
    .custom((v) => isISODate(v))
    .withMessage("startDate must be in YYYY-MM-DD format"),

  body("endDate")
    .optional()
    .custom((v) => isISODate(v))
    .withMessage("endDate must be in YYYY-MM-DD format"),

  body("status")
    .optional()
    .isIn(Object.values(PROJECT_STATUS))
    .withMessage(
      `status must be one of: ${Object.values(PROJECT_STATUS).join(", ")}`
    ),

  // cross-field validation for updates:
  // If both are present, enforce start <= end
  body("endDate").custom((endDate, { req }) => {
    const { startDate } = req.body;
    if (!startDate || !endDate) return true;
    if (!isISODate(startDate) || !isISODate(endDate)) return true;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) throw new Error("startDate cannot be after endDate");
    return true;
  }),
];
