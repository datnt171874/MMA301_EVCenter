import express from "express";
import { register } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);

// Protected routes (example)
router.get("/profile", authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "Protected route accessed",
        user: req.user
    });
});

export default router;
