// routes/passwordResetRoutes.js
import express from "express";
import * as passwordResetController from "../controllers/passwordResetController.js";

const router = express.Router();

router.post("/request-password-reset", passwordResetController.requestPasswordReset);
router.post("/verify-otp", passwordResetController.verifyOTP);
router.post("/reset-password", passwordResetController.resetPassword);

export default router;
