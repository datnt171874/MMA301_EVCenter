import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; 

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token không được cung cấp"
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Token không hợp lệ"
            });
        }

        req.user = decoded;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Token không hợp lệ"
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token đã hết hạn"
            });
        }
        
        console.error("Auth middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi xác thực"
        });
    }
};


export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Chưa xác thực"
            });
        }

        if (!roles.includes(req.user.roleName)) {
            return res.status(403).json({
                success: false,
                message: "Không có quyền truy cập"
            });
        }

        next();
    };
};
