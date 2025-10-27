import mongoose, { Schema } from "mongoose";

export const TRANSACTION_TYPES = {
    DEPOSIT: "DEPOSIT",           // Nạp tiền
    WITHDRAW: "WITHDRAW",         // Rút tiền
    PURCHASE_PACKAGE: "PURCHASE_PACKAGE", // Mua gói
    REFUND: "REFUND",             // Hoàn tiền
};

export const TRANSACTION_STATUS = {
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
};

const walletSchema = new Schema(
    {
        shopId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        balance: { type: Number, default: 0, min: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const transactionSchema = new Schema(
    {
        walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
        shopId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: Object.values(TRANSACTION_TYPES), required: true },
        amount: { type: Number, required: true },
        description: { type: String, trim: true },
        status: { type: String, enum: Object.values(TRANSACTION_STATUS), default: TRANSACTION_STATUS.PENDING },
        referenceId: { type: String }, // ID của package hoặc order
        completedAt: { type: Date },
    },
    { timestamps: true }
);

walletSchema.index({ shopId: 1 });
transactionSchema.index({ shopId: 1, createdAt: -1 });

export const Wallet = mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);
export const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
