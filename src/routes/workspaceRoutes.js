import express from "express";
import {
  createWorkspace,
  getAllWorkspaces,
  getMyWorkspaces,
  getWorkspaceBySlug,
  updateWorkspace,
  deleteWorkspace,
} from "../controllers/workspaceController.js";
import {
  createWorkspaceValidation,
  updateWorkspaceValidation,
} from "../validators/workspaceValidators.js";
import auth from "../middlewares/auth.js";
import {
  checkSuperAdmin,
  checkWorkspaceMembership,
  checkWorkspaceAdmin,
} from "../middlewares/workspacePermissions.js";

const router = express.Router();

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     security:
 *       - cookieAuth: []
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
 *                 example: My Awesome Workspace
 *                 description: Workspace name
 *               slug:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 pattern: ^[a-z0-9]+(?:-[a-z0-9]+)*$
 *                 example: my-awesome-workspace
 *                 description: Workspace slug (optional, auto-generated from name if not provided)
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: This is my workspace for team collaboration
 *                 description: Workspace description
 *               logo:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/logo.png
 *                 description: Workspace logo URL
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       409:
 *         description: Workspace with this slug already exists
 */

/**
 * @route   POST /api/workspaces
 * @desc    Create a new workspace (user becomes owner automatically)
 * @access  Private (Authenticated users only)
 */
router.post("/", auth, createWorkspaceValidation, createWorkspace);

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: Get all workspaces (Super Admin only)
 *     tags: [Workspaces]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all workspaces
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
 *                 workspaces:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       description:
 *                         type: string
 *                       logo:
 *                         type: string
 *                       owner:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                       settings:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a super admin
 */

/**
 * @route   GET /api/workspaces
 * @desc    Get all workspaces (super admin only)
 * @access  Private (Super Admin only)
 */
router.get("/", auth, checkSuperAdmin, getAllWorkspaces);

/**
 * @swagger
 * /api/workspaces/me:
 *   get:
 *     summary: Get workspaces where authenticated user is a member
 *     tags: [Workspaces]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user's workspaces
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
 *                 workspaces:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 60d5ec49f1b2c8b1f8e4e1a1
 *                       name:
 *                         type: string
 *                         example: My Workspace
 *                       slug:
 *                         type: string
 *                         example: my-workspace
 *                       description:
 *                         type: string
 *                       logo:
 *                         type: string
 *                       owner:
 *                         type: string
 *                       settings:
 *                         type: object
 *                       role:
 *                         type: string
 *                         enum: [owner, admin, member, viewer]
 *                         example: owner
 *                       joinedAt:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authenticated
 */

/**
 * @route   GET /api/workspaces/me
 * @desc    Get workspaces where authenticated user is a member
 * @access  Private
 */
router.get("/me", auth, getMyWorkspaces);

/**
 * @swagger
 * /api/workspaces/{slug}:
 *   get:
 *     summary: Get workspace details by slug
 *     tags: [Workspaces]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace slug
 *         example: my-workspace
 *     responses:
 *       200:
 *         description: Workspace details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 workspace:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60d5ec49f1b2c8b1f8e4e1a1
 *                     name:
 *                       type: string
 *                       example: My Workspace
 *                     slug:
 *                       type: string
 *                       example: my-workspace
 *                     description:
 *                       type: string
 *                     logo:
 *                       type: string
 *                     owner:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                     settings:
 *                       type: object
 *                       properties:
 *                         allowMemberProjectCreation:
 *                           type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     userRole:
 *                       type: string
 *                       enum: [owner, admin, member, viewer]
 *                       description: The requesting user's role in this workspace
 *                       example: owner
 *       400:
 *         description: slug not provided
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a member of this workspace
 *       404:
 *         description: Workspace not found
 */

/**
 * @route   GET /api/workspaces/:slug
 * @desc    Get workspace details by slug
 * @access  Private (Workspace members only)
 */
router.get("/:slug", auth, checkWorkspaceMembership, getWorkspaceBySlug);

/**
 * @swagger
 * /api/workspaces/{slug}:
 *   patch:
 *     summary: Update workspace details
 *     tags: [Workspaces]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace slug
 *         example: my-workspace
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
 *                 example: Updated Workspace Name
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: Updated workspace description
 *               logo:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/new-logo.png
 *               settings:
 *                 type: object
 *                 properties:
 *                   allowMemberProjectCreation:
 *                     type: boolean
 *                     example: true
 *     responses:
 *       200:
 *         description: Workspace updated successfully
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
 *                   example: Workspace updated successfully
 *                 workspace:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     description:
 *                       type: string
 *                     logo:
 *                       type: string
 *                     owner:
 *                       type: string
 *                     settings:
 *                       type: object
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (requires owner or admin role)
 *       404:
 *         description: Workspace not found
 */

/**
 * @route   PATCH /api/workspaces/:slug
 * @desc    Update workspace details
 * @access  Private (Owner & Admin only)
 */
router.patch(
  "/:slug",
  auth,
  checkWorkspaceMembership,
  checkWorkspaceAdmin,
  updateWorkspaceValidation,
  updateWorkspace,
);

/**
 * @swagger
 * /api/workspaces/{slug}:
 *   delete:
 *     summary: Delete workspace (soft delete with cascading)
 *     tags: [Workspaces]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace slug
 *         example: my-workspace
 *     responses:
 *       200:
 *         description: Workspace deleted successfully
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
 *                   example: Workspace and all related data deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (requires owner or admin role)
 *       404:
 *         description: Workspace not found
 */

/**
 * @route   DELETE /api/workspaces/:slug
 * @desc    Delete workspace (soft delete with cascading)
 * @access  Private (Owner & Admin only)
 */
router.delete(
  "/:slug",
  auth,
  checkWorkspaceMembership,
  checkWorkspaceAdmin,
  deleteWorkspace,
);

export default router;
