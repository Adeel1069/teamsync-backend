import app from "./src/app.js";
import { NODE_ENV, PORT } from "./src/config/envConfig.js";
import connectDB from "./src/db.js";

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! - Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect to database
connectDB();

const server = app.listen(PORT, () => {
  console.info(`
    ================================================
    🚀 Server running in ${NODE_ENV} mode
    🌐 at: http://localhost:${PORT}
    📅 Started: ${new Date().toLocaleString()}
    ================================================
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! - Shutting down...");
  console.error(err.name, err.message);

  // Close server
  server.close(() => {
    process.exit(1);
  });
});

// Shutdown
process.on("SIGTERM", () => {
  console.info("👋 SIGTERM RECEIVED. Shutting down...");
  server.close(() => {
    console.log("Process terminated");
  });
});
