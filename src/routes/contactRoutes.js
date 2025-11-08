import express from "express";
import {
    createContact,
    checkContact,
    getShopContacts,
    updateContactStatus
} from "../controllers/contactController.js";
import { authenticateToken, requireRole, optionalAuth } from "../middlewares/auth.js";

const router = express.Router();

// Public route - Customer can contact shop (auth optional)
router.post("/", optionalAuth, createContact);

// Check if customer has contacted (auth optional)
router.get("/check/:productId", optionalAuth, checkContact);

// Shop routes - require authentication and SHOP role
router.use(authenticateToken);
router.get("/shop/my-contacts", requireRole(["SHOP"]), getShopContacts);
router.put("/:id/status", requireRole(["SHOP"]), updateContactStatus);

export default router;

