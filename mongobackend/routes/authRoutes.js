// routes/authRoutes.js
import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/checkUser", authController.checkUser);
router.post("/verifyPassword", authController.verifyPassword);
router.post("/logout", authController.logout);

export default router;
