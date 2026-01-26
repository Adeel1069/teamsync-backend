import { StatusCodes } from "http-status-codes";
import Workspace from "../models/workspaceModel.js";
import WorkspaceMember from "../models/workspaceMemberSchema.js";
import Label from "../models/labelModel.js";
import Project from "../models/projectModel.js";
import Task from "../models/taskSchema.js";
import ActivityLog from "../models/activityLogModel.js";
import Comment from "../models/commentModel.js";
import Attachment from "../models/attachmentModel.js";
import AppError from "../utils/AppError.js";
import {
  WORKSPACE_ROLES,
  DEFAULT_WORKSPACE_LABELS,
} from "../constants/index.js";

/**
 * Create a new workspace
 */
export const createWorkspace = async (req, res, next) => {
  const { name, slug, description, logo } = req.body;
  const userId = req.userId;

  try {
    const workspaceData = {
      name,
      description,
      logo,
      owner: userId,
    };

    // If slug is provided, ensure it's unique
    // If not provided, pre-save hook will generate it
    if (slug) {
      workspaceData.slug = await Workspace.findAvailableSlug(slug);
    }

    const workspace = new Workspace(workspaceData);

    await workspace.save();

    const membership = new WorkspaceMember({
      workspace: workspace._id,
      user: userId,
      role: WORKSPACE_ROLES.OWNER, // Add creator as workspace owner in WorkspaceMember
      invitedBy: null, // Creator is not invited by anyone
    });

    await membership.save();

    // Create default labels for the workspace
    const defaultLabels = DEFAULT_WORKSPACE_LABELS.map((label) => ({
      workspace: workspace._id,
      name: label.name,
      color: label.color,
      description: label.description,
    }));

    await Label.insertMany(defaultLabels);

    // Send response
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Workspace created successfully",
      workspace: {
        id: workspace._id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        logo: workspace.logo,
        owner: workspace.owner,
        settings: workspace.settings,
        createdAt: workspace.createdAt,
      },
    });
  } catch (error) {
    // Handle duplicate slug error
    if (error.code === 11000 && error.keyPattern?.slug) {
      return next(
        new AppError(
          "Workspace with this slug already exists",
          StatusCodes.CONFLICT,
        ),
      );
    }
    next(error);
  }
};

/**
 * Get all workspaces (Super Admin only)
 */
export const getAllWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({ deletedAt: null })
      .populate("owner", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      count: workspaces.length,
      workspaces,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get workspaces where the authenticated user is a member
 */
export const getMyWorkspaces = async (req, res, next) => {
  const userId = req.userId;

  try {
    // Find all workspace memberships for the user
    const memberships = await WorkspaceMember.find({
      user: userId,
      deletedAt: null,
    })
      .populate({
        path: "workspace",
        match: { deletedAt: null },
        select: "name slug description logo owner settings createdAt",
      })
      .sort({ createdAt: -1 });

    // Filter out null workspaces (soft deleted) and format response
    const workspaces = memberships
      .filter((membership) => membership.workspace !== null)
      .map((membership) => ({
        id: membership.workspace._id,
        name: membership.workspace.name,
        slug: membership.workspace.slug,
        description: membership.workspace.description,
        logo: membership.workspace.logo,
        owner: membership.workspace.owner,
        settings: membership.workspace.settings,
        role: membership.role,
        joinedAt: membership.joinedAt,
        createdAt: membership.workspace.createdAt,
      }));

    res.status(StatusCodes.OK).json({
      success: true,
      count: workspaces.length,
      workspaces,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get workspace details by slug (Members only)
 */
export const getWorkspaceBySlug = async (req, res, next) => {
  try {
    // req.workspace is already loaded by checkWorkspaceMembership middleware
    // req.workspaceRole contains the user's role in the workspace
    const workspace = req.workspace;
    const userRole = req.workspaceRole;

    // Populate owner details
    await workspace.populate("owner", "firstName lastName email profileImage");

    res.status(StatusCodes.OK).json({
      success: true,
      workspace: {
        id: workspace._id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        logo: workspace.logo,
        owner: workspace.owner,
        settings: workspace.settings,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        userRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update workspace details (Owner & Admin only)
 * @route PATCH /api/workspaces/:slug
 * @access Private (Owner & Admin only)
 */
export const updateWorkspace = async (req, res, next) => {
  const { name, description, logo, settings } = req.body;

  try {
    // req.workspace is already loaded by checkWorkspaceMembership middleware
    const workspace = req.workspace;

    // Update fields if provided
    if (name !== undefined) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    if (logo !== undefined) workspace.logo = logo;
    if (settings?.allowMemberProjectCreation !== undefined) {
      workspace.settings.allowMemberProjectCreation =
        settings.allowMemberProjectCreation;
    }

    await workspace.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Workspace updated successfully",
      workspace: {
        id: workspace._id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        logo: workspace.logo,
        owner: workspace.owner,
        settings: workspace.settings,
        updatedAt: workspace.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete workspace (soft delete with cascading) (Owner & Admin only)
 * @route DELETE /api/workspaces/:slug
 * @access Private (Owner & Admin only)
 */
export const deleteWorkspace = async (req, res, next) => {
  try {
    // req.workspace is already loaded by checkWorkspaceMembership middleware
    const workspace = req.workspace;
    const deletedAt = new Date();

    // Soft delete workspace
    workspace.deletedAt = deletedAt;
    await workspace.save();

    // Cascading soft delete all related entities
    await Promise.all([
      // Delete all workspace members
      WorkspaceMember.updateMany(
        { workspace: workspace._id, deletedAt: null },
        { deletedAt },
      ),

      // Delete all labels in this workspace
      Label.updateMany(
        { workspace: workspace._id, deletedAt: null },
        { deletedAt },
      ),

      // Delete all projects in this workspace
      Project.updateMany(
        { workspace: workspace._id, deletedAt: null },
        { deletedAt },
      ),

      // Delete all activity logs in this workspace
      ActivityLog.updateMany(
        { workspace: workspace._id, deletedAt: null },
        { deletedAt },
      ),
    ]);

    // Get all projects in this workspace to cascade delete tasks, comments, attachments
    const projects = await Project.find({
      workspace: workspace._id,
    }).select("_id");

    const projectIds = projects.map((p) => p._id);

    if (projectIds.length > 0) {
      // Get all tasks in these projects
      const tasks = await Task.find({
        project: { $in: projectIds },
      }).select("_id");

      const taskIds = tasks.map((t) => t._id);

      await Promise.all([
        // Delete all tasks in these projects
        Task.updateMany(
          { project: { $in: projectIds }, deletedAt: null },
          { deletedAt },
        ),

        // Delete all comments on these tasks
        taskIds.length > 0
          ? Comment.updateMany(
              { task: { $in: taskIds }, deletedAt: null },
              { deletedAt },
            )
          : Promise.resolve(),

        // Delete all attachments in this workspace
        Attachment.updateMany(
          { workspace: workspace._id, deletedAt: null },
          { deletedAt },
        ),
      ]);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Workspace and all related data deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
