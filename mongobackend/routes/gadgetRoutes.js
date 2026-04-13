// routes/gadgetRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import * as gadgetController from "../controllers/gadgetController.js";

const router = express.Router();

const allowedRoles = ["process_admin", "he", "sm", "sg"];

router.post(
  "/gadgets",
  authMiddleware,
  checkRole(allowedRoles),
  gadgetController.createGadget
);

router.get(
  "/gadgets",
  authMiddleware,
  checkRole(allowedRoles),
  gadgetController.getGadgets
);

router.get(
  "/gadgets/:id",
  authMiddleware,
  checkRole(allowedRoles),
  gadgetController.getGadgetById
);

router.put(
  "/gadgets/:id",
  authMiddleware,
  checkRole(allowedRoles),
  gadgetController.updateGadget
);

router.delete(
  "/gadgets/:id",
  authMiddleware,
  checkRole(allowedRoles),
  gadgetController.deleteGadget
);

export default router;
