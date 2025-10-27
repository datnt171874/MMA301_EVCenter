import mongoose, { Schema } from "mongoose";

export const PACKAGE_TYPES = {
    BRONZE: "BRONZE", // 4 posts miễn phí
    GOLD: "GOLD",     // 8 posts miễn phí
};

const packageSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        type: { type: String, enum: Object.values(PACKAGE_TYPES), required: true },
        price: { type: Number, required: true, min: 0 },
        freePosts: { type: Number, required: true, min: 0 }, 
        description: { type: String, trim: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Package = mongoose.models.Package || mongoose.model("Package", packageSchema);
