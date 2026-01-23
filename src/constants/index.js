// Fixed task statuses used across all projects
export const TASK_STATUSES = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done",
};

// Task status metadata for display
export const TASK_STATUS_INFO = {
  [TASK_STATUSES.TODO]: {
    label: "To Do",
    color: "#6b7280", // gray
    isClosed: false,
  },
  [TASK_STATUSES.IN_PROGRESS]: {
    label: "In Progress",
    color: "#3b82f6", // blue
    isClosed: false,
  },
  [TASK_STATUSES.REVIEW]: {
    label: "Review",
    color: "#f59e0b", // yellow
    isClosed: false,
  },
  [TASK_STATUSES.DONE]: {
    label: "Done",
    color: "#10b981", // green
    isClosed: true,
  },
};

// Task priorities
export const TASK_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

// Project statuses
export const PROJECT_STATUSES = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  ON_HOLD: "on-hold",
};

// Workspace member roles
export const WORKSPACE_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
  VIEWER: "viewer",
};

// Activity log actions
export const ACTIVITY_ACTIONS = {
  CREATED: "created",
  UPDATED: "updated",
  DELETED: "deleted",
  STATUS_CHANGED: "status_changed",
  // Future: ASSIGNED, UNASSIGNED, PRIORITY_CHANGED, COMMENTED, ATTACHED
};

// Activity log entity types
export const ACTIVITY_ENTITY_TYPES = {
  WORKSPACE: "Workspace",
  PROJECT: "Project",
  TASK: "Task",
  COMMENT: "Comment",
  ATTACHMENT: "Attachment",
};

// Attachment entity types
export const ATTACHMENT_ENTITY_TYPES = {
  PROJECT: "Project",
  TASK: "Task",
  COMMENT: "Comment",
};

// Default labels for workspace creation
export const DEFAULT_WORKSPACE_LABELS = [
  {
    name: "bug",
    color: "#ef4444", // red
    description: "Something isn't working",
  },
  {
    name: "feature",
    color: "#3b82f6", // blue
    description: "New feature or request",
  },
  {
    name: "enhancement",
    color: "#10b981", // green
    description: "Improvement to existing feature",
  },
  {
    name: "documentation",
    color: "#8b5cf6", // purple
    description: "Documentation related",
  },
];
