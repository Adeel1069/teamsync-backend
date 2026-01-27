import express from "express";
import {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import {
  createCommentValidation,
  updateCommentValidation,
} from "../validators/commentValidators.js";
import auth from "../middlewares/auth.js";
import { checkWorkspaceMembership } from "../middlewares/workspacePermissions.js";

const router = express.Router();

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/comments:
 *   post:
 *     summary: Create a new comment on a task
 *     tags: [Comments]
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
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5000
 *                 example: This looks good! Let's proceed with this approach.
 *     responses:
 *       201:
 *         description: Comment created successfully
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
 *                   example: Comment created successfully
 *                 comment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     task:
 *                       type: string
 *                     author:
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
 *                     content:
 *                       type: string
 *                     isEdited:
 *                       type: boolean
 *                       example: false
 *                     editedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
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
 *         description: Not a member of this workspace
 *       404:
 *         description: Project or task not found
 */

/**
 * @route   POST /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/comments
 * @desc    Create a new comment on a task
 * @access  Private (All workspace members)
 */
router.post(
  "/:workspaceId/projects/:projectId/tasks/:taskId/comments",
  auth,
  checkWorkspaceMembership,
  createCommentValidation,
  createComment,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/comments:
 *   get:
 *     summary: Get all comments for a task
 *     tags: [Comments]
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
 *         description: List of comments
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
 *                   example: 5
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       task:
 *                         type: string
 *                       author:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           profileImage:
 *                             type: string
 *                       content:
 *                         type: string
 *                       isEdited:
 *                         type: boolean
 *                       editedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a member of this workspace
 *       404:
 *         description: Project or task not found
 */

/**
 * @route   GET /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/comments
 * @desc    Get all comments for a task
 * @access  Private (All workspace members)
 */
router.get(
  "/:workspaceId/projects/:projectId/tasks/:taskId/comments",
  auth,
  checkWorkspaceMembership,
  getTaskComments,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/comments/{commentId}:
 *   patch:
 *     summary: Update a comment
 *     tags: [Comments]
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
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a6
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5000
 *                 example: Updated comment with additional information.
 *     responses:
 *       200:
 *         description: Comment updated successfully
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
 *                   example: Comment updated successfully
 *                 comment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     task:
 *                       type: string
 *                     author:
 *                       type: object
 *                     content:
 *                       type: string
 *                     isEdited:
 *                       type: boolean
 *                       example: true
 *                     editedAt:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (can only edit own comments)
 *       404:
 *         description: Project, task, or comment not found
 */

/**
 * @route   PATCH /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/comments/:commentId
 * @desc    Update a comment (only comment author)
 * @access  Private (Comment author only)
 */
router.patch(
  "/:workspaceId/projects/:projectId/tasks/:taskId/comments/:commentId",
  auth,
  checkWorkspaceMembership,
  updateCommentValidation,
  updateComment,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment (soft delete)
 *     tags: [Comments]
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
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a6
 *     responses:
 *       200:
 *         description: Comment deleted successfully
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
 *                   example: Comment deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (can only delete own comments or be admin/owner)
 *       404:
 *         description: Project, task, or comment not found
 */

/**
 * @route   DELETE /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/comments/:commentId
 * @desc    Delete a comment (soft delete)
 * @access  Private (Comment author or workspace admin/owner)
 */
router.delete(
  "/:workspaceId/projects/:projectId/tasks/:taskId/comments/:commentId",
  auth,
  checkWorkspaceMembership,
  deleteComment,
);

export default router;
