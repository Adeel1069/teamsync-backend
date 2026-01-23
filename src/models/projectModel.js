import mongoose from "mongoose";
import { PROJECT_STATUSES } from "../constants/index.js";

const projectSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Project key like "PROJ" for ticket numbering (PROJ-1, PROJ-2, etc.)
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 10,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUSES),
      default: PROJECT_STATUSES.ACTIVE,
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index: unique project key within workspace
projectSchema.index({ workspace: 1, key: 1 }, { unique: true });
// Query optimization
projectSchema.index({ workspace: 1, status: 1, deletedAt: 1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;
