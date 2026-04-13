// routes/meetingRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import * as meetingController from "../controllers/meetingController.js";

const router = express.Router();

router.post(
  "/he/create-meeting",
  authMiddleware,
  checkRole(["he"]),
  meetingController.createMeeting
);

router.get(
  "/he/meetings-status",
  authMiddleware,
  checkRole(["he"]),
  meetingController.getHesMeetings
);

router.get(
  "/meetings/details",
  authMiddleware,
  checkRole(["sm"]),
  meetingController.getMeetingDetails
);

router.put(
  "/meetings/:id/status",
  authMiddleware,
  checkRole(["sm"]),
  meetingController.updateMeetingStatus
);

router.patch(
  "/he/meetings/:id/lifecycle",
  authMiddleware,
  checkRole(["he", "sg", "sm", "process_admin"]),
  meetingController.updateMeetingLifecycle
);

router.get(
  "/process-admin/pending-meetings",
  authMiddleware,
  checkRole(["process_admin"]),
  meetingController.getPendingMeetings
);

router.post(
  "/process-admin/meetings/:id/approve",
  authMiddleware,
  checkRole(["process_admin"]),
  meetingController.approveMeeting
);

router.post(
  "/process-admin/meetings/:id/reject",
  authMiddleware,
  checkRole(["process_admin"]),
  meetingController.rejectMeeting
);

export default router;
