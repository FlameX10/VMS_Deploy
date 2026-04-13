// services/userService.js
import { User } from "../models/User.js";
import { createNotificationsForUsers } from "./notificationService.js";

export const getPendingUsers = async () => {
  const users = await User.find({ status: "pending" }).select(
    "full_name email employee_id department phone role status createdAt"
  );
  return users;
};

export const getApprovedUsers = async () => {
  const users = await User.find({ 
    status: "approved",
    role: { $ne: "process_admin" }
  }).select("full_name email employee_id department phone role status createdAt");
  return users;
};

export const approveUser = async (user_id, full_name, role, employee_id, department, phone) => {
  if (!full_name || !role) {
    throw new Error("Full name and role are required");
  }

  const user = await User.findByIdAndUpdate(user_id, {
    full_name,
    role,
    employee_id,
    department,
    phone,
    status: "approved",
  }, { new: true });

  if (user) {
    await createNotificationsForUsers({
      userIds: [user._id],
      title: "Account approved",
      message: `Your account is approved as ${role}. You can log in now.`,
      type: "success",
      entity_type: "user",
      entity_id: user._id,
    });
  }

  return { message: "User approved successfully" };
};

export const rejectUser = async (user_id) => {
  const user = await User.findByIdAndDelete(user_id);
  if (user) {
    await createNotificationsForUsers({
      userIds: [user._id],
      title: "Account request closed",
      message: "Your registration request was rejected. Contact Process Admin for details.",
      type: "warning",
      entity_type: "user",
      entity_id: user._id,
    });
  }
  return { message: "User rejected and deleted from system" };
};
