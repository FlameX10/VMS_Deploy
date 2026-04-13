// services/passwordResetService.js
import { User } from "../models/User.js";
import { PasswordResetOTP } from "../models/PasswordResetOTP.js";
import { transporter } from "../config/mailer.js";
import { generateOTP } from "../utils/validators.js";

export const requestPasswordReset = async (email) => {
  // Check user
  const user = await User.findOne({ email, status: "approved" });

  if (!user) {
    throw new Error("User not found or not approved");
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Remove old OTPs
  await PasswordResetOTP.deleteMany({ email });

  // Save OTP
  await PasswordResetOTP.create({ email, otp, expires_at: expiresAt });

  // Send Email
  await transporter.sendMail({
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Arial; padding: 10px;">
        <h2>Password Reset Request</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing: 3px;">${otp}</h1>
        <p>This OTP is valid for <b>10 minutes</b>.</p>
        <p>If you didn't request this, ignore this email.</p>
      </div>
    `,
  });

  return { message: "OTP sent successfully" };
};

export const verifyOTP = async (email, otp) => {
  const result = await PasswordResetOTP.findOne({
    email,
    otp,
    verified: false,
    expires_at: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!result) {
    throw new Error("Invalid or expired OTP");
  }

  await PasswordResetOTP.findByIdAndUpdate(result._id, { verified: true });

  return { message: "OTP verified successfully" };
};

export const resetPassword = async (email, newPassword) => {
  const otpCheck = await PasswordResetOTP.findOne({
    email,
    verified: true,
  }).sort({ createdAt: -1 });

  if (!otpCheck) {
    throw new Error("OTP verification required");
  }

  await User.findOneAndUpdate({ email }, { password_hash: newPassword });

  return { message: "Password updated successfully" };
};
