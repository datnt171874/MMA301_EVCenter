import express from "express";
import { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    getShopProducts,
    approveProduct
} from "../controllers/productController.js";
import { authenticateToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.use(authenticateToken);

// Shop routes
router.post("/", requireRole(["SHOP"]), createProduct);
router.get("/shop/my-products", requireRole(["SHOP"]), getShopProducts);
router.put("/:id", requireRole(["SHOP"]), updateProduct);
router.delete("/:id", requireRole(["SHOP"]), deleteProduct);

// Admin routes
router.put("/:id/approve", requireRole(["ADMIN"]), approveProduct);

export default router;
