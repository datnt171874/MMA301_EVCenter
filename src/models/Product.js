import mongoose, { Schema } from "mongoose";

export const PRODUCT_STATUS = {
    PENDING: "PENDING",     // Chờ duyệt
    APPROVED: "APPROVED",    // Đã duyệt
    REJECTED: "REJECTED",    // Từ chối
    INACTIVE: "INACTIVE"     // Ngừng bán
};

export const PRODUCT_CATEGORIES = {
    BATTERY: "BATTERY",       // Pin xe điện
    ELECTRIC_SCOOTER: "ELECTRIC_SCOOTER"  // Xe điện
};

const priceSchema = new Schema(
    {
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: "VND" },
    },
    { _id: false }
);

const specSchema = new Schema(
    {
        batteryCapacityWh: { type: Number },
        motorPowerW: { type: Number },
        rangeKm: { type: Number },
        topSpeedKmh: { type: Number },
        weightKg: { type: Number },
    },
    { _id: false }
);

const productSchema = new Schema(
    {
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        images: [{ type: String }],       
        category: { type: String, enum: Object.values(PRODUCT_CATEGORIES), required: true },
        brand: { type: String, trim: true },
        price: { type: priceSchema, required: true },
        stock: { type: Number, default: 0, min: 0 },
        specs: { type: specSchema },
        status: { type: String, enum: Object.values(PRODUCT_STATUS), default: PRODUCT_STATUS.PENDING, index: true },
        approvedAt: { type: Date },
        rejectedReason: { type: String },
    },
    { timestamps: true }
);

productSchema.index({ name: "text", brand: "text", description: "text" });
productSchema.index({ shopId: 1, status: 1 });

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);


