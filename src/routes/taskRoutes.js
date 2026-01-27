import express from "express";
import {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import {
  createTaskValidation,
  updateTaskValidation,
} from "../validators/taskValidators.js";
import auth from "../middlewares/auth.js";
import {
  checkWorkspaceMembership,
  checkTaskCreationPermission,
  checkWorkspaceAdmin,
} from "../middlewares/workspacePermissions.js";

const router = express.Router();

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects/{projectId}/tasks:
 *   post:
 *     summary: Create a new task in the project
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a1
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: Implement user authentication
 *               description:
 *                 type: string
 *                 maxLength: 5000
 *                 example: Add JWT-based authentication system with refresh tokens
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, review, done]
 *                 default: todo
 *                 example: todo
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *                 example: high
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d5ec49f1b2c8b1f8e4e1a3"]
 *                 description: Array of user IDs to assign the task to
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-02-15
 *               estimatedHours:
 *                 type: number
 *                 minimum: 0
 *                 example: 8
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Task created successfully
 *                 task:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     ticketId:
 *                       type: string
 *                       example: MAD-1
 *                       description: Human-readable ticket identifier (projectKey-ticketNumber)
 *                     ticketNumber:
 *                       type: integer
 *                       example: 1
 *                     project:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         key:
 *                           type: string
 *                         name:
 *                           type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                     priority:
 *                       type: string
 *                     reporter:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                     assignees:
 *                       type: array
 *                       items:
 *                         type: object
 *                     dueDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     estimatedHours:
 *                       type: number
 *                       nullable: true
 *                     order:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (Viewers cannot create tasks)
 *       404:
 *         description: Project not found
 */

/**
 * @route   POST /api/workspaces/:workspaceId/projects/:projectId/tasks
 * @desc    Create a new task in the project
 * @access  Private (Owner, Admin, Member only - not Viewer)
 */
router.post(
  "/:workspaceId/projects/:projectId/tasks",
  auth,
  checkWorkspaceMembership,
  checkTaskCreationPermission,
  createTaskValidation,
  createTask,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects/{projectId}/tasks:
 *   get:
 *     summary: Get all tasks in a project
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a1
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a2
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, review, done]
 *         description: Filter tasks by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter tasks by priority
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *         description: Filter tasks by assignee user ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search tasks by title and description
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       ticketId:
 *                         type: string
 *                         example: MAD-1
 *                       ticketNumber:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       reporter:
 *                         type: object
 *                       assignees:
 *                         type: array
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                       estimatedHours:
 *                         type: number
 *                       order:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a member of this workspace
 *       404:
 *         description: Project not found
 */

/**
 * @route   GET /api/workspaces/:workspaceId/projects/:projectId/tasks
 * @desc    Get all tasks in a project
 * @access  Private (All workspace members)
 */
router.get(
  "/:workspaceId/projects/:projectId/tasks",
  auth,
  checkWorkspaceMembership,
  getProjectTasks,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a1
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a2
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a5
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 task:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     ticketId:
 *                       type: string
 *                       example: MAD-1
 *                     ticketNumber:
 *                       type: integer
 *                     project:
 *                       type: object
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                     priority:
 *                       type: string
 *                     reporter:
 *                       type: object
 *                     assignees:
 *                       type: array
 *                     dueDate:
 *                       type: string
 *                     estimatedHours:
 *                       type: number
 *                     order:
 *                       type: integer
 *                     commentCount:
 *                       type: integer
 *                     attachmentCount:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a member of this workspace
 *       404:
 *         description: Project or task not found
 */

/**
 * @route   GET /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId
 * @desc    Get a single task by ID
 * @access  Private (All workspace members)
 */
router.get(
  "/:workspaceId/projects/:projectId/tasks/:taskId",
  auth,
  checkWorkspaceMembership,
  getTaskById,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a1
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a2
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: Implement OAuth2 authentication
 *               description:
 *                 type: string
 *                 maxLength: 5000
 *                 example: Updated description with more details
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, review, done]
 *                 example: in_progress
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: urgent
 *               assignees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d5ec49f1b2c8b1f8e4e1a3", "60d5ec49f1b2c8b1f8e4e1a6"]
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-03-01
 *               estimatedHours:
 *                 type: number
 *                 minimum: 0
 *                 example: 12
 *               order:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Task updated successfully
 *                 task:
 *                   type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (Viewers cannot update tasks)
 *       404:
 *         description: Project or task not found
 */

/**
 * @route   PATCH /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId
 * @desc    Update a task
 * @access  Private (Owner, Admin, Member only - not Viewer)
 */
router.patch(
  "/:workspaceId/projects/:projectId/tasks/:taskId",
  auth,
  checkWorkspaceMembership,
  checkTaskCreationPermission,
  updateTaskValidation,
  updateTask,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task (soft delete with cascading)
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a1
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a2
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a5
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Task and all related data deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (requires owner or admin role)
 *       404:
 *         description: Project or task not found
 */

/**
 * @route   DELETE /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId
 * @desc    Delete a task (soft delete with cascading to comments and attachments)
 * @access  Private (Owner & Admin only)
 */
router.delete(
  "/:workspaceId/projects/:projectId/tasks/:taskId",
  auth,
  checkWorkspaceMembership,
  checkWorkspaceAdmin,
  deleteTask,
);

export default router;
