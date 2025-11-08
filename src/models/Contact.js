import mongoose, { Schema } from "mongoose";

export const CONTACT_STATUS = {
    PENDING: "PENDING",       // Chờ xử lý
    CONTACTED: "CONTACTED",   // Đã liên hệ
    CLOSED: "CLOSED"          // Đã đóng
};

const contactSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        shopId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        customerId: { type: Schema.Types.ObjectId, ref: "User" }, // Optional, có thể là guest
        customerName: { type: String, required: true, trim: true },
        customerPhone: { type: String, required: true, trim: true },
        customerEmail: { type: String, required: true, trim: true },
        message: { type: String, trim: true },
        status: { type: String, enum: Object.values(CONTACT_STATUS), default: CONTACT_STATUS.PENDING },
    },
    { timestamps: true }
);

contactSchema.index({ shopId: 1, status: 1 });
contactSchema.index({ productId: 1 });

export const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);

