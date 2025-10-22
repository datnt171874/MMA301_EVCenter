import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema(
    {
        customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        dateOfBirth: { type: Date }
    },
    { timestamps: true }
);



export const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
