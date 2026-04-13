// routes/visitorRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import * as visitorController from "../controllers/visitorController.js";

const router = express.Router();

router.post("/visitor/register", visitorController.registerVisitor);

router.get(
  "/visitors/pending",
  authMiddleware,
  checkRole(["sm", "process_admin"]),
  visitorController.getPendingVisitors
);

router.get(
  "/visitors/:id",
  authMiddleware,
  checkRole(["sm", "process_admin", "he", "sg"]),
  visitorController.getVisitorById
);

router.get(
  "/visitors",
  authMiddleware,
  checkRole(["sm", "process_admin", "he", "sg"]),
  visitorController.getAllVisitors
);

router.put(
  "/visitors/:id/approve",
  authMiddleware,
  checkRole(["sm", "process_admin"]),
  visitorController.approveVisitor
);

router.put(
  "/visitors/:id/reject",
  authMiddleware,
  checkRole(["sm", "process_admin"]),
  visitorController.rejectVisitor
);

export default router;
