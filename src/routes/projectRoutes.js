import express from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

import { validate } from "../middlewares/validate.js";
import {
  validateProjectId,
  createProjectValidator,
  updateProjectValidator,
} from "../validators/projectValidators.js";
import auth from "../middlewares/auth.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();

// ==========================================
// Protected ROUTES
// ==========================================

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */

router.post(
  "/",
  auth,
  authorize("admin"),
  createProjectValidator,
  validate,
  createProject,
);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     description: Retrieve a list of all projects.
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: A list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The project ID
 *                   name:
 *                     type: string
 *                     description: The name of the project
 *                   description:
 *                     type: string
 *                     description: The project description
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
/**
 * @route   GET /api/projects
 * @desc    Get all projects
 * @access  Private
 */
router.get("/", auth, authorize("admin", "user"), getProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by id
 * @access  Private
 */
router.get(
  "/:id",
  auth,
  authorize("admin", "user"),
  validateProjectId,
  validate,
  getProjectById,
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project by id
 * @access  Private
 */
router.put(
  "/:id",
  auth,
  authorize("admin"),
  validateProjectId,
  updateProjectValidator,
  validate,
  updateProject,
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project by id
 * @access  Private
 */
router.delete(
  "/:id",
  auth,
  authorize("admin"),
  validateProjectId,
  validate,
  deleteProject,
);

export default router;
