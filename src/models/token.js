import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  token_amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },
  token_type: {
    type: String,
    required: true,
    trim: true,
  },
  allotted_at: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "withdrawn"],
    default: "pending",
  },
  active: {
    type: Boolean,
    default: true,
  },
  total: {
    type: Number,
    required: true,
    default: 0,
  },
  token_avl: {
    type: Number,
    required: true, 
  },
});

export const Token = mongoose.model("token", TokenSchema);
