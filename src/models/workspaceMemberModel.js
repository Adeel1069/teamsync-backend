// Separate collection for workspace membership and roles
// Separated it to implements a many-to-many relationship
import mongoose from "mongoose";
import { WORKSPACE_ROLES } from "../constants/index.js";

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(WORKSPACE_ROLES),
      default: WORKSPACE_ROLES.MEMBER,
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Compound index: ensure one user can't have multiple active memberships in same workspace
workspaceMemberSchema.index(
  { workspace: 1, user: 1, deletedAt: 1 },
  { unique: true },
);
// Query optimization for finding all members of a workspace
workspaceMemberSchema.index({ workspace: 1, deletedAt: 1 });
// Query optimization for finding all workspaces of a user
workspaceMemberSchema.index({ user: 1, deletedAt: 1 });

const WorkspaceMember = mongoose.model(
  "WorkspaceMember",
  workspaceMemberSchema,
);

export default WorkspaceMember;
