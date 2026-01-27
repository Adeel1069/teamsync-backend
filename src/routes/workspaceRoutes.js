import express from "express";
import {
  createWorkspace,
  getAllWorkspaces,
  getMyWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  getWorkspaceMembers,
  updateMemberRole,
  removeMember,
  leaveWorkspace,
} from "../controllers/workspaceController.js";
import {
  createWorkspaceValidation,
  updateWorkspaceValidation,
  inviteMemberValidation,
  updateMemberRoleValidation,
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
 * /api/workspaces/{workspaceId}:
 *   get:
 *     summary: Get workspace details by slug
 *     tags: [Workspaces]
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
 * @route   GET /api/workspaces/:workspaceId
 * @desc    Get workspace details by slug
 * @access  Private (Workspace members only)
 */
router.get("/:workspaceId", auth, checkWorkspaceMembership, getWorkspaceById);

/**
 * @swagger
 * /api/workspaces/{workspaceId}:
 *   patch:
 *     summary: Update workspace details
 *     tags: [Workspaces]
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
 * @route   PATCH /api/workspaces/:workspaceId
 * @desc    Update workspace details
 * @access  Private (Owner & Admin only)
 */
router.patch(
  "/:workspaceId",
  auth,
  checkWorkspaceMembership,
  checkWorkspaceAdmin,
  updateWorkspaceValidation,
  updateWorkspace,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}:
 *   delete:
 *     summary: Delete workspace (soft delete with cascading)
 *     tags: [Workspaces]
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
 * @route   DELETE /api/workspaces/:workspaceId
 * @desc    Delete workspace (soft delete with cascading)
 * @access  Private (Owner & Admin only)
 */
router.delete(
  "/:workspaceId",
  auth,
  checkWorkspaceMembership,
  checkWorkspaceAdmin,
  deleteWorkspace,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members/invite:
 *   post:
 *     summary: Invite a member to the workspace
 *     tags: [Workspace Members]
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
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: Email of the user to invite
 *               role:
 *                 type: string
 *                 enum: [admin, member, viewer]
 *                 default: member
 *                 example: member
 *                 description: Role to assign (cannot be 'owner')
 *     responses:
 *       201:
 *         description: Member invited successfully
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
 *                   example: Member invited successfully
 *                 member:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60d5ec49f1b2c8b1f8e4e1a1
 *                     user:
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
 *                     role:
 *                       type: string
 *                       enum: [admin, member, viewer]
 *                     invitedBy:
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
 *                     joinedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or cannot invite as owner
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (requires owner or admin role)
 *       404:
 *         description: User with this email does not exist or workspace not found
 *       409:
 *         description: User is already a member of this workspace
 */

/**
 * @route   POST /api/workspaces/:workspaceId/members/invite
 * @desc    Invite a member to the workspace
 * @access  Private (Owner & Admin only)
 */
router.post(
  "/:workspaceId/members/invite",
  auth,
  checkWorkspaceMembership,
  checkWorkspaceAdmin,
  inviteMemberValidation,
  inviteMember,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members:
 *   get:
 *     summary: Get all members of a workspace
 *     tags: [Workspace Members]
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
 *     responses:
 *       200:
 *         description: List of workspace members
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
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       user:
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
 *                       role:
 *                         type: string
 *                         enum: [owner, admin, member, viewer]
 *                       invitedBy:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                       joinedAt:
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
 * @route   GET /api/workspaces/:workspaceId/members
 * @desc    Get all members of a workspace
 * @access  Private (All workspace members)
 */
router.get(
  "/:workspaceId/members",
  auth,
  checkWorkspaceMembership,
  getWorkspaceMembers,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members/{memberId}:
 *   patch:
 *     summary: Update member role
 *     tags: [Workspace Members]
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
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, member, viewer]
 *                 example: admin
 *                 description: New role for the member (cannot be 'owner')
 *     responses:
 *       200:
 *         description: Member role updated successfully
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
 *                   example: Member role updated successfully
 *                 member:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     user:
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
 *                     role:
 *                       type: string
 *                       enum: [admin, member, viewer]
 *                     joinedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Cannot change owner role or update to owner role or change your own role
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (requires owner or admin role) or admin cannot change other admin roles
 *       404:
 *         description: Member not found or workspace not found
 */

/**
 * @route   PATCH /api/workspaces/:workspaceId/members/:memberId
 * @desc    Update member role
 * @access  Private (Owner & Admin only)
 */
router.patch(
  "/:workspaceId/members/:memberId",
  auth,
  checkWorkspaceMembership,
  checkWorkspaceAdmin,
  updateMemberRoleValidation,
  updateMemberRole,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members/{memberId}:
 *   delete:
 *     summary: Remove member from workspace
 *     tags: [Workspace Members]
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
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *         example: 60d5ec49f1b2c8b1f8e4e1a1
 *     responses:
 *       200:
 *         description: Member removed successfully
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
 *                   example: Member removed successfully
 *       400:
 *         description: Cannot remove workspace owner or cannot remove yourself
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (requires owner or admin role) or admin cannot remove other admins
 *       404:
 *         description: Member not found or workspace not found
 */

/**
 * @route   DELETE /api/workspaces/:workspaceId/members/:memberId
 * @desc    Remove member from workspace
 * @access  Private (Owner & Admin only)
 */
router.delete(
  "/:workspaceId/members/:memberId",
  auth,
  checkWorkspaceMembership,
  checkWorkspaceAdmin,
  removeMember,
);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members/leave:
 *   post:
 *     summary: Leave workspace
 *     tags: [Workspace Members]
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
 *     responses:
 *       200:
 *         description: Successfully left the workspace
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
 *                   example: Successfully left the workspace
 *       400:
 *         description: Workspace owner cannot leave
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a member of this workspace
 *       404:
 *         description: Workspace not found
 */

/**
 * @route   POST /api/workspaces/:workspaceId/members/leave
 * @desc    Leave workspace
 * @access  Private (All members except owner)
 */
router.post("/:workspaceId/members/leave", auth, checkWorkspaceMembership, leaveWorkspace);

export default router;
