import { User } from "../models/User.js";

export const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const user = await User.findById(userId).select("-passwordHash");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy user"
            });
        }

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thông tin profile"
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { fullName, phoneNumber, address, dateOfBirth } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy user"
            });
        }

        // Update fields
        if (fullName !== undefined) user.fullName = fullName?.trim() || "";
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber?.trim() || "";
        if (address !== undefined) user.address = address?.trim() || "";
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth || null;

        await user.save();

        // Return user without password
        const userResponse = await User.findById(userId).select("-passwordHash");

        res.json({
            success: true,
            message: "Cập nhật profile thành công",
            data: { user: userResponse }
        });

    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật profile"
        });
    }
};

