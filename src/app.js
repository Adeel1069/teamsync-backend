import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import projectRoutes from "./routes/projectRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middlewares/error.js";
import { FRONTEND_URL, NODE_ENV } from "./config/envConfig.js";

const app = express();

// Security middleware
app.use(helmet()); // Set security HTTP headers

// CORS configuration
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true, // Important: allows cookies to be sent
  }),
);

// BODY PARSING MIDDLEWARE
app.use(express.json({ limit: "10kb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // Parse URL-encoded bodies

// Cookie parser
app.use(cookieParser()); // ESSENTIAL for HTTP-only cookie auth

// LOGGING (Development only)
if (NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.info(`${req.method} ${req.url}`);
    next();
  });
}

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // requests per window
  message: "Too many login attempts, please try again later",
});

// Routes
app.use("/api/projects", projectRoutes); // Project routes
app.use("/api/auth/", authLimiter, authRoutes); // Auth routes

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
