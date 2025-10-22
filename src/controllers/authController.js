import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Shop } from "../models/Shop.js";
import { Customer } from "../models/Customer.js";

const JWT_SECRET = process.env.JWT_SECRET || "ThisIsAVeryLongPasswordForEVCenterProjectAndWeAreTryingToPassMMA";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";


export const register = async (req, res) => {
    try {
        const { 
            email, 
            password, 
            confirmPassword
        } = req.body;

        
        if (!email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin bắt buộc"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu xác nhận không khớp"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu phải có ít nhất 6 ký tự"
            });
        }


        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email đã được sử dụng"
            });
        }

        
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        
        const user = new User({
            fullName: "", 
            email,
            passwordHash,
            roleName: "CUSTOMER", 
            phoneNumber: "",
            address: "",
            dateOfBirth: null
        });

        await user.save();

        
        const customer = new Customer({
            customerId: user._id,
            dateOfBirth: null
        });
        await customer.save();

       
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email, 
                roleName: user.roleName 
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    roleName: user.roleName
                },
                token
            }
        });

    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi đăng ký",
            error: error.message
        });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập email và mật khẩu" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, roleName: user.roleName },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.json({
            success: true,
            message: "Đăng nhập thành công",
            data: {
                user: { id: user._id, email: user.email, roleName: user.roleName },
                token,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Lỗi server khi đăng nhập" });
    }
};
