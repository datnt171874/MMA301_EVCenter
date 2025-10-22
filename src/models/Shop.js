import mongoose, { Schema } from "mongoose";

const shopSchema = new Schema(
    {
        shopId: {type: Schema.Types.ObjectId, ref: "User", required: true, index: true},
        shopName: { type: String, required: true, trim: true },
        address: { type: String, trim: true },
        description: { type: String, trim: true },
        logo: { type: String }, 
        isActive: { type: Boolean, default: true },
        isVerified: { type: Boolean, default: false }, 
    },
    { timestamps: true }
);

shopSchema.index({ email: 1 }, { unique: true });
shopSchema.index({ shopName: "text" });

export const Shop = mongoose.models.Shop || mongoose.model("Shop", shopSchema);
