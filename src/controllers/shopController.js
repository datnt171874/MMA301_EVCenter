import { Shop } from "../models/Shop.js";
import { User } from "../models/User.js";


export const getShopProfile = async (req, res) => {
    try {
        const shopId = req.user.userId;

        const shop = await Shop.findOne({ shopId })
            .populate("shopId", "email fullName phoneNumber");

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop không tồn tại"
            });
        }

        res.json({
            success: true,
            data: { shop }
        });

    } catch (error) {
        console.error("Get shop profile error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thông tin shop"
        });
    }
};


export const updateShopProfile = async (req, res) => {
    try {
        const shopId = req.user.userId;
        const { shopName, address, description, logo } = req.body;

        let shop = await Shop.findOne({ shopId });

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop không tồn tại"
            });
        }

        
        if (shopName) shop.shopName = shopName;
        if (address !== undefined) shop.address = address;
        if (description !== undefined) shop.description = description;
        if (logo !== undefined) shop.logo = logo;

        await shop.save();

        res.json({
            success: true,
            message: "Cập nhật thông tin shop thành công",
            data: { shop }
        });

    } catch (error) {
        console.error("Update shop profile error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật thông tin shop"
        });
    }
};


export const uploadCertificate = async (req, res) => {
    try {
        const shopId = req.user.userId;
        const { sellingCertificate } = req.body;

        if (!sellingCertificate) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp giấy phép kinh doanh"
            });
        }

        let shop = await Shop.findOne({ shopId });

        if (!shop) {
            shop = new Shop({
                shopId,
                shopName: "Shop của " + req.user.email,
                address: "",
                sellingCertificate
            });
            await shop.save();
        } else {
            shop.sellingCertificate = sellingCertificate;
            shop.isVerified = false; 
            await shop.save();
        }

        res.json({
            success: true,
            message: "Upload giấy phép kinh doanh thành công, đang chờ Admin xác nhận",
            data: { shop }
        });

    } catch (error) {
        console.error("Upload certificate error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi upload giấy phép"
        });
    }
};
