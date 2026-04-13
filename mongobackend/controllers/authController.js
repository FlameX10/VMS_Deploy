// controllers/authController.js
import * as authService from "../services/authService.js";

export const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    return res.status(201).json(result);
  } catch (error) {
    if (
      error.message === "All registration fields are required" ||
      error.message === "Invalid email address" ||
      error.message === "Password must be at least 6 characters long" ||
      error.message === "User already exists"
    ) {
      return res.status(400).json({ message: error.message });
    }

    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkUser = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const result = await authService.checkUserByEmail(email);
    res.json(result);
  } catch (err) {
    console.error("Error checking user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verifyPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await authService.verifyPassword(email, password);
    res.json(result);
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "User still under PA verification") {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "Invalid password") {
      return res.status(401).json({ message: error.message });
    }
    console.error("Error verifying password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
