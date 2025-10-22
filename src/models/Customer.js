import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema(
    {
        customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        dateOfBirth: { type: Date }
    },
    { timestamps: true }
);

customerSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ fullName: "text" });

export const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
