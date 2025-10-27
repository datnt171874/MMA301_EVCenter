import express from "express";
import {
    getWalletInfo,
    getTransactions,
    depositMoney
} from "../controllers/walletController.js";
import { authenticateToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// Protected routes
router.use(authenticateToken);

// Shop routes
router.get("/", requireRole(["SHOP"]), getWalletInfo);
router.get("/transactions", requireRole(["SHOP"]), getTransactions);
router.post("/deposit", requireRole(["SHOP"]), depositMoney);

export default router;


