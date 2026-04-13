import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

const serialize = (notification) => ({
  notification_id: notification._id,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  entity_type: notification.entity_type,
  entity_id: notification.entity_id,
  read: notification.read,
  created_at: notification.createdAt,
  metadata: notification.metadata,
});

export const createNotificationsForRoles = async ({ roles, title, message, type = "info", entity_type, entity_id, metadata }) => {
  if (!roles?.length) {
    return [];
  }

  const users = await User.find({ role: { $in: roles }, status: "approved" }).select("_id role");
  if (!users.length) {
    return [];
  }

  const docs = users.map((user) => ({
    user_id: user._id,
    role: user.role,
    title,
    message,
    type,
    entity_type,
    entity_id,
    metadata,
  }));

  return Notification.insertMany(docs);
};

export const createNotificationsForUsers = async ({ userIds, title, message, type = "info", entity_type, entity_id, metadata }) => {
  if (!userIds?.length) {
    return [];
  }

  const users = await User.find({ _id: { $in: userIds }, status: "approved" }).select("_id role");
  if (!users.length) {
    return [];
  }

  const docs = users.map((user) => ({
    user_id: user._id,
    role: user.role,
    title,
    message,
    type,
    entity_type,
    entity_id,
    metadata,
  }));

  return Notification.insertMany(docs);
};

export const getNotificationsForUser = async (userId) => {
  const notifications = await Notification.find({ user_id: userId }).sort({ createdAt: -1 }).limit(25);
  return notifications.map(serialize);
};

export const markNotificationRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user_id: userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new Error("Notification not found");
  }

  return serialize(notification);
};
