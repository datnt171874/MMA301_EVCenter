import express from "express";
import { register, login } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();


router.post("/register", register);
router.post("/login", login);

// Protected routes (example)
router.get("/profile", authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "Protected route accessed",
        user: req.user
    });
});

export default router;
