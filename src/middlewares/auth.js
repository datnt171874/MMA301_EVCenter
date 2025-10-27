import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "ThisIsAVeryLongPasswordForEVCenterProjectAndWeAreTryingToPassMMA";

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; 

        console.log("Auth header:", authHeader);
        console.log("Token:", token);
        console.log("JWT_SECRET:", JWT_SECRET);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token không được cung cấp"
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Decoded token:", decoded);
        
        
        const user = await User.findById(decoded.userId);
        console.log("Found user:", user);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Token không hợp lệ"
            });
        }

        req.user = decoded;
        next();

    } catch (error) {
        console.error("Auth middleware error:", error);
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
