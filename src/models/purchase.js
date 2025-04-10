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
});

export const PurchaseManagement = mongoose.model(
  "PurchaseManagement",
  PurchaseManagementSchema
);
