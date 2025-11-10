import mongoose from "mongoose";
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

        let products = await Product.find(filter)
            .populate({
                path: "shopId",
                select: "shopName logo",
                model: "Shop"
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean(); // Sử dụng lean() để có thể modify object

        // Xử lý trường hợp shopId không được populate đúng
        // Populate có thể fail nếu shopId không phải là ObjectId hợp lệ của Shop document
        const shopIdsToFetch = [];
        const productShopMap = new Map(); // Map để track product và shopId của nó
        
        for (let product of products) {
            if (product.shopId) {
                const shopIdObj = product.shopId;
                
                // Kiểm tra xem shopId có được populate thành công không (có shopName)
                // Populate thành công khi có shopName và là object
                const isPopulated = shopIdObj && 
                                   typeof shopIdObj === 'object' && 
                                   shopIdObj.shopName && 
                                   shopIdObj.shopName.trim() !== '';
                
                if (isPopulated) {
                    // Đã populate thành công, đảm bảo format đúng
                    product.shopId = {
                        _id: shopIdObj._id,
                        shopName: shopIdObj.shopName || "Shop",
                        logo: shopIdObj.logo || null
                    };
                } else {
                    // shopId không được populate hoặc thiếu thông tin, cần tìm Shop document
                    // shopIdObj có thể là ObjectId của Shop document hoặc object có _id
                    let shopIdValue = null;
                    
                    if (shopIdObj && shopIdObj._id) {
                        shopIdValue = shopIdObj._id;
                    } else if (shopIdObj) {
                        shopIdValue = shopIdObj;
                    }
                    
                    if (shopIdValue) {
                        shopIdsToFetch.push(shopIdValue);
                        productShopMap.set(product._id.toString(), shopIdValue);
                    } else {
                        product.shopId = null;
                    }
                }
            } else {
                product.shopId = null;
            }
        }

        // Tìm tất cả Shop documents cần thiết trong một query
        if (shopIdsToFetch.length > 0) {
            // Loại bỏ duplicate shopIds và chuyển đổi sang ObjectId
            const validObjectIds = [];
            const idStringMap = new Map(); // Map từ string id đến ObjectId để lookup
            
            shopIdsToFetch.forEach(id => {
                try {
                    const idStr = id.toString();
                    const objectId = id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(idStr);
                    if (!idStringMap.has(idStr)) {
                        validObjectIds.push(objectId);
                        idStringMap.set(idStr, objectId);
                    }
                } catch (e) {
                    console.warn(`Invalid ObjectId: ${id}`, e.message);
                }
            });
            
            // Tìm Shop bằng _id trước (vì Product.shopId là ObjectId của Shop document)
            let shops = await Shop.find({
                _id: { $in: validObjectIds }
            });

            console.log(`Looking for ${validObjectIds.length} shops by _id, found ${shops.length} shops`);
            
            // Nếu không tìm đủ, có thể shopId là userId (sản phẩm cũ), thử tìm bằng shopId field
            if (shops.length < validObjectIds.length) {
                const foundIds = shops.map(s => s._id.toString());
                const missingIds = validObjectIds.map(id => id.toString()).filter(id => !foundIds.includes(id));
                console.warn(`Missing shops by _id, trying to find by shopId field. Missing IDs:`, missingIds);
                
                // Tìm Shop bằng shopId field (nếu shopId là userId)
                const shopsByUserId = await Shop.find({
                    shopId: { $in: missingIds.map(id => {
                        try {
                            return new mongoose.Types.ObjectId(id);
                        } catch (e) {
                            return null;
                        }
                    }).filter(id => id !== null) }
                });
                
                console.log(`Found ${shopsByUserId.length} shops by shopId field`);
                shops = [...shops, ...shopsByUserId];
            }

            // Tạo map để lookup nhanh bằng _id của Shop
            const shopMap = new Map();
            shops.forEach(shop => {
                const shopIdStr = shop._id.toString();
                shopMap.set(shopIdStr, shop);
                console.log(`Mapped shop ${shopIdStr} (shopName: ${shop.shopName}, shopId field: ${shop.shopId})`);
            });
            
            // Cũng map bằng shopId field để tìm được sản phẩm cũ
            shops.forEach(shop => {
                if (shop.shopId) {
                    const userIdStr = shop.shopId.toString();
                    if (!shopMap.has(userIdStr)) {
                        shopMap.set(userIdStr, shop);
                        console.log(`Also mapped userId ${userIdStr} to shop ${shop._id}`);
                    }
                }
            });

            // Cập nhật products với thông tin Shop
            products.forEach(product => {
                const productId = product._id.toString();
                const shopIdValue = productShopMap.get(productId);
                
                if (shopIdValue) {
                    const shopIdStr = shopIdValue.toString();
                    const shop = shopMap.get(shopIdStr);
                    
                    if (shop) {
                        product.shopId = {
                            _id: shop._id,
                            shopName: shop.shopName || "Shop",
                            logo: shop.logo || null
                        };
                    } else {
                        // Không tìm thấy Shop, log để debug
                        console.warn(`Shop not found for product ${productId}, shopId: ${shopIdStr}`);
                        product.shopId = null;
                    }
                }
            });
        }

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
        const userId = req.user.userId;

        // Tìm hoặc tạo Shop document
        let shop = await Shop.findOne({ shopId: userId });
        if (!shop) {
            // Tạo Shop mới nếu chưa tồn tại
            const newShop = new Shop({
                shopId: userId,
                shopName: "Shop của " + req.user.email, 
                address: ""
            });
            await newShop.save();
            shop = newShop;
            console.log(`Created new Shop for user ${req.user.email}, Shop ID: ${shop._id}`);
        } else {
            console.log(`Found existing Shop for user ${req.user.email}, Shop ID: ${shop._id}`);
        }

        // Lấy ObjectId của Shop document để lưu vào Product
        const shopDocumentId = shop._id;
        
        // Đảm bảo shopDocumentId là ObjectId hợp lệ
        if (!shopDocumentId) {
            console.error(`Shop document ID is null for user ${req.user.email}`);
            return res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thông tin Shop"
            });
        }

        
        const activePackages = await ShopPackage.find({
            shopId: userId,
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
            shopId: shopDocumentId, // Lưu ObjectId của Shop document, không phải userId
            category,
            brand,
            price,
            stock,
            specs,
            status: PRODUCT_STATUS.PENDING
        });

        await product.save();
        
        // Log để debug
        console.log(`Created product ${product._id} for shop ${shopDocumentId} (user: ${req.user.email})`);
        console.log(`Product shopId type: ${typeof product.shopId}, value: ${product.shopId}`);

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
        const userId = req.user.userId;

        // Tìm Shop để lấy ObjectId của Shop document
        const shop = await Shop.findOne({ shopId: userId });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Shop"
            });
        }

        const product = await Product.findOne({ _id: id, shopId: shop._id });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm hoặc không có quyền chỉnh sửa"
            });
        }

        // Shop chỉ có thể cập nhật status thành INACTIVE nếu sản phẩm đã APPROVED
        // Không thể thay đổi status từ PENDING/REJECTED thành APPROVED (chỉ Admin mới làm được)
        if (updates.status) {
            if (updates.status === "INACTIVE" && product.status === "APPROVED") {
                // Cho phép Shop ẩn sản phẩm đã được duyệt
                product.status = "INACTIVE";
            } else if (updates.status === "APPROVED" && product.status === "INACTIVE") {
                // Cho phép Shop hiện lại sản phẩm đã bị ẩn
                product.status = "APPROVED";
            } else if (updates.status !== product.status) {
                // Không cho phép thay đổi status khác
                return res.status(403).json({
                    success: false,
                    message: "Bạn chỉ có thể ẩn/hiện sản phẩm đã được duyệt"
                });
            }
            // Xóa status khỏi updates để không ghi đè lại
            delete updates.status;
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
        const userId = req.user.userId;

        // Tìm Shop để lấy ObjectId của Shop document
        const shop = await Shop.findOne({ shopId: userId });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Shop"
            });
        }

        const product = await Product.findOne({ _id: id, shopId: shop._id });
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
        const userId = req.user.userId;
        const { page = 1, limit = 10 } = req.query;

        // Tìm Shop để lấy ObjectId của Shop document
        const shop = await Shop.findOne({ shopId: userId });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy Shop"
            });
        }

        const products = await Product.find({ shopId: shop._id })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments({ shopId: shop._id });

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
