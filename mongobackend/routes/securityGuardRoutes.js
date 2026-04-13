// routes/securityGuardRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import * as securityGuardController from "../controllers/securityGuardController.js";

const router = express.Router();

router.get(
  "/sg/unvalidated-visitors",
  authMiddleware,
  checkRole(["sg"]),
  securityGuardController.getUnvalidatedVisitors
);

router.post(
  "/sg/visitor/validate/:visitor_id",
  authMiddleware,
  checkRole(["sg"]),
  securityGuardController.validateVisitorId
);

router.post(
  "/sg/visitor/reject/:visitor_id",
  authMiddleware,
  checkRole(["sg"]),
  securityGuardController.rejectVisitorId
);

router.get(
  "/sg/validate-visitor",
  authMiddleware,
  checkRole(["sg"]),
  securityGuardController.validateVisitorIdentification
);

router.post(
  "/sg/visitor/check-in",
  authMiddleware,
  checkRole(["sg"]),
  securityGuardController.checkInVisitor
);

router.post(
  "/sg/visitor/check-out",
  authMiddleware,
  checkRole(["sg"]),
  securityGuardController.checkOutVisitor
);

router.get(
  "/sg/visitor-logs",
  authMiddleware,
  checkRole(["sg"]),
  securityGuardController.getVisitorLogs
);

router.get(
  "/sg/visitor-report",
  authMiddleware,
  checkRole(["sg", "sm", "process_admin"]),
  securityGuardController.getVisitorReport
);

export default router;
