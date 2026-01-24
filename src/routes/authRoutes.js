import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshAccessToken,
  logout,
} from "../controllers/authController.js";
import {
  registerValidation,
  loginValidation,
} from "../validators/authValidators.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!@#
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and set authentication cookies
 * @access  Public
 */
router.post("/register", registerValidation, registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!@#
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account deactivated
 */

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and set cookies
 * @access  Public
 */
router.post("/login", loginValidation, loginUser);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (uses refresh token from cookie)
 */
router.post("/refresh", refreshAccessToken);

// ==========================================
// PROTECTED ROUTES
// ==========================================

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 */

/**
 * @route   POST /api/auth/logout
 * @desc    Clear authentication cookies
 * @access  Private
 */
router.post("/logout", auth, logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Account deactivated
 */

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get("/me", auth, getCurrentUser);

export default router;
