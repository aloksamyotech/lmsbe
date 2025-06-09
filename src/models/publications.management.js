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
  },
  description: {
    type: String,
  },
});

export const PublicationsManagement = mongoose.model(
  "PublicationsManagement",
  PublicationsManagementSchema
);
