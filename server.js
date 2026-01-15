import express from "express";
import dotenv from "dotenv";
import projectRoutes from "./src/routes/projectRoutes.js";
import connectDB from "./src/db.js";
import { errorHandler } from "./src/middlewares/error.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// Middleware to parse json body
app.use(express.json());

// Use projects routes
app.use("/api/projects", projectRoutes);

// Basic route to check if server is running
app.get("/", (req, res) => {
  res.send("Project Management System API is running!");
});

// Centralized error handler
app.use(errorHandler);

// To run the express server
app.listen(PORT, () =>
  console.log(`Server is running at http://localhost:${PORT}`)
);
