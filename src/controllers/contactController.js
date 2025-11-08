import { Contact, CONTACT_STATUS } from "../models/Contact.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

export const createContact = async (req, res) => {
    try {
        const { productId, customerName, customerPhone, customerEmail, message } = req.body;
        const customerId = req.user?.userId; // Optional, có thể là guest

        // Validate required fields
        if (!productId || !customerName || !customerPhone || !customerEmail) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin (tên, số điện thoại, email)"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ"
            });
        }

        // Validate phone format (Vietnamese phone)
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(customerPhone.replace(/\s/g, ""))) {
            return res.status(400).json({
                success: false,
                message: "Số điện thoại không hợp lệ"
            });
        }

        // Check if product exists and populate shopId with shopId field
        const product = await Product.findById(productId).populate("shopId", "shopName logo address shopId");
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            });
        }

        // Get shop user ID - product.shopId is the Shop document
        // shop.shopId is the reference to User (the shopId field in Shop model)
        const shop = product.shopId;
        if (!shop || !shop.shopId) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thông tin Shop"
            });
        }

        // shop.shopId is the reference to User
        const shopUserId = shop.shopId;

        // Create contact
        const contact = new Contact({
            productId,
            shopId: shopUserId,
            customerId: customerId || null,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            customerEmail: customerEmail.trim(),
            message: message?.trim() || "",
            status: CONTACT_STATUS.PENDING,
        });

        await contact.save();

        res.json({
            success: true,
            message: "Gửi thông tin liên hệ thành công. Shop sẽ liên hệ với bạn sớm nhất.",
            data: { contact }
        });

    } catch (error) {
        console.error("Create contact error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi gửi thông tin liên hệ"
        });
    }
};

export const checkContact = async (req, res) => {
    try {
        const { productId } = req.params;
        const customerId = req.user?.userId;
        const { customerEmail } = req.query; // Optional: check by email if not logged in

        if (!customerId && !customerEmail) {
            return res.json({
                success: true,
                data: { hasContacted: false }
            });
        }

        let filter = { productId };
        if (customerId) {
            filter.customerId = customerId;
        } else if (customerEmail) {
            filter.customerEmail = customerEmail.trim();
        }

        const contact = await Contact.findOne(filter);

        res.json({
            success: true,
            data: { 
                hasContacted: !!contact,
                contact: contact ? {
                    _id: contact._id,
                    status: contact.status,
                    createdAt: contact.createdAt
                } : null
            }
        });

    } catch (error) {
        console.error("Check contact error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi kiểm tra liên hệ"
        });
    }
};

export const getShopContacts = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const shopId = req.user?.userId;

        if (!shopId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        let filter = { shopId };
        if (status) {
            filter.status = status;
        }

        const contacts = await Contact.find(filter)
            .populate("productId", "name images price")
            .populate("customerId", "email fullName")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Contact.countDocuments(filter);

        res.json({
            success: true,
            data: {
                contacts,
                pagination: {
                    current: Number(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error("Get contacts error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách liên hệ"
        });
    }
};

export const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const shopId = req.user?.userId;

        if (!shopId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!Object.values(CONTACT_STATUS).includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status không hợp lệ"
            });
        }

        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy liên hệ"
            });
        }

        if (contact.shopId.toString() !== shopId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền cập nhật liên hệ này"
            });
        }

        contact.status = status;
        await contact.save();

        res.json({
            success: true,
            message: "Cập nhật trạng thái thành công",
            data: { contact }
        });

    } catch (error) {
        console.error("Update contact status error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật trạng thái"
        });
    }
};
