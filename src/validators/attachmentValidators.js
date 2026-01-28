import { param } from "express-validator";
import { validate } from "../middlewares/validate.js";
import mongoose from "mongoose";

/**
 * Validation for attachment upload
 * File validation is handled by multer
 */
export const uploadAttachmentValidation = [
  param("workspaceId")
    .notEmpty()
    .withMessage("Workspace ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid workspace ID"),

  param("projectId")
    .notEmpty()
    .withMessage("Project ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid project ID"),

  param("taskId")
    .notEmpty()
    .withMessage("Task ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid task ID"),

  validate,
];

/**
 * Validation for getting attachments
 */
export const getAttachmentsValidation = [
  param("workspaceId")
    .notEmpty()
    .withMessage("Workspace ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid workspace ID"),

  param("projectId")
    .notEmpty()
    .withMessage("Project ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid project ID"),

  param("taskId")
    .notEmpty()
    .withMessage("Task ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid task ID"),

  validate,
];

/**
 * Validation for deleting an attachment
 */
export const deleteAttachmentValidation = [
  param("workspaceId")
    .notEmpty()
    .withMessage("Workspace ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid workspace ID"),

  param("projectId")
    .notEmpty()
    .withMessage("Project ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid project ID"),

  param("taskId")
    .notEmpty()
    .withMessage("Task ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid task ID"),

  param("attachmentId")
    .notEmpty()
    .withMessage("Attachment ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid attachment ID"),

  validate,
];
