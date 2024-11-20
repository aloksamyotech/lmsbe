import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    token_amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    token: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    amount_paid: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Purchase = mongoose.model("purchase", PurchaseSchema);
