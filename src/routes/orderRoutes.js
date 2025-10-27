import express from "express";
import { 
    createOrder, 
    getCustomerOrders, 
    getOrderById, 
    cancelOrder 
} from "../controllers/orderController.js";
import { authenticateToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();


router.use(authenticateToken);


router.post("/", requireRole(["CUSTOMER"]), createOrder);
router.get("/", requireRole(["CUSTOMER"]), getCustomerOrders);
router.get("/:id", requireRole(["CUSTOMER"]), getOrderById);
router.put("/:id/cancel", requireRole(["CUSTOMER"]), cancelOrder);

export default router;
