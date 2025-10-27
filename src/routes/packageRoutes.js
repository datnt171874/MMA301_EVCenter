import express from "express";
import {
    getAllPackages,
    getShopPackages,
    purchasePackage,
    getRemainingPosts
} from "../controllers/packageController.js";
import { authenticateToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllPackages);

// Protected routes
router.use(authenticateToken);

// Shop routes
router.get("/shop/my-packages", requireRole(["SHOP"]), getShopPackages);
router.post("/purchase", requireRole(["SHOP"]), purchasePackage);
router.get("/shop/remaining-posts", requireRole(["SHOP"]), getRemainingPosts);

export default router;


