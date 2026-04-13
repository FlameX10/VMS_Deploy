// models/PasswordResetOTP.js
import mongoose from "mongoose";

const passwordResetOTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs
passwordResetOTPSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetOTP = mongoose.model("PasswordResetOTP", passwordResetOTPSchema);
