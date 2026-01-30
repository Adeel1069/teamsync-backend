import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const passwordResetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Indexes
passwordResetSchema.index({ userId: 1, isUsed: 1 });
// TTL index for auto-deletion - After otp expiration, the document will be removed automatically
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save hook to hash OTP
passwordResetSchema.pre("save", async function () {
  if (!this.isModified("otp")) return;
  this.otp = await bcrypt.hash(this.otp, 4);
});

// Method to verify OTP
passwordResetSchema.methods.matchOtp = async function (enteredOtp) {
  return await bcrypt.compare(enteredOtp, this.otp);
};

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

export default PasswordReset;
