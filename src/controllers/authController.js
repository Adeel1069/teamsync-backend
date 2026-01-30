import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import User from "../models/userModel.js";
import PasswordReset from "../models/passwordResetModel.js";
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
import {
  sendPasswordResetOtp,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
} from "../utils/sendEmail.js";
import { OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS } from "../config/envConfig.js";

/**
 * Register a new user
 */
export const registerUser = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email, deletedAt: null });

    if (existingUser) {
      throw new AppError(
        "User with this email already exists",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
    });

    await user.save();

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.firstName);

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // TODO: Consider adding email verification step first before activating account
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
      throw new AppError(
        "Your account has been deactivated",
        StatusCodes.FORBIDDEN,
      );
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
      throw new AppError(
        "Your account has been deactivated",
        StatusCodes.FORBIDDEN,
      );
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
      throw new AppError(
        "Your account has been deactivated",
        StatusCodes.FORBIDDEN,
      );
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
      return next(
        new AppError("Invalid refresh token", StatusCodes.UNAUTHORIZED),
      );
    }
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError(
          "Refresh token expired. Please login again",
          StatusCodes.UNAUTHORIZED,
        ),
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

/**
 * Change user password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(
        "Your account has been deactivated",
        StatusCodes.FORBIDDEN,
      );
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      throw new AppError(
        "Current password is incorrect",
        StatusCodes.UNAUTHORIZED,
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send password changed emails notification (non-blocking)
    sendPasswordChangedEmail(user.email, user.firstName);

    // Clear cookies to force re-login
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });

    // Send response
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password - send OTP to email
 */
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    // Find user by email (don't reveal if email exists)
    const user = await User.findOne({ email, deletedAt: null });

    // Always return success message (security: don't reveal if email exists)
    const successMessage = "Password reset OTP has been sent.";

    if (!user || !user.isActive) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: successMessage,
      });
    }

    // Delete any existing password reset records for this user
    await PasswordReset.deleteMany({ userId: user._id });

    // Generate 6-digit OTP using crypto
    const otp = crypto.randomInt(100000, 999999).toString();

    // Create password reset record
    const passwordReset = new PasswordReset({
      userId: user._id,
      otp,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    await passwordReset.save();

    // Send OTP email (blocking)
    await sendPasswordResetOtp(user.email, otp, user.firstName);

    // Send response
    res.status(StatusCodes.OK).json({
      success: true,
      message: successMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using OTP
 */
export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email, deletedAt: null });

    if (!user) {
      throw new AppError("Invalid email", StatusCodes.BAD_REQUEST);
    }

    // Find valid password reset record
    const passwordReset = await PasswordReset.findOne({
      userId: user._id,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!passwordReset) {
      throw new AppError(
        "Invalid or expired OTP. Please request a new one.",
        StatusCodes.BAD_REQUEST,
      );
    }

    // Check max attempts
    if (passwordReset.attempts >= OTP_MAX_ATTEMPTS) {
      await PasswordReset.deleteOne({ _id: passwordReset._id });
      throw new AppError(
        "Too many failed attempts. Please request a new OTP.",
        StatusCodes.TOO_MANY_REQUESTS,
      );
    }

    // Verify OTP
    const isOtpValid = await passwordReset.matchOtp(otp);

    if (!isOtpValid) {
      // Increment attempts
      passwordReset.attempts += 1;
      await passwordReset.save();

      const remainingAttempts = OTP_MAX_ATTEMPTS - passwordReset.attempts;
      throw new AppError(
        `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
        StatusCodes.BAD_REQUEST,
      );
    }

    // Mark OTP as used
    passwordReset.isUsed = true;
    await passwordReset.save();

    // Update user password
    user.password = newPassword;
    await user.save();

    // Send password changed email notification (non-blocking)
    sendPasswordChangedEmail(user.email, user.firstName);

    // Delete all password reset records for this user
    await PasswordReset.deleteMany({ userId: user._id });

    // Send response
    res.status(StatusCodes.OK).json({
      success: true,
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};
