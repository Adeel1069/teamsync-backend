import { StatusCodes } from "http-status-codes";
import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/generateToken.js";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../config/cookieConfig.js";

/**
 * Register a new user
 */
export const registerUser = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email, deletedAt: null });

    if (existingUser) {
      throw new AppError("User with this email already exists", StatusCodes.BAD_REQUEST);
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookies
    res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

    // Send response
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login a user
 */
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, deletedAt: null }).select(
      "+password",
    );

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError("Your account has been deactivated", StatusCodes.FORBIDDEN);
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookies
    res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

    // Send response
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("+isSuperAdmin");

    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError("Your account has been deactivated", StatusCodes.FORBIDDEN);
    }

    // Send response
    res.status(StatusCodes.OK).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive,
        profileImage: user.profileImage,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError("No refresh token provided", StatusCodes.UNAUTHORIZED);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError("User not found", StatusCodes.UNAUTHORIZED);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError("Your account has been deactivated", StatusCodes.FORBIDDEN);
    }

    // Generate new tokens (rotate both for security)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Set new cookies
    res.cookie("accessToken", newAccessToken, getAccessTokenCookieOptions());
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());

    // Send response
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid refresh token", StatusCodes.UNAUTHORIZED));
    }
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError("Refresh token expired. Please login again", StatusCodes.UNAUTHORIZED),
      );
    }
    next(error);
  }
};

/**
 * Logout user by clearing cookies
 */
export const logout = async (req, res, next) => {
  try {
    // Clear cookies
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });

    // Send response
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};
