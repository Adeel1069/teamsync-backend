import { StatusCodes } from "http-status-codes";
import Comment from "../models/commentModel.js";
import Task from "../models/taskModel.js";
import Project from "../models/projectModel.js";
import AppError from "../utils/AppError.js";

/**
 * Create a new comment on a task
 */
export const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { projectId, taskId } = req.params;
    const userId = req.userId;
    const workspace = req.workspace;

    // Verify project exists and belongs to the workspace
    const project = await Project.findOne({
      _id: projectId,
      workspace: workspace._id,
      deletedAt: null,
    });

    if (!project) {
      throw new AppError("Project not found", StatusCodes.NOT_FOUND);
    }

    // Verify task exists and belongs to the project
    const task = await Task.findOne({
      _id: taskId,
      project: project._id,
      deletedAt: null,
    });

    if (!task) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }

    // Create new comment
    const comment = new Comment({
      task: task._id,
      author: userId,
      content,
    });

    await comment.save();

    // Populate author details
    await comment.populate("author", "firstName lastName email profileImage");

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Comment created successfully",
      comment: {
        id: comment._id,
        task: comment.task,
        author: {
          id: comment.author._id,
          firstName: comment.author.firstName,
          lastName: comment.author.lastName,
          email: comment.author.email,
          profileImage: comment.author.profileImage,
        },
        content: comment.content,
        isEdited: comment.isEdited,
        editedAt: comment.editedAt,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all comments for a task
 */
export const getTaskComments = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const workspace = req.workspace;

    // Verify project exists and belongs to the workspace
    const project = await Project.findOne({
      _id: projectId,
      workspace: workspace._id,
      deletedAt: null,
    });

    if (!project) {
      throw new AppError("Project not found", StatusCodes.NOT_FOUND);
    }

    // Verify task exists and belongs to the project
    const task = await Task.findOne({
      _id: taskId,
      project: project._id,
      deletedAt: null,
    });

    if (!task) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }

    // Get all comments for this task (sorted chronologically)
    const comments = await Comment.find({
      task: task._id,
      deletedAt: null,
    })
      .populate("author", "firstName lastName email profileImage")
      .sort({ createdAt: 1 }); // Oldest first

    const commentsWithDetails = comments.map((comment) => ({
      id: comment._id,
      task: comment.task,
      author: {
        id: comment.author._id,
        firstName: comment.author.firstName,
        lastName: comment.author.lastName,
        email: comment.author.email,
        profileImage: comment.author.profileImage,
      },
      content: comment.content,
      isEdited: comment.isEdited,
      editedAt: comment.editedAt,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      count: commentsWithDetails.length,
      comments: commentsWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a comment
 */
export const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { projectId, taskId, commentId } = req.params;
    const userId = req.userId;
    const workspace = req.workspace;

    // Verify project exists and belongs to the workspace
    const project = await Project.findOne({
      _id: projectId,
      workspace: workspace._id,
      deletedAt: null,
    });

    if (!project) {
      throw new AppError("Project not found", StatusCodes.NOT_FOUND);
    }

    // Verify task exists and belongs to the project
    const task = await Task.findOne({
      _id: taskId,
      project: project._id,
      deletedAt: null,
    });

    if (!task) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }

    // Find the comment
    const comment = await Comment.findOne({
      _id: commentId,
      task: task._id,
      deletedAt: null,
    });

    if (!comment) {
      throw new AppError("Comment not found", StatusCodes.NOT_FOUND);
    }

    // Check if user is the author of the comment
    if (comment.author.toString() !== userId.toString()) {
      throw new AppError(
        "Access denied. You can only edit your own comments",
        StatusCodes.FORBIDDEN,
      );
    }

    // Update the comment
    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();

    // Populate author details
    await comment.populate("author", "firstName lastName email profileImage");

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Comment updated successfully",
      comment: {
        id: comment._id,
        task: comment.task,
        author: {
          id: comment.author._id,
          firstName: comment.author.firstName,
          lastName: comment.author.lastName,
          email: comment.author.email,
          profileImage: comment.author.profileImage,
        },
        content: comment.content,
        isEdited: comment.isEdited,
        editedAt: comment.editedAt,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a comment (soft delete)
 */
export const deleteComment = async (req, res, next) => {
  try {
    const { projectId, taskId, commentId } = req.params;
    const userId = req.userId;
    const workspace = req.workspace;
    const workspaceRole = req.workspaceRole;

    // Verify project exists and belongs to the workspace
    const project = await Project.findOne({
      _id: projectId,
      workspace: workspace._id,
      deletedAt: null,
    });

    if (!project) {
      throw new AppError("Project not found", StatusCodes.NOT_FOUND);
    }

    // Verify task exists and belongs to the project
    const task = await Task.findOne({
      _id: taskId,
      project: project._id,
      deletedAt: null,
    });

    if (!task) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }

    // Find the comment
    const comment = await Comment.findOne({
      _id: commentId,
      task: task._id,
      deletedAt: null,
    });

    if (!comment) {
      throw new AppError("Comment not found", StatusCodes.NOT_FOUND);
    }

    // Check permissions: author can delete their own comment, or admin/owner can delete any comment
    const isAuthor = comment.author.toString() === userId.toString();
    const isAdminOrOwner = ["owner", "admin"].includes(workspaceRole);

    if (!isAuthor && !isAdminOrOwner) {
      throw new AppError(
        "Access denied. You can only delete your own comments or be an admin/owner",
        StatusCodes.FORBIDDEN,
      );
    }

    // Soft delete the comment
    comment.deletedAt = new Date();
    await comment.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
