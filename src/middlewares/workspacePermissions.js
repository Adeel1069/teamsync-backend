import { StatusCodes } from "http-status-codes";
import Workspace from "../models/workspaceModel.js";
import WorkspaceMember from "../models/workspaceMemberSchema.js";
import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import { WORKSPACE_ROLES } from "../constants/index.js";

/**
 * Middleware to check if the authenticated user is a super admin
 * Super admin has access to all workspaces for system maintenance
 * Must be used AFTER auth middleware
 */
export const checkSuperAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("+isSuperAdmin");

    if (!user || user.isSuperAdmin !== true) {
      throw new AppError(
        "Access denied. This action requires super admin privileges",
        StatusCodes.FORBIDDEN,
      );
    }

    req.isSuperAdmin = true;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if the authenticated user is a member of the workspace
 * Attaches workspace and membership info to req.workspace and req.membership
 */
export const checkWorkspaceMembership = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.userId;

    // Check is slug is provided
    if (!slug) {
      throw new AppError("slug is required", StatusCodes.BAD_REQUEST);
    }

    // Find the workspace by slug
    const workspace = await Workspace.findOne({
      slug: slug,
      deletedAt: null,
    });

    if (!workspace) {
      throw new AppError("Workspace not found", StatusCodes.NOT_FOUND);
    }

    // Check if user is a member of this workspace
    const membership = await WorkspaceMember.findOne({
      workspace: workspace._id,
      user: userId,
      deletedAt: null,
    });

    if (!membership) {
      throw new AppError(
        "Access denied. You are not a member of this workspace",
        StatusCodes.FORBIDDEN,
      );
    }

    // Attach workspace and membership to request for downstream use
    req.workspace = workspace;
    req.membership = membership;
    req.workspaceId = workspace._id;
    req.workspaceRole = membership.role;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has specific role(s) in the workspace
 * Must be used AFTER checkWorkspaceMembership middleware
 * @param {...string} allowedRoles - Array of allowed roles (e.g., 'owner', 'admin')
 * @returns {Function} Middleware function
 *
 * @example
 * router.delete('/:slug', auth, checkWorkspaceMembership, checkWorkspaceRole('owner', 'admin'), deleteWorkspace)
 */
export const checkWorkspaceRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ensure membership was already checked
      if (!req.workspaceRole) {
        throw new AppError(
          "Workspace membership must be verified first",
          StatusCodes.INTERNAL_SERVER_ERROR,
        );
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.workspaceRole)) {
        throw new AppError(
          `Access denied. This action requires one of these roles: ${allowedRoles.join(", ")}`,
          StatusCodes.FORBIDDEN,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user can create projects in the workspace
 * Based on workspace settings and user role
 * Must be used AFTER checkWorkspaceMembership middleware
 * @example
 * router.post('/:slug/projects', auth, checkWorkspaceMembership, checkProjectCreationPermission, createProject)
 */
export const checkProjectCreationPermission = (req, res, next) => {
  try {
    // Ensure workspace was already loaded
    if (!req.workspace || !req.workspaceRole) {
      throw new AppError(
        "Workspace membership must be verified first",
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    const { workspaceRole, workspace } = req;

    // Owners and admins can always create projects
    if (
      workspaceRole === WORKSPACE_ROLES.OWNER ||
      workspaceRole === WORKSPACE_ROLES.ADMIN
    ) {
      return next();
    }

    // Check workspace settings for member project creation permission
    if (
      workspaceRole === WORKSPACE_ROLES.MEMBER &&
      workspace.settings?.allowMemberProjectCreation === true
    ) {
      return next();
    }

    // Viewers and members (without permission) cannot create projects
    throw new AppError(
      "Access denied. You do not have permission to create projects in this workspace",
      StatusCodes.FORBIDDEN,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Helper middleware to check if user is workspace owner
 * Shorthand for checkWorkspaceRole('owner')
 * Must be used AFTER checkWorkspaceMembership middleware
 */
export const checkWorkspaceOwner = checkWorkspaceRole(WORKSPACE_ROLES.OWNER);

/**
 * Helper middleware to check if user is workspace owner or admin
 * Shorthand for checkWorkspaceRole('owner', 'admin')
 * Must be used AFTER checkWorkspaceMembership middleware
 */
export const checkWorkspaceAdmin = checkWorkspaceRole(
  WORKSPACE_ROLES.OWNER,
  WORKSPACE_ROLES.ADMIN,
);

/**
 * Middleware to check if user can modify workspace settings
 * Only owners and admins can modify workspace settings
 * Must be used AFTER checkWorkspaceMembership middleware
 */
export const checkWorkspaceModifyPermission = checkWorkspaceRole(
  WORKSPACE_ROLES.OWNER,
  WORKSPACE_ROLES.ADMIN,
);

/**
 * Middleware to check if user can invite members to workspace
 * Only owners and admins can invite members
 * Must be used AFTER checkWorkspaceMembership middleware
 */
export const checkMemberInvitePermission = checkWorkspaceRole(
  WORKSPACE_ROLES.OWNER,
  WORKSPACE_ROLES.ADMIN,
);

/**
 * Middleware to check if user can manage workspace members (change roles, remove)
 * Only owners and admins can manage members
 * Must be used AFTER checkWorkspaceMembership middleware
 */
export const checkMemberManagePermission = checkWorkspaceRole(
  WORKSPACE_ROLES.OWNER,
  WORKSPACE_ROLES.ADMIN,
);

/**
 * Middleware to check if user can create tasks in the workspace
 * Owner, Admin, and Member can create tasks
 * Viewer cannot create tasks (read-only access)
 * Must be used AFTER checkWorkspaceMembership middleware
 *
 * @example
 * router.post('/:slug/projects/:projectKey/tasks', auth, checkWorkspaceMembership, checkTaskCreationPermission, createTask)
 */
export const checkTaskCreationPermission = (req, res, next) => {
  try {
    // Ensure workspace was already loaded
    if (!req.workspaceRole) {
      throw new AppError(
        "Workspace membership must be verified first",
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    const { workspaceRole } = req;

    // Owner, Admin, and Member can create tasks
    const allowedRoles = [
      WORKSPACE_ROLES.OWNER,
      WORKSPACE_ROLES.ADMIN,
      WORKSPACE_ROLES.MEMBER,
    ];

    if (!allowedRoles.includes(workspaceRole)) {
      throw new AppError(
        "Access denied. Viewers cannot create tasks (read-only access)",
        StatusCodes.FORBIDDEN,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
