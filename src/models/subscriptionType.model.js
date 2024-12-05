import mongoose, { Schema } from "mongoose";
const SubscriptionTypeSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  desc: {
    type: String,
    required: true,
  },
  numberOfDays:{
    type:Number,
    required:true,
  }
});
export const SubscriptionType = mongoose.model(
  "SubscriptionType",
  SubscriptionTypeSchema
);
