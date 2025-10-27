import { Order } from "../models/Order.js";
import { Product, PRODUCT_STATUS } from "../models/Product.js";
import { Invoice } from "../models/Invoice.js";
import { Customer } from "../models/Customer.js";


export const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, note } = req.body;
        const customerId = req.user.userId;

        
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Danh sách sản phẩm không được để trống"
            });
        }

        
        let subtotalAmount = 0;
        const orderItems = [];
        const shopIds = new Set();

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm ${item.productId} không tồn tại`
                });
            }

            
            if (product.status !== PRODUCT_STATUS.APPROVED) {
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm "${product.name}" chưa được duyệt bởi Admin, không thể mua`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm ${product.name} không đủ hàng`
                });
            }

            const itemTotal = product.price.amount * item.quantity;
            subtotalAmount += itemTotal;
            shopIds.add(product.shopId.toString());

            orderItems.push({
                productId: product._id,
                name: product.name,
                priceAmount: product.price.amount,
                currency: product.price.currency,
                quantity: item.quantity,
                shopId: product.shopId
            });
        }

        const shippingFeeAmount = 0; 
        const totalAmount = subtotalAmount + shippingFeeAmount;

        
        const order = new Order({
            customerId,
            items: orderItems,
            shippingAddress,
            note,
            subtotalAmount,
            shippingFeeAmount,
            totalAmount,
            currency: "VND",
            status: "PENDING"
        });

        await order.save();

        
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } }
            );
        }

        
        const invoice = new Invoice({
            orderId: order._id,
            customerId,
            shopIds: Array.from(shopIds),
            amount: totalAmount,
            currency: "VND",
            paymentMethod: "COD",
            status: "UNPAID"
        });

        await invoice.save();

        res.status(201).json({
            success: true,
            message: "Tạo đơn hàng thành công",
            data: {
                order,
                invoice: {
                    id: invoice._id,
                    amount: invoice.amount,
                    status: invoice.status
                }
            }
        });

    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi tạo đơn hàng"
        });
    }
};


export const getCustomerOrders = async (req, res) => {
    try {
        const customerId = req.user.userId;
        const { page = 1, limit = 10, status } = req.query;

        let filter = { customerId };
        if (status) filter.status = status;

        const orders = await Order.find(filter)
            .populate("items.productId", "name images")
            .populate("items.shopId", "shopName")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    current: Number(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error("Get customer orders error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy đơn hàng"
        });
    }
};


export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.userId;

        const order = await Order.findOne({ _id: id, customerId })
            .populate("items.productId", "name images specs")
            .populate("items.shopId", "shopName logo");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng"
            });
        }

        res.json({
            success: true,
            data: { order }
        });

    } catch (error) {
        console.error("Get order error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thông tin đơn hàng"
        });
    }
};


export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const customerId = req.user.userId;

        const order = await Order.findOne({ _id: id, customerId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng"
            });
        }

        if (order.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Chỉ có thể hủy đơn hàng đang chờ thanh toán"
            });
        }

        
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: item.quantity } }
            );
        }

        
        order.status = "CANCELLED";
        order.cancelledAt = new Date();
        order.cancelledReason = reason;
        await order.save();

        res.json({
            success: true,
            message: "Hủy đơn hàng thành công"
        });

    } catch (error) {
        console.error("Cancel order error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi hủy đơn hàng"
        });
    }
};
