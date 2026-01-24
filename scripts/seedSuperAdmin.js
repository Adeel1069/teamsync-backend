import mongoose from "mongoose";
import User from "../src/models/userModel.js";
import { MONGODB_URI } from "../src/config/envConfig.js";

/**
 * Seed script to create the platform super-admin user
 * Run with: npm run seed:superadmin
 */

const seedSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Super-admin credentials
    const superAdminData = {
      email: process.env.SUPER_ADMIN_EMAIL || "admin@teamsync.com",
      password: process.env.SUPER_ADMIN_PASSWORD || "Admin123!@#",
      firstName: "Super",
      lastName: "Admin",
      isSuperAdmin: true,
    };

    // Check if super-admin already exists
    const existingSuperAdmin = await User.findOne({
      email: superAdminData.email,
      deletedAt: null,
    });

    if (existingSuperAdmin) {
      console.error("⚠️  Super-admin already exists:");
      console.info(`   Email: ${existingSuperAdmin.email}`);
      console.info(
        `   Name: ${existingSuperAdmin.firstName} ${existingSuperAdmin.lastName}`,
      );
      console.info(`   ID: ${existingSuperAdmin._id}\n`);

      // Ask if user wants to update
      console.error(
        "ℹ️  To create a new super-admin, delete the existing one first or use a different email.\n",
      );
      process.exit(0);
    }

    // Create super-admin user
    console.info("🔨 Creating super-admin user...");
    const superAdmin = new User(superAdminData);
    await superAdmin.save();

    console.info("\n✅ Super-admin created successfully!");
    console.info("==========================================");
    console.info(`Email:     ${superAdminData.email}`);
    console.info(`Password:  ${superAdminData.password}`);
    console.info(
      `Name:      ${superAdminData.firstName} ${superAdminData.lastName}`,
    );
    console.info(`User ID:   ${superAdmin._id}`);
    console.info("==========================================");
    console.info("\n⚠️  IMPORTANT: Change the password after first login!");
    console.info("⚠️  Store these credentials securely.\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating super-admin:");
    console.error(error.message);
    process.exit(1);
  }
};

// Run the seed function
seedSuperAdmin();
