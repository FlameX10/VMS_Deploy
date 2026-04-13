// controllers/passwordResetController.js
import * as passwordResetService from "../services/passwordResetService.js";

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await passwordResetService.requestPasswordReset(email);
    res.json(result);
  } catch (err) {
    if (err.message === "User not found or not approved") {
      return res.status(404).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const result = await passwordResetService.verifyOTP(email, otp);
    res.json(result);
  } catch (err) {
    if (err.message === "Invalid or expired OTP") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const result = await passwordResetService.resetPassword(email, newPassword);
    res.json(result);
  } catch (err) {
    if (err.message === "OTP verification required") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};
