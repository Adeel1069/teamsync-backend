import { body } from "express-validator";
import { validate } from "../middlewares/validate.js";
import { WORKSPACE_ROLES } from "../constants/index.js";

/**
 * Validation rules for workspace creation
 */
export const createWorkspaceValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Workspace name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Workspace name must be between 3 and 100 characters"),

  body("slug")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Slug must be between 3 and 100 characters")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      "Slug must only contain lowercase letters, numbers, and hyphens, and must start and end with a letter or number",
    ),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("logo")
    .optional()
    .trim()
    .isURL()
    .withMessage("Logo must be a valid URL"),

  validate,
];

/**
 * Validation rules for workspace update
 */
export const updateWorkspaceValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Workspace name must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("logo")
    .optional()
    .trim()
    .isURL()
    .withMessage("Logo must be a valid URL"),

  body("settings.allowMemberProjectCreation")
    .optional()
    .isBoolean()
    .withMessage("allowMemberProjectCreation must be a boolean"),

  validate,
];

/**
 * Validation rules for inviting a member to workspace
 */
export const inviteMemberValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("role")
    .optional()
    .trim()
    .isIn([
      WORKSPACE_ROLES.ADMIN,
      WORKSPACE_ROLES.MEMBER,
      WORKSPACE_ROLES.VIEWER,
    ])
    .withMessage(
      "Role must be one of: admin, member, viewer (owner role cannot be assigned)",
    ),

  validate,
];

/**
 * Validation rules for updating member role
 */
export const updateMemberRoleValidation = [
  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isIn([
      WORKSPACE_ROLES.ADMIN,
      WORKSPACE_ROLES.MEMBER,
      WORKSPACE_ROLES.VIEWER,
    ])
    .withMessage(
      "Role must be one of: admin, member, viewer (owner role cannot be assigned)",
    ),

  validate,
];
