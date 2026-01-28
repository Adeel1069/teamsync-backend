import express from "express";
import {
  uploadTaskAttachment,
  getTaskAttachments,
  deleteTaskAttachment,
  downloadFile,
} from "../controllers/attachmentController.js";
import {
  uploadAttachmentValidation,
  getAttachmentsValidation,
  deleteAttachmentValidation,
} from "../validators/attachmentValidators.js";
import auth from "../middlewares/auth.js";
import {
  checkWorkspaceMembership,
  checkTaskCreationPermission,
} from "../middlewares/workspacePermissions.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}/attachments:
 *   post:
 *     summary: Upload an attachment to a task
 *     tags: [Attachments]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (max 10MB). Allowed types - images (jpg, png, gif, webp, svg), documents (pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv), archives (zip, rar, 7z)
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
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
 *                   example: Attachment uploaded successfully
 *                 attachment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                       example: screenshot-1234567890-123456789.png
 *                     originalName:
 *                       type: string
 *                       example: screenshot.png
 *                     mimeType:
 *                       type: string
 *                       example: image/png
 *                     fileSize:
 *                       type: integer
 *                       example: 245678
 *                     fileUrl:
 *                       type: string
 *                       example: /api/attachments/files/screenshot-1234567890-123456789.png
 *                     uploadedBy:
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
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or file type not allowed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a member of this workspace or role is 'viewer' (viewers cannot upload)
 *       404:
 *         description: Task not found
 *       413:
 *         description: File too large (max 10MB)
 */

/**
 * @route   POST /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/attachments
 * @desc    Upload an attachment to a task
 * @access  Private (Workspace members only)
 */
router.post(
  "/:workspaceId/projects/:projectId/tasks/:taskId/attachments",
  auth,
  checkWorkspaceMembership,
  checkTaskCreationPermission, // TODO: Write a separate middleware to check if user can upload (viewers cannot)
  upload.single("file"), // multer middleware to handle file upload
  uploadAttachmentValidation,
  uploadTaskAttachment,
);

/**
 * @swagger
 * /api/tasks/{taskId}/attachments:
 *   get:
 *     summary: Get all attachments for a task
 *     tags: [Attachments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a5
 *     responses:
 *       200:
 *         description: List of attachments
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
 *                   example: 3
 *                 attachments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       fileName:
 *                         type: string
 *                       originalName:
 *                         type: string
 *                       mimeType:
 *                         type: string
 *                       fileSize:
 *                         type: integer
 *                       fileUrl:
 *                         type: string
 *                       uploadedBy:
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
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a member of this workspace
 *       404:
 *         description: Task not found
 */

/**
 * @route   GET /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/attachments
 * @desc    Get all attachments for a task
 * @access  Private (Workspace members only)
 */
router.get(
  "/:workspaceId/projects/:projectId/tasks/:taskId/attachments",
  auth,
  checkWorkspaceMembership,
  getAttachmentsValidation,
  getTaskAttachments,
);

/**
 * @swagger
 * /api/tasks/{taskId}/attachments/{attachmentId}:
 *   delete:
 *     summary: Delete an attachment (soft delete)
 *     tags: [Attachments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a5
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attachment ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a7
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
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
 *                   example: Attachment deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (viewers cannot delete, members can delete only their own attachments, admins/owners can delete any attachment)
 *       404:
 *         description: Task or attachment not found
 */

/**
 * @route   DELETE /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/attachments/:attachmentId
 * @desc    Delete an attachment (soft delete)
 * @access  Private (Members can delete own attachments, admins/owners can delete any)
 */
router.delete(
  "/:workspaceId/projects/:projectId/tasks/:taskId/attachments/:attachmentId",
  auth,
  checkWorkspaceMembership,
  deleteAttachmentValidation,
  deleteTaskAttachment,
);

/**
 * @swagger
 * /api/attachments/files/{filename}:
 *   get:
 *     summary: Download/serve an attachment file
 *     tags: [Attachments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The filename to download
 *         example: screenshot-1234567890-123456789.png
 *     responses:
 *       200:
 *         description: File sent successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a member of the workspace containing this attachment
 *       404:
 *         description: File not found or attachment has been deleted
 */

/**
 * @route   GET /api/attachments/files/:filename
 * @desc    Download/serve an attachment file
 * @access  Private (Workspace members only)
 */
router.get("/files/:filename", auth, checkWorkspaceMembership, downloadFile);

export default router;
