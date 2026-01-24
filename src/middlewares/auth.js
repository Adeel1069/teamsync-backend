import AppError from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/generateToken.js";

const auth = async (req, res, next) => {
  try {
    // 1. Extract token from cookies
    const token = req.cookies.accessToken;
    //const token =  req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new AppError("Access denied. No token provided....", 403);
    }

    // 2. Verify token & Decode
    const decoded = verifyAccessToken(token);

    // 3. Attach user info to request
    req.user = decoded;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired. Please login again", 401));
    }
    next(error);
  }
};

export default auth;
