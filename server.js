import app from "./src/app.js";
import { NODE_ENV, PORT } from "./src/config/envConfig.js";
import connectDB from "./src/db.js";
import { initializeCronJobs, stopCronJobs } from "./src/jobs/index.js";

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! - Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

let server;

/**
 * Initialize the application
 * - Connect to database
 * - Start HTTP server
 * - Initialize cron jobs
 */
const startServer = async () => {
  // Connect to database first
  await connectDB();

  // Start HTTP server
  server = app.listen(PORT, () => {
    console.info(`
    ================================================
    🚀 Server running in ${NODE_ENV} mode
    🌐 at: http://localhost:${PORT}
    📅 Started: ${new Date().toLocaleString()}
    ================================================
    `);
  });

  // Initialize cron jobs after database connection is established
  initializeCronJobs();
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! - Shutting down...");
  console.error(err.name, err.message);

  // Stop cron jobs
  stopCronJobs();

  // Close server
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.info("👋 SIGTERM RECEIVED. Shutting down gracefully...");

  // Stop cron jobs first
  stopCronJobs();

  // Then close server
  if (server) {
    server.close(() => {
      console.log("Process terminated");
    });
  }
});
