import express from "express";
import {
    getShopProfile,
    updateShopProfile,
    uploadCertificate
} from "../controllers/shopController.js";
import { authenticateToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();


router.use(authenticateToken);

router.get("/profile", requireRole(["SHOP"]), getShopProfile);
router.put("/profile", requireRole(["SHOP"]), updateShopProfile);
router.post("/certificate", requireRole(["SHOP"]), uploadCertificate);

export default router;
