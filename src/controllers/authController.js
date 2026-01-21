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

/** Register a new user */
export const registerUser = async (req, res, next) => {
  const { username, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser)
      throw new AppError("User with this email already exists", 400);

    const user = new User({
      username,
      email,
      password,
      role,
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookies
    res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

/** Login a user */
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      // Generate tokens
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      // Set cookies
      res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
      res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

      res.status(200).json({ success: true, message: "Login successful" });
    } else {
      throw new AppError("Invalid credentials", 401);
    }
  } catch (error) {
    next(error);
  }
};

/** Refresh Access Token */
export const refreshAccessToken = async (req, res, next) => {
  try {
    // Get refresh token from cookie & Verify it & find it in database
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      throw new AppError("No refresh token, please log in again", 401);

    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError("User not found", 401);
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);
    // Set new cookies
    res.cookie("accessToken", newAccessToken, getAccessTokenCookieOptions());
    // Optionally rotate refresh token for added security
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      next(new AppError("Invalid refresh token", 401));
    }
    if (error.name === "TokenExpiredError") {
      next(new AppError("Refresh token expired. Please login again", 401));
    }
    next(error);
  }
};

/** Logout User */
export const logout = async (req, res, next) => {
  try {
    // Clear cookies
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

/**  Get Current User */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
