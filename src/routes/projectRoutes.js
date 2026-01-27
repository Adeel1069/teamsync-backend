import express from "express";
import {
  createProject,
  getWorkspaceProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import {
  createProjectValidation,
  updateProjectValidation,
} from "../validators/projectValidators.js";
import auth from "../middlewares/auth.js";
import {
  checkWorkspaceMembership,
  checkProjectCreationPermission,
  checkWorkspaceAdmin,
} from "../middlewares/workspacePermissions.js";

const router = express.Router();

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects:
 *   post:
 *     summary: Create a new project in the workspace
 *     tags: [Projects]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Mobile App Development
 *                 description: Project name (key will be auto-generated)
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Building a mobile app for our platform
 *               status:
 *                 type: string
 *                 enum: [active, archived, on-hold]
 *                 default: active
 *                 example: active
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-01-27
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-30
 *     responses:
 *       201:
 *         description: Project created successfully
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
 *                   example: Project created successfully
 *                 project:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     workspace:
 *                       type: string
 *                     name:
 *                       type: string
 *                     key:
 *                       type: string
 *                       example: MAD
 *                       description: Auto-generated project key
 *                     description:
 *                       type: string
 *                     owner:
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
 *                     status:
 *                       type: string
 *                       enum: [active, archived, on-hold]
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     dueDate:
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
 *         description: Not authorized (requires project creation permission)
 *       404:
 *         description: Workspace not found
 */

/**
 * @route   POST /api/workspaces/:workspaceId/projects
 * @desc    Create a new project in the workspace
 * @access  Private (Owner, Admin, Member with permission)
 */
router.post(
  "/:workspaceId/projects",
  auth,
  checkWorkspaceMembership,
  checkProjectCreationPermission,
  createProjectValidation,
  createProject,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects:
 *   get:
 *     summary: Get all projects in a workspace
 *     tags: [Projects]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, archived, on-hold]
 *         description: Filter projects by status
 *     responses:
 *       200:
 *         description: List of projects
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
 *                 projects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       workspace:
 *                         type: string
 *                       name:
 *                         type: string
 *                       key:
 *                         type: string
 *                         example: MAD
 *                       description:
 *                         type: string
 *                       owner:
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
 *                       status:
 *                         type: string
 *                         enum: [active, archived, on-hold]
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       taskCount:
 *                         type: integer
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
 *         description: Workspace not found
 */

/**
 * @route   GET /api/workspaces/:workspaceId/projects
 * @desc    Get all projects in a workspace
 * @access  Private (All workspace members)
 */
router.get(
  "/:workspaceId/projects",
  auth,
  checkWorkspaceMembership,
  getWorkspaceProjects,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects/{projectId}:
 *   get:
 *     summary: Get a single project by ID
 *     tags: [Projects]
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
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 project:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     workspace:
 *                       type: string
 *                     name:
 *                       type: string
 *                     key:
 *                       type: string
 *                       example: MAD
 *                     description:
 *                       type: string
 *                     owner:
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
 *                     status:
 *                       type: string
 *                       enum: [active, archived, on-hold]
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     dueDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     taskCount:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a member of this workspace
 *       404:
 *         description: Workspace or project not found
 */

/**
 * @route   GET /api/workspaces/:workspaceId/projects/:projectId
 * @desc    Get a single project by ID
 * @access  Private (All workspace members)
 */
router.get(
  "/:workspaceId/projects/:projectId",
  auth,
  checkWorkspaceMembership,
  getProjectById,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects/{projectId}:
 *   patch:
 *     summary: Update a project
 *     tags: [Projects]
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
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Mobile App Development v2
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Updated project description
 *               status:
 *                 type: string
 *                 enum: [active, archived, on-hold]
 *                 example: active
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-02-01
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-07-31
 *     responses:
 *       200:
 *         description: Project updated successfully
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
 *                   example: Project updated successfully
 *                 project:
 *                   type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (requires owner or admin role)
 *       404:
 *         description: Workspace or project not found
 */

/**
 * @route   PATCH /api/workspaces/:workspaceId/projects/:projectId
 * @desc    Update a project
 * @access  Private (Owner & Admin only)
 */
router.patch(
  "/:workspaceId/projects/:projectId",
  auth,
  checkWorkspaceMembership,
  checkWorkspaceAdmin,
  updateProjectValidation,
  updateProject,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects/{projectId}:
 *   delete:
 *     summary: Delete a project (soft delete with cascading)
 *     tags: [Projects]
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
 *     responses:
 *       200:
 *         description: Project deleted successfully
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
 *                   example: Project and all related data deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (requires owner or admin role)
 *       404:
 *         description: Workspace or project not found
 */

/**
 * @route   DELETE /api/workspaces/:workspaceId/projects/:projectId
 * @desc    Delete a project (soft delete with cascading)
 * @access  Private (Owner & Admin only)
 */
router.delete(
  "/:workspaceId/projects/:projectId",
  auth,
  checkWorkspaceMembership,
  checkWorkspaceAdmin,
  deleteProject,
);

export default router;
