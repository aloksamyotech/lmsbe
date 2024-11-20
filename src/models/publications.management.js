// import { Schema } from "mongoose";
import mongoose, { Schema } from "mongoose";

const PublicationsManagementSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now(),
  },
  description: {
    type: String,
    required: true,
  },
});

export const PublicationsManagement = mongoose.model(
  "PublicationsManagement",
  PublicationsManagementSchema
);
