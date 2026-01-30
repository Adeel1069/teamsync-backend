import { StatusCodes } from "http-status-codes";
import Workspace from "../models/workspaceModel.js";
import WorkspaceMember from "../models/workspaceMemberModel.js";
import Label from "../models/labelModel.js";
import Project from "../models/projectModel.js";
import Task from "../models/taskModel.js";
import ActivityLog from "../models/activityLogModel.js";
import Comment from "../models/commentModel.js";
import Attachment from "../models/attachmentModel.js";
import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import {
  WORKSPACE_ROLES,
  DEFAULT_WORKSPACE_LABELS,
} from "../constants/index.js";
import { sendWorkspaceCreatedEmail } from "../utils/sendEmail.js";

/**
 * Create a new workspace
 */
export const createWorkspace = async (req, res, next) => {
  const { name, slug, description, logo } = req.body;
  const userId = req.userId;

  try {
    // Check if this is the user's first workspace
    const existingMemberships = await WorkspaceMember.countDocuments({
      user: userId,
      deletedAt: null,
    });
    const isFirstWorkspace = existingMemberships === 0;

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

    // Send first workspace created email notification (non-blocking)
    if (isFirstWorkspace) {
      const user = await User.findById(userId).select("email firstName");
      if (user) {
        sendWorkspaceCreatedEmail(user.email, user.firstName, workspace.name);
      }
    }

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
 * Get workspace details by ID (Members only)
 */
export const getWorkspaceById = async (req, res, next) => {
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

/**
 * Invite a member to the workspace
 */
export const inviteMember = async (req, res, next) => {
  const { email, role } = req.body;
  const inviterId = req.userId;

  try {
    // req.workspace is already loaded by checkWorkspaceMembership middleware
    const workspace = req.workspace;

    // Find user by email
    const user = await User.findOne({ email, deletedAt: null });

    if (!user) {
      throw new AppError(
        "User with this email does not exist",
        StatusCodes.NOT_FOUND,
      );
    }

    // Check if user is already a member of this workspace
    const existingMembership = await WorkspaceMember.findOne({
      workspace: workspace._id,
      user: user._id,
      deletedAt: null,
    });

    if (existingMembership) {
      throw new AppError(
        "User is already a member of this workspace",
        StatusCodes.CONFLICT,
      );
    }

    // Prevent inviting as owner role
    if (role === WORKSPACE_ROLES.OWNER) {
      throw new AppError(
        "Cannot invite user as owner. A workspace can only have one owner",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Create new workspace membership
    const membership = new WorkspaceMember({
      workspace: workspace._id,
      user: user._id,
      role: role || WORKSPACE_ROLES.MEMBER,
      invitedBy: inviterId,
    });

    await membership.save();

    // Populate user details for response
    await membership.populate("user", "firstName lastName email profileImage");
    await membership.populate("invitedBy", "firstName lastName email");

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Member invited successfully",
      member: {
        id: membership._id,
        user: {
          id: membership.user._id,
          firstName: membership.user.firstName,
          lastName: membership.user.lastName,
          email: membership.user.email,
          profileImage: membership.user.profileImage,
        },
        role: membership.role,
        invitedBy: {
          id: membership.invitedBy._id,
          firstName: membership.invitedBy.firstName,
          lastName: membership.invitedBy.lastName,
          email: membership.invitedBy.email,
        },
        joinedAt: membership.joinedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all members of a workspace (Members only)
 */
export const getWorkspaceMembers = async (req, res, next) => {
  try {
    // req.workspace is already loaded by checkWorkspaceMembership middleware
    const workspace = req.workspace;

    // Find all members of this workspace
    const memberships = await WorkspaceMember.find({
      workspace: workspace._id,
      deletedAt: null,
    })
      .populate("user", "firstName lastName email profileImage")
      .populate("invitedBy", "firstName lastName email")
      .sort({ createdAt: 1 });

    const members = memberships.map((membership) => ({
      id: membership._id,
      user: {
        id: membership.user._id,
        firstName: membership.user.firstName,
        lastName: membership.user.lastName,
        email: membership.user.email,
        profileImage: membership.user.profileImage,
      },
      role: membership.role,
      invitedBy: membership.invitedBy
        ? {
            id: membership.invitedBy._id,
            firstName: membership.invitedBy.firstName,
            lastName: membership.invitedBy.lastName,
            email: membership.invitedBy.email,
          }
        : null,
      joinedAt: membership.joinedAt,
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update member role (Owner & Admin only)
 * @route PATCH /api/workspaces/:slug/members/:memberId
 * @access Private (Owner & Admin only)
 */
export const updateMemberRole = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;
    // Following data already loaded by checkWorkspaceMembership middleware
    const currentUserId = req.userId;
    const currentUserRole = req.workspaceRole;
    const workspace = req.workspace;

    // Find the membership to update
    const membership = await WorkspaceMember.findOne({
      _id: memberId,
      workspace: workspace._id,
      deletedAt: null,
    }).populate("user", "firstName lastName email profileImage");

    if (!membership) {
      throw new AppError("Member not found", StatusCodes.NOT_FOUND);
    }

    // Cannot change owner role
    if (membership.role === WORKSPACE_ROLES.OWNER) {
      throw new AppError(
        "Cannot change the role of workspace owner",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Cannot update to owner role
    if (role === WORKSPACE_ROLES.OWNER) {
      throw new AppError(
        "Cannot promote member to owner role",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Prevent user from changing their own role
    if (membership.user._id.toString() === currentUserId) {
      throw new AppError(
        "Cannot change your own role",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Admin can only update members and viewers, not other admins (unless they're owner)
    if (
      currentUserRole === WORKSPACE_ROLES.ADMIN &&
      membership.role === WORKSPACE_ROLES.ADMIN
    ) {
      throw new AppError(
        "Only workspace owner can change admin roles",
        StatusCodes.FORBIDDEN,
      );
    }

    // Update the role
    membership.role = role;
    await membership.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Member role updated successfully",
      member: {
        id: membership._id,
        user: {
          id: membership.user._id,
          firstName: membership.user.firstName,
          lastName: membership.user.lastName,
          email: membership.user.email,
          profileImage: membership.user.profileImage,
        },
        role: membership.role,
        joinedAt: membership.joinedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove member from workspace (Owner & Admin only)
 */
export const removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    // req.workspace is already loaded by checkWorkspaceMembership middleware
    const currentUserId = req.userId;
    const currentUserRole = req.workspaceRole;
    const workspace = req.workspace;

    // Find the membership to remove
    const membership = await WorkspaceMember.findOne({
      _id: memberId,
      workspace: workspace._id,
      deletedAt: null,
    });

    if (!membership) {
      throw new AppError("Member not found", StatusCodes.NOT_FOUND);
    }

    // Cannot remove workspace owner
    if (membership.role === WORKSPACE_ROLES.OWNER) {
      throw new AppError(
        "Cannot remove workspace owner",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Prevent user from removing themselves (use leave endpoint instead)
    if (membership.user.toString() === currentUserId) {
      throw new AppError(
        "Cannot remove yourself. Use leave endpoint instead",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Admin can only remove members and viewers, not other admins (unless they're owner)
    if (
      currentUserRole === WORKSPACE_ROLES.ADMIN &&
      membership.role === WORKSPACE_ROLES.ADMIN
    ) {
      throw new AppError(
        "Only workspace owner can remove admins",
        StatusCodes.FORBIDDEN,
      );
    }

    // Soft delete the membership
    membership.deletedAt = new Date();
    await membership.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Leave workspace (All members except owner)
 */
export const leaveWorkspace = async (req, res, next) => {
  try {
    // req.workspace is already loaded by checkWorkspaceMembership middleware
    const workspace = req.workspace;
    const userId = req.userId;
    const userRole = req.workspaceRole;

    // Owner cannot leave their own workspace
    if (userRole === WORKSPACE_ROLES.OWNER) {
      throw new AppError(
        "Workspace owner cannot leave. Delete the workspace instead or transfer ownership first",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Find user's membership
    const membership = await WorkspaceMember.findOne({
      workspace: workspace._id,
      user: userId,
      deletedAt: null,
    });

    if (!membership) {
      throw new AppError(
        "Membership not found",
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    // Soft delete the membership
    membership.deletedAt = new Date();
    await membership.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Successfully left the workspace",
    });
  } catch (error) {
    next(error);
  }
};
