import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    profileImage: {
      type: String, // URL or path to the image
      default: null,
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    //Soft delete
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Virtual to get full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Compound index for active users
// TODO: Remove this comment after testing the index
// Query to verify indexing is working or not db.users.find({ email: "test@test.com", deletedAt: null }).explain("executionStats")
// if totalDocsExamined is 1, its mean your index is working perfectly!
userSchema.index({ email: 1, deletedAt: 1 });

// Pre hook to hash password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
