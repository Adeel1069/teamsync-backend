import { StatusCodes } from "http-status-codes";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import Attachment from "../models/attachmentModel.js";
import Task from "../models/taskModel.js";
import Project from "../models/projectModel.js";
import AppError from "../utils/AppError.js";
import { ATTACHMENT_ENTITY_TYPES } from "../constants/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload attachment to a task
 */
export const uploadTaskAttachment = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.userId;

    // Check if file was uploaded
    if (!req.file) {
      throw new AppError("No file uploaded", StatusCodes.BAD_REQUEST);
    }

    // Verify project exists and belongs to workspace
    const project = await Project.findOne({
      _id: projectId,
      workspace: req.workspace._id,
      deletedAt: null,
    });

    if (!project) {
      throw new AppError("Project not found", StatusCodes.NOT_FOUND);
    }

    // Find and verify task
    const task = await Task.findOne({
      _id: taskId,
      project: project._id,
      deletedAt: null,
    });

    if (!task) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }

    // Create file URL (for local storage)
    // In production, this would be an S3 URL or cloud storage URL
    const fileUrl = `/api/attachments/files/${req.file.filename}`;

    // Create attachment record
    const attachment = new Attachment({
      entityType: ATTACHMENT_ENTITY_TYPES.TASK,
      entityId: task._id,
      uploadedBy: userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      fileUrl,
      storageKey: req.file.filename, // For local storage, this is the filename
    });

    await attachment.save();

    // Populate uploader details
    await attachment.populate(
      "uploadedBy",
      "firstName lastName email profileImage",
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Attachment uploaded successfully",
      attachment: {
        id: attachment._id,
        fileName: attachment.fileName,
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        fileSize: attachment.fileSize,
        fileUrl: attachment.fileUrl,
        uploadedBy: {
          id: attachment.uploadedBy._id,
          firstName: attachment.uploadedBy.firstName,
          lastName: attachment.uploadedBy.lastName,
          email: attachment.uploadedBy.email,
          profileImage: attachment.uploadedBy.profileImage,
        },
        createdAt: attachment.createdAt,
      },
    });
  } catch (error) {
    // If error occurs after file upload, delete the uploaded file
    if (req.file) {
      const filePath = path.join(__dirname, "../../uploads", req.file.filename);
      await fs.unlink(filePath).catch(() => {
        /* ignore if file doesn't exist */
      });
    }
    next(error);
  }
};

/**
 * Get all attachments for a task
 */
export const getTaskAttachments = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;

    // Verify project exists and belongs to workspace
    const project = await Project.findOne({
      _id: projectId,
      workspace: req.workspace._id,
      deletedAt: null,
    });

    if (!project) {
      throw new AppError("Project not found", StatusCodes.NOT_FOUND);
    }

    // Find and verify task
    const task = await Task.findOne({
      _id: taskId,
      project: project._id,
      deletedAt: null,
    });

    if (!task) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }

    // Get all attachments for this task
    const attachments = await Attachment.find({
      entityType: ATTACHMENT_ENTITY_TYPES.TASK,
      entityId: task._id,
      deletedAt: null,
    })
      .populate("uploadedBy", "firstName lastName email profileImage")
      .sort({ createdAt: -1 }); // Newest first

    const attachmentsWithDetails = attachments.map((attachment) => ({
      id: attachment._id,
      fileName: attachment.fileName,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize,
      fileUrl: attachment.fileUrl,
      uploadedBy: {
        id: attachment.uploadedBy._id,
        firstName: attachment.uploadedBy.firstName,
        lastName: attachment.uploadedBy.lastName,
        email: attachment.uploadedBy.email,
        profileImage: attachment.uploadedBy.profileImage,
      },
      createdAt: attachment.createdAt,
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      count: attachmentsWithDetails.length,
      attachments: attachmentsWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an attachment (soft delete)
 */
export const deleteTaskAttachment = async (req, res, next) => {
  try {
    const { projectId, taskId, attachmentId } = req.params;

    // Verify project exists and belongs to workspace
    const project = await Project.findOne({
      _id: projectId,
      workspace: req.workspace._id,
      deletedAt: null,
    });

    if (!project) {
      throw new AppError("Project not found", StatusCodes.NOT_FOUND);
    }

    // Find and verify task
    const task = await Task.findOne({
      _id: taskId,
      project: project._id,
      deletedAt: null,
    });

    if (!task) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }

    // Find the attachment
    const attachment = await Attachment.findOne({
      _id: attachmentId,
      entityType: ATTACHMENT_ENTITY_TYPES.TASK,
      entityId: task._id,
      deletedAt: null,
    });

    if (!attachment) {
      throw new AppError("Attachment not found", StatusCodes.NOT_FOUND);
    }

    // Soft delete the attachment
    attachment.deletedAt = new Date();
    await attachment.save();

    // Note: For production, you might want to also delete the physical file
    // or move it to a "trash" location. For now, we'll keep the file on disk.

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Attachment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download/serve a file
 */
export const downloadFile = async (req, res, next) => {
  try {
    const { filename } = req.params;

    // Security: prevent directory traversal attacks
    const safeFilename = path.basename(filename);
    const filePath = path.join(__dirname, "../../uploads", safeFilename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      throw new AppError("File not found", StatusCodes.NOT_FOUND);
    }

    // Verify the file is associated with a non-deleted attachment
    const attachment = await Attachment.findOne({
      fileName: safeFilename,
      deletedAt: null,
    }).populate({
      path: "entityId",
      populate: {
        path: "project",
        populate: { path: "workspace" },
      },
    });

    if (!attachment) {
      throw new AppError(
        "Attachment not found or has been deleted",
        StatusCodes.NOT_FOUND,
      );
    }

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};
