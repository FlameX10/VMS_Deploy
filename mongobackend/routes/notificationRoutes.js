import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import * as notificationController from "../controllers/notificationController.js";

const router = express.Router();

router.get("/notifications", authMiddleware, notificationController.getNotifications);
router.patch("/notifications/:id/read", authMiddleware, notificationController.markNotificationRead);

export default router;
