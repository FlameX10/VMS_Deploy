// routes/userRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.get(
  "/pa/pending/emp/requests",
  authMiddleware,
  checkRole(["process_admin"]),
  userController.getPendingUsers
);

router.get(
  "/pa/approved/emp/requests",
  authMiddleware,
  checkRole(["process_admin"]),
  userController.getApprovedUsers
);

router.patch(
  "/pa/approve-user/:user_id",
  authMiddleware,
  checkRole(["process_admin"]),
  userController.approveUser
);

router.delete(
  "/pa/reject-user/:user_id",
  authMiddleware,
  checkRole(["process_admin"]),
  userController.rejectUser
);

export default router;
