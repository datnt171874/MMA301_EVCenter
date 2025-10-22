import express from "express";
import { register, login } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();


router.post("/register", register);
router.post("/login", login);


export default router;
