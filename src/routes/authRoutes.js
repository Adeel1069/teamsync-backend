import express from "express";
import {
  getCurrentUser,
  loginUser,
  logout,
  refreshAccessToken,
  registerUser,
} from "../controllers/authController.js";
import auth from "../middlewares/auth.js";
import {
  loginValidation,
  registerValidation,
} from "../validators/authValidators.js";

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
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and set cookies
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
 *                 example: hafizadeel493@gmail.com
 *               password:
 *                 type: string
 *                 example: abc13!@#
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and set cookies
 * @access  Public
 */
router.post("/login", loginValidation, loginUser);

// ==========================================
// PROTECTED ROUTES
// ==========================================

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token and rotate refresh token
 * @access  Private (verified by refresh token in controller)
 */
router.post("/refresh", refreshAccessToken);

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
 */
/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get("/me", auth, getCurrentUser);

export default router;
