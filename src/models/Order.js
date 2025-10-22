import mongoose, { Schema } from "mongoose";

export const ORDER_STATUS = {
    PENDING: "PENDING", 
    PAID: "PAID",
    CANCELLED: "CANCELLED",
    FULFILLED: "COMPLETED", 
};


const orderItemSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        priceAmount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: "VND" },
        quantity: { type: Number, required: true, min: 1 },
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    },
    { _id: false }
);

const orderSchema = new Schema(
    {
        customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
        items: { type: [orderItemSchema], validate: v => Array.isArray(v) && v.length > 0 },
        shippingAddress: { type: String, required: true },
        note: { type: String, trim: true },

        subtotalAmount: { type: Number, required: true, min: 0 },
        shippingFeeAmount: { type: Number, default: 0, min: 0 },
        totalAmount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: "VND" },

        status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING, index: true },
        paidAt: { type: Date },
        completedAt: { type: Date },
        cancelledAt: { type: Date },
        cancelledReason: { type: String },
    },
    { timestamps: true }
);

orderSchema.index({ customerId: 1, status: 1, createdAt: -1 });

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);


