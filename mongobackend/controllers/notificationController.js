import * as notificationService from "../services/notificationService.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotificationsForUser(req.user.id);
    return res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await notificationService.markNotificationRead(req.params.id, req.user.id);
    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    if (error.message === "Notification not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error("❌ Error updating notification:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
