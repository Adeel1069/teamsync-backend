import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import attachmentRoutes from "./routes/attachmentRoutes.js";
import { errorHandler } from "./middlewares/error.js";
import logger from "./utils/logger.js";
import { handleMulterError } from "./middlewares/multerErrorHandler.js";
import { FRONTEND_URL, NODE_ENV } from "./config/envConfig.js";
import { swaggerSpec, swaggerUi } from "./config/swagger.js";
import { StatusCodes } from "http-status-codes";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true, // allows cookies to be sent
  }),
);

// BODY PARSING MIDDLEWARE (JSON and URL-encoded bodies)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie parser (for HTTP-only cookie auth)
app.use(cookieParser());

// LOGGING (Development only)
// TODO: Replace this custom logger the morgan  package
if (NODE_ENV === "development") {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      logger.debug("HTTP", `${req.method} ${req.url}`, {
        status: res.statusCode,
        duration: `${Date.now() - start}ms`,
      });
    });
    next();
  });
}

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 50, // requests per window
  message: "Too many login attempts, please try again later",
});

// Swagger docs route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Swagger JSON endpoint (for Postman import)
app.get("/api-docs-json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workspaces", projectRoutes);
app.use("/api/workspaces", taskRoutes);
app.use("/api/workspaces", commentRoutes);
app.use("/api/workspaces", attachmentRoutes);
app.use("/api/attachments", attachmentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "Route not found",
  });
});

// Multer error handler (must come before general error handler)
app.use(handleMulterError);

// Centralized error handler
app.use(errorHandler);

export default app;
