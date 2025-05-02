import mongoose, { Schema } from "mongoose";

const PublicationsManagementSchema = new Schema({
  publisherName: {
    type: String,
    required: true,
    unique: true,
    set: v => v.toLowerCase().trim(),
  },
    active: {
    type: Boolean,
    default: true,
  },
  address: {
    type: String,
    required: true,
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
