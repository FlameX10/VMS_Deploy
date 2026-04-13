// controllers/userController.js
import * as userService from "../services/userService.js";

export const getPendingUsers = async (req, res) => {
  try {
    const users = await userService.getPendingUsers();
    res.json({ pendingUsers: users });
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getApprovedUsers = async (req, res) => {
  try {
    const users = await userService.getApprovedUsers();
    res.json({ approvedUsers: users });
  } catch (error) {
    console.error("Error fetching approved users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const approveUser = async (req, res) => {
  const { user_id } = req.params;
  const { full_name, role, employee_id, department, phone } = req.body;

  try {
    const result = await userService.approveUser(user_id, full_name, role, employee_id, department, phone);
    res.json(result);
  } catch (error) {
    if (error.message === "Full name and role are required") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rejectUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await userService.rejectUser(user_id);
    res.json(result);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
