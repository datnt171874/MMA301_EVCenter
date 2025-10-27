import { Package, PACKAGE_TYPES } from "../models/Package.js";
import { ShopPackage, SHOP_PACKAGE_STATUS } from "../models/ShopPackage.js";
import { Wallet, Transaction, TRANSACTION_TYPES, TRANSACTION_STATUS } from "../models/Wallet.js";


export const getAllPackages = async (req, res) => {
    try {
        const packages = await Package.find({ isActive: true }).sort({ price: 1 });

        res.json({
            success: true,
            data: { packages }
        });

    } catch (error) {
        console.error("Get packages error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách gói"
        });
    }
};


export const getShopPackages = async (req, res) => {
    try {
        const shopId = req.user.userId;
        const { page = 1, limit = 10 } = req.query;

        const shopPackages = await ShopPackage.find({ shopId })
            .populate("packageId", "name type price freePosts")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await ShopPackage.countDocuments({ shopId });

        res.json({
            success: true,
            data: {
                packages: shopPackages,
                pagination: {
                    current: Number(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error("Get shop packages error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy gói của shop"
        });
    }
};


export const purchasePackage = async (req, res) => {
    try {
        const { packageId } = req.body;
        const shopId = req.user.userId;

        
        const packageInfo = await Package.findById(packageId);
        if (!packageInfo || !packageInfo.isActive) {
            return res.status(400).json({
                success: false,
                message: "Gói không tồn tại hoặc không khả dụng"
            });
        }

        
        let wallet = await Wallet.findOne({ shopId });
        if (!wallet) {
            wallet = new Wallet({ shopId, balance: 0 });
            await wallet.save();
        }

       
        if (wallet.balance < packageInfo.price) {
            return res.status(400).json({
                success: false,
                message: "Số dư không đủ để mua gói này"
            });
        }

        
        const transaction = new Transaction({
            walletId: wallet._id,
            shopId,
            type: TRANSACTION_TYPES.PURCHASE_PACKAGE,
            amount: -packageInfo.price, 
            description: `Mua gói ${packageInfo.name}`,
            referenceId: packageId,
            status: TRANSACTION_STATUS.PENDING
        });
        await transaction.save();

        
        wallet.balance -= packageInfo.price;
        await wallet.save();

        
        const shopPackage = new ShopPackage({
            shopId,
            packageId,
            transactionId: transaction._id,
            packageName: packageInfo.name,
            packageType: packageInfo.type,
            freePosts: packageInfo.freePosts,
            remainingPosts: packageInfo.freePosts,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 ngay
        });
        await shopPackage.save();

        
        transaction.status = TRANSACTION_STATUS.COMPLETED;
        transaction.completedAt = new Date();
        await transaction.save();

        res.status(201).json({
            success: true,
            message: "Mua gói thành công",
            data: {
                shopPackage,
                wallet: { balance: wallet.balance }
            }
        });

    } catch (error) {
        console.error("Purchase package error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi mua gói"
        });
    }
};


export const getRemainingPosts = async (req, res) => {
    try {
        const shopId = req.user.userId;

        
        const activePackages = await ShopPackage.find({
            shopId,
            status: SHOP_PACKAGE_STATUS.ACTIVE,
            remainingPosts: { $gt: 0 }
        });

        const totalRemaining = activePackages.reduce((sum, pkg) => sum + pkg.remainingPosts, 0);

        res.json({
            success: true,
            data: {
                remainingPosts: totalRemaining,
                packages: activePackages
            }
        });

    } catch (error) {
        console.error("Get remaining posts error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy số bài còn lại"
        });
    }
};


