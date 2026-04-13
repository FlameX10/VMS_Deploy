// services/authService.js
import { User } from "../models/User.js";
import { generateToken } from "../utils/auth.js";
import { validateEmail, validatePassword } from "../utils/validators.js";
import { createNotificationsForRoles } from "./notificationService.js";

const toUserResponse = (user) => ({
  id: user._id,
  name: user.full_name,
  email: user.email,
  role: user.role,
  status: user.status,
  employee_id: user.employee_id,
  department: user.department,
  phone: user.phone,
  created_at: user.createdAt,
});

export const registerUser = async ({ name, email, employee_id, department, phone, password }) => {
  if (!name || !email || !employee_id || !department || !phone || !password) {
    throw new Error("All registration fields are required");
  }

  if (!validateEmail(email)) {
    throw new Error("Invalid email address");
  }

  if (!validatePassword(password)) {
    throw new Error("Password must be at least 6 characters long");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = await User.create({
    full_name: name,
    email: email.toLowerCase(),
    employee_id,
    department,
    phone,
    password_hash: password,
    status: "pending",
    role: "employee",
  });

  await createNotificationsForRoles({
    roles: ["process_admin"],
    title: "New user registration",
    message: `${name} has requested access to the VMS platform.`,
    type: "approval",
    entity_type: "user",
    entity_id: user._id,
  });

  return {
    message: "Registration submitted for approval",
    user: toUserResponse(user),
  };
};

export const checkUserByEmail = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  let user = await User.findOne({ email });

  if (!user) {
    return { message: "User not found. Please register first.", status: "not_found" };
  }

  if (user.status === "pending") {
    return {
      message: "user still under the pa verification",
      status: "pending",
    };
  }

  if (user.status === "approved") {
    return {
      message: "user verified",
      status: "approved",
      user: toUserResponse(user),
    };
  }

  return {
    message: `user status: ${user.status}`,
    status: user.status,
  };
};

export const verifyPassword = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status !== "approved") {
    throw new Error("User still under PA verification");
  }

  if (user.password_hash !== password) {
    throw new Error("Invalid password");
  }

  const token = generateToken(user);

  return {
    message: "Login successful",
    token,
    user: toUserResponse(user),
  };
};
