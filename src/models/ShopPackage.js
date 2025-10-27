import mongoose, { Schema } from "mongoose";

export const SHOP_PACKAGE_STATUS = {
    ACTIVE: "ACTIVE",
    EXPIRED: "EXPIRED",
    CANCELLED: "CANCELLED",
};

const shopPackageSchema = new Schema(
    {
        shopId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        packageId: { type: Schema.Types.ObjectId, ref: "Package", required: true },
        transactionId: { type: Schema.Types.ObjectId, ref: "Transaction", required: true },
        
        
        packageName: { type: String, required: true },
        packageType: { type: String, required: true },
        freePosts: { type: Number, required: true },
        usedPosts: { type: Number, default: 0 },
        remainingPosts: { type: Number, required: true },
        
        
        purchasedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
        status: { type: String, enum: Object.values(SHOP_PACKAGE_STATUS), default: SHOP_PACKAGE_STATUS.ACTIVE },
    },
    { timestamps: true }
);

shopPackageSchema.index({ shopId: 1, status: 1 });
shopPackageSchema.index({ packageId: 1 });

export const ShopPackage = mongoose.models.ShopPackage || mongoose.model("ShopPackage", shopPackageSchema);
