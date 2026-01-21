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
 * @route   POST /api/auth/register
 * @desc    Register a new user and set cookies
 * @access  Public
 */
router.post("/register", registerValidation, registerUser);

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
 * @access  Private
 */
router.post("/refresh", refreshAccessToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Clear authentication cookies
 * @access  Private
 */
router.post("/logout", logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get("/me", auth, getCurrentUser);

export default router;
