import mongoose, { Schema } from "mongoose";

export const INVOICE_STATUS = {
    UNPAID: "UNPAID",
    PAID: "PAID"
};

const invoiceSchema = new Schema(
    {
        orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
        customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
        shopId: [{ type: Schema.Types.ObjectId, ref: "Shop" }],
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: "VND" },
        paymentMethod: { type: String, enum: ["COD", "VNPAY", "MOMO", "BANK_TRANSFER"], default: "COD" },
        transactionRef: { type: String },
        status: { type: String, enum: Object.values(INVOICE_STATUS), default: INVOICE_STATUS.UNPAID, index: true },
        paidAt: { type: Date },
        refundedAt: { type: Date },
        notes: { type: String, trim: true },
    },
    { timestamps: true }
);

invoiceSchema.index({ customerId: 1, status: 1, createdAt: -1 });

export const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);


