import express from "express";
import {
    getStats,
    getUsers,
    banUser,
    getRevenue
} from "../controllers/adminController.js";
import { authenticateToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(authenticateToken);
router.use(requireRole(["ADMIN"]));

// Stats
router.get("/stats", getStats);

// Users
router.get("/users", getUsers);
router.put("/users/:id/ban", banUser);

// Revenue
router.get("/revenue", getRevenue);

export default router;


