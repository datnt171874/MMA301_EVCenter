import express from "express";
import { getProfile, updateProfile } from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;

