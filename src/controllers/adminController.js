import { User } from "../models/User.js";
import { Transaction, TRANSACTION_TYPES } from "../models/Wallet.js";
import { ShopPackage } from "../models/ShopPackage.js";
import { Package } from "../models/Package.js";


export const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalShops = await User.countDocuments({ roleName: "SHOP" });
        const totalCustomers = await User.countDocuments({ roleName: "CUSTOMER" });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalShops,
                totalCustomers,
            }
        });

    } catch (error) {
        console.error("Get stats error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thống kê"
        });
    }
};


export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 50, roleName, isBanned } = req.query;
        
        let filter = {};
        if (roleName) filter.roleName = roleName;
        if (isBanned !== undefined) filter.isBanned = isBanned === "true";

        const users = await User.find(filter)
            .select("-passwordHash")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(filter);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    current: Number(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách user"
        });
    }
};


export const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { isBanned } = req.body;

        if (typeof isBanned !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isBanned phải là boolean"
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy user"
            });
        }

        // Không cho phép ban admin
        if (user.roleName === "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Không thể khóa tài khoản Admin"
            });
        }

        user.isBanned = isBanned;
        await user.save();

        res.json({
            success: true,
            message: isBanned ? "Khóa user thành công" : "Mở khóa user thành công",
            data: { user }
        });

    } catch (error) {
        console.error("Ban user error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi khóa/mở khóa user"
        });
    }
};


export const getRevenue = async (req, res) => {
    try {
        // Lấy tất cả transactions mua gói (amount âm vì là chi tiêu)
        const transactions = await Transaction.find({
            type: TRANSACTION_TYPES.PURCHASE_PACKAGE,
            status: "COMPLETED"
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate("shopId", "email");

        // Tính tổng doanh thu (lấy giá trị dương)
        const totalRevenue = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // Thống kê theo gói
        const packageStats = {};
        for (const transaction of transactions) {
            if (transaction.referenceId) {
                const shopPackage = await ShopPackage.findOne({
                    transactionId: transaction._id
                }).populate("packageId", "name type");
                
                if (shopPackage && shopPackage.packageId) {
                    const packageName = shopPackage.packageId.name || shopPackage.packageName;
                    if (!packageStats[packageName]) {
                        packageStats[packageName] = {
                            packageName,
                            count: 0,
                            revenue: 0
                        };
                    }
                    packageStats[packageName].count += 1;
                    packageStats[packageName].revenue += Math.abs(transaction.amount);
                }
            }
        }

        const packageStatsArray = Object.values(packageStats);

        res.json({
            success: true,
            data: {
                totalRevenue,
                transactions: transactions.slice(0, 50), // Chỉ trả về 50 giao dịch gần nhất
                packageStats: packageStatsArray
            }
        });

    } catch (error) {
        console.error("Get revenue error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy doanh thu"
        });
    }
};


