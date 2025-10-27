import { Product, PRODUCT_STATUS, PRODUCT_CATEGORIES } from "../models/Product.js";
import { Shop } from "../models/Shop.js";
import { ShopPackage, SHOP_PACKAGE_STATUS } from "../models/ShopPackage.js";
import { User } from "../models/User.js";


export const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, brand, minPrice, maxPrice, search } = req.query;
        
        let filter = { status: PRODUCT_STATUS.APPROVED };
        
        if (category) filter.category = category;
        if (brand) filter.brand = brand;
        if (minPrice || maxPrice) {
            filter["price.amount"] = {};
            if (minPrice) filter["price.amount"].$gte = Number(minPrice);
            if (maxPrice) filter["price.amount"].$lte = Number(maxPrice);
        }
        if (search) {
            filter.$text = { $search: search };
        }

        const products = await Product.find(filter)
            .populate("shopId", "shopName logo")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    current: Number(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách sản phẩm"
        });
    }
};


export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findById(id)
            .populate("shopId", "shopName logo address");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            });
        }

        res.json({
            success: true,
            data: { product }
        });

    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thông tin sản phẩm"
        });
    }
};


export const createProduct = async (req, res) => {
    try {
        const { name, description, images, category, brand, price, stock, specs } = req.body;
        const shopId = req.user.userId;

        
        const shop = await Shop.findOne({ shopId });
        if (!shop) {
            const newShop = new Shop({
                shopId,
                shopName: "Shop của " + req.user.email, 
                address: ""
            });
            await newShop.save();
        }

        
        const activePackages = await ShopPackage.find({
            shopId,
            status: SHOP_PACKAGE_STATUS.ACTIVE,
            remainingPosts: { $gt: 0 }
        });

        if (activePackages.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Bạn cần mua gói để đăng sản phẩm. Số lượt đăng miễn phí đã hết."
            });
        }

        
        const packageToUse = activePackages[0];
        packageToUse.usedPosts += 1;
        packageToUse.remainingPosts -= 1;
        await packageToUse.save();

        const product = new Product({
            name,
            description,
            images,
            shopId,
            category,
            brand,
            price,
            stock,
            specs,
            status: PRODUCT_STATUS.PENDING
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: "Tạo sản phẩm thành công",
            data: { 
                product,
                remainingPosts: packageToUse.remainingPosts
            }
        });

    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi tạo sản phẩm"
        });
    }
};


export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const shopId = req.user.userId;

        const product = await Product.findOne({ _id: id, shopId });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm hoặc không có quyền chỉnh sửa"
            });
        }

        Object.assign(product, updates);
        await product.save();

        res.json({
            success: true,
            message: "Cập nhật sản phẩm thành công",
            data: { product }
        });

    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật sản phẩm"
        });
    }
};


export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const shopId = req.user.userId;

        const product = await Product.findOne({ _id: id, shopId });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm hoặc không có quyền xóa"
            });
        }

        await Product.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Xóa sản phẩm thành công"
        });

    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa sản phẩm"
        });
    }
};


export const getShopProducts = async (req, res) => {
    try {
        const shopId = req.user.userId;
        const { page = 1, limit = 10 } = req.query;

        const products = await Product.find({ shopId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments({ shopId });

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    current: Number(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error("Get shop products error:", error);
    }
};

export const approveProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectedReason } = req.body;

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status phải là APPROVED hoặc REJECTED"
            });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            });
        }

        product.status = status;
        if (status === "APPROVED") {
            product.approvedAt = new Date();
            product.rejectedReason = null;
        } else {
            product.rejectedReason = rejectedReason;
        }

        await product.save();

        res.json({
            success: true,
            message: `Sản phẩm đã được ${status === "APPROVED" ? "duyệt" : "từ chối"}`,
            data: { product }
        });

    } catch (error) {
        console.error("Approve product error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi duyệt sản phẩm"
        });
    }
};
