import mongoose, { Schema } from "mongoose";

const PurchaseManagementSchema = new Schema({
  bookId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  vendorId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  bookIssueDate: {
    type: Date,
    default: Date.now(),
  },
  discount: {
    type: Number,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  // totalPrice: {
  quantity: {
    type: Number,
    required: true,
  },
  bookComment: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  totalPrice:{
    type:Number,
    required:true
  }
  //   type: Number,
  //   required: true,
  // },
  // returnPrice: {
  //   type: Number,
  //   required: true,
  // },
});

export const PurchaseManagement = mongoose.model(
  "PurchaseManagement",
  PurchaseManagementSchema
);

// const PurchaseSchema = new mongoose.Schema(
//   {
//     user_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "user",
//       required: true,
//     },
//     token_amount: {
//       type: mongoose.Schema.Types.Decimal128,
//       required: true,
//     },
//     token: {
//       type: mongoose.Schema.Types.Decimal128,
//       required: true,
//     },
//     amount_paid: {
//       type: mongoose.Schema.Types.Decimal128,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "completed"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// export const Purchase = mongoose.model("purchase", PurchaseSchema);
