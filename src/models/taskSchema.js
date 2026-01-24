import mongoose from "mongoose";
import { TASK_STATUSES, TASK_PRIORITIES } from "../constants/index.js";

const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    // Auto-increment per project: PROJ-1, PROJ-2, etc.
    // Combined with project key to form unique identifier
    ticketNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUSES),
      default: TASK_STATUSES.TODO,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITIES),
      default: TASK_PRIORITIES.MEDIUM,
      index: true,
    },
    // Parent task for subtask hierarchy
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    // Reporter/Creator
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Assignees - support multiple assignees
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Labels/Tags for categorization
    labels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
      },
    ],
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    estimatedHours: {
      type: Number,
      default: null,
      min: 0,
    },
    // For ordering tasks within a status column
    order: {
      type: Number,
      default: 0,
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

// Compound index: unique ticket number per project
taskSchema.index({ project: 1, ticketNumber: 1 }, { unique: true });
// Query optimization for common filters
taskSchema.index({ project: 1, status: 1, deletedAt: 1 });
taskSchema.index({ assignees: 1, deletedAt: 1 });
taskSchema.index({ project: 1, parent: 1, deletedAt: 1 }); // For subtasks
// Full-text search on title and description
taskSchema.index({ title: "text", description: "text" });

// Virtual for full ticket identifier (e.g., "PROJ-123")
// Need to populate project to get the key
taskSchema.virtual("ticketId").get(function () {
  return this.populated("project")
    ? `${this.project.key}-${this.ticketNumber}`
    : null;
});

// Auto-increment ticket number before saving new task
taskSchema.pre("save", async function (next) {
  if (this.isNew && !this.ticketNumber) {
    // Find the highest ticket number for this project
    const lastTask = await this.constructor
      .findOne({ project: this.project, deletedAt: null })
      .sort("-ticketNumber")
      .select("ticketNumber");

    this.ticketNumber = lastTask ? lastTask.ticketNumber + 1 : 1;
  }
  next();
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
