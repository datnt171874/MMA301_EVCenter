import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        roleName: {type: String, enum: ["ADMIN", "SHOP", "CUSTOMER"]},
        passwordHash: { type: String, required: true },
        phoneNumber: { type: String, trim: true },
        address: { type: String, trim: true },
        dateOfBirth: { type: Date },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);