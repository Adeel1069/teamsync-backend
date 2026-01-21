import mongoose from "mongoose";
import { MONGODB_URI } from "./config/envConfig.js";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.info(`
    🌐 Server connected with MONGODB database
    ================================================
    `);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
