import mongoose from "mongoose";
import { PROJECT_STATUSES } from "../constants/index.js";

const projectSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Project key like "PROJ" for ticket numbering (PROJ-1, PROJ-2, etc.)
    // Auto-generated from project name
    key: {
      type: String,
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

/**
 * Generate a project key from project name
 */
projectSchema.statics.generateKeyFromName = function (name) {
  // Remove special characters and split into words
  const words = name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/);

  if (words.length === 0) {
    return "PROJ";
  }

  // Generate key based on number of words
  if (words.length === 1) {
    // "MOBILE" -> "MOB"
    return words[0].substring(0, 3);
  } else {
    // "Website Redesign" -> "WR" OR "Mobile App Development" -> "MAD"
    return words
      .map((word) => word[0])
      .join("")
      .substring(0, 4);
  }
};

/**
 * Generate a unique project key for a workspace
 * Handles collisions by appending numbers (WR, WR1, WR2, etc.)
 */
projectSchema.statics.generateUniqueKey = async function (name, workspaceId) {
  const baseKey = this.generateKeyFromName(name);
  let key = baseKey;
  let counter = 0;

  // Check if key exists in workspace (including soft-deleted projects to avoid confusion)
  while (true) {
    const existing = await this.findOne({
      workspace: workspaceId,
      key: key,
    });

    if (!existing) {
      return key;
    }

    // Key exists, try with counter
    counter++;
    key = `${baseKey}${counter}`;

    // Safety limit to prevent infinite loop
    if (counter > 999) {
      throw new Error(
        "Unable to generate unique project key after 999 attempts",
      );
    }
  }
};

// Pre-save hook to auto-generate key if not provided
projectSchema.pre("save", async function (next) {
  if (this.isNew && !this.key) {
    this.key = await this.constructor.generateUniqueKey(
      this.name,
      this.workspace,
    );
  }
  next();
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
