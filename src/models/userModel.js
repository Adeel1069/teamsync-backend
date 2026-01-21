import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/users.js";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: ROLES.USER, enum: Object.values(ROLES) },
  },
  { timestamps: true }
);

// Pre hook to hash password before saving the user
userSchema.pre("save", async function () {
  // If the password isn't changed, just return - no action needed
  if (!this.isModified("password")) return;

  // Hash the password
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
