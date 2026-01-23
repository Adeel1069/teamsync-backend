import mongoose from "mongoose";
import {
  ACTIVITY_ENTITY_TYPES,
  ACTIVITY_ACTIONS,
} from "../constants/index.js";

const activityLogSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    // Which project (optional, some actions are workspace-level)
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },
    // User who performed the action
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Entity that was affected
    entityType: {
      type: String,
      enum: Object.values(ACTIVITY_ENTITY_TYPES),
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(ACTIVITY_ACTIONS),
      required: true,
      index: true,
    },
    // Store what changed (for updates)
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {}, // Example: { status: { from: 'To Do', to: 'In Progress' } }
    },
    // Optional description for human-readable activity
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Optimize queries for activity feeds
activityLogSchema.index({ workspace: 1, createdAt: -1 });
activityLogSchema.index({ project: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

// TTL index: auto-delete old logs after certain period (optional)
// activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 1 year

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
