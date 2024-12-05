import mongoose, { Schema } from "mongoose";

const VenderManagementSchema = new Schema({
  vendorName: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  // cityName: {
  //   type: String,
  //   required: true,
  // },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  address: {
    type: String,
    required: true,
  },
});

export const VenderManagement = mongoose.model(
  "VenderManagement",
  VenderManagementSchema
);
