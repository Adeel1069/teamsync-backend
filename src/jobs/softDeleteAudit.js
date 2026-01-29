import { CRON_SOFT_DELETE_AUDIT_SCHEDULE } from "../config/envConfig.js";
import logger from "../utils/logger.js";

// Import all models with soft delete
import User from "../models/userModel.js";
import Workspace from "../models/workspaceModel.js";
import WorkspaceMember from "../models/workspaceMemberModel.js";
import Project from "../models/projectModel.js";
import Task from "../models/taskModel.js";
import Comment from "../models/commentModel.js";
import Attachment from "../models/attachmentModel.js";
import Label from "../models/labelModel.js";

const log = logger.child("CRON:SOFT_DELETE_AUDIT");

/**
 * Soft Delete Audit Job
 *
 * This job simply counts how many records are soft-deleted
 * in each model and logs the results.
 */
const handler = async () => {
  log.info("Starting soft-delete audit...");

  // Count soft-deleted records for each model
  const usersCount = await User.countDocuments({ deletedAt: { $ne: null } });
  const workspacesCount = await Workspace.countDocuments({
    deletedAt: { $ne: null },
  });
  const membersCount = await WorkspaceMember.countDocuments({
    deletedAt: { $ne: null },
  });
  const projectsCount = await Project.countDocuments({
    deletedAt: { $ne: null },
  });
  const tasksCount = await Task.countDocuments({ deletedAt: { $ne: null } });
  const commentsCount = await Comment.countDocuments({
    deletedAt: { $ne: null },
  });
  const attachmentsCount = await Attachment.countDocuments({
    deletedAt: { $ne: null },
  });
  const labelsCount = await Label.countDocuments({ deletedAt: { $ne: null } });

  // Calculate total
  const total =
    usersCount +
    workspacesCount +
    membersCount +
    projectsCount +
    tasksCount +
    commentsCount +
    attachmentsCount +
    labelsCount;

  // Print a simple summary to console
  console.log(`
  ========================================
         SOFT-DELETE AUDIT REPORT
  ========================================
  Total soft-deleted records: ${total}

  - Users: ${usersCount}
  - Workspaces: ${workspacesCount}
  - Members: ${membersCount}
  - Projects: ${projectsCount}
  - Tasks: ${tasksCount}
  - Comments: ${commentsCount}
  - Attachments: ${attachmentsCount}
  - Labels: ${labelsCount}
  ========================================
  `);
};

/**
 * Job Configuration
 */
const softDeleteAuditJob = {
  name: "soft-delete-audit",
  schedule: CRON_SOFT_DELETE_AUDIT_SCHEDULE,
  handler,
  enabled: true,
  timezone: "UTC",
};

export default softDeleteAuditJob;
