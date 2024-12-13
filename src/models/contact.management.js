import mongoose, { Schema } from "mongoose";

const ContactManagementSchema = new Schema({
  student_id: {
    type: String,
    required: true,
  },
  student_Name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile_Number: {
    type: Number,
    required: true,
  },
  select_identity: {
    type: String,
    required: true,
  },
  upload_identity: {
    type: String,
    required: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  register_Date: {
    type: Date,
    default: Date.now(),
  },
});

export const ContactManagement = mongoose.model(
  "ContactManagement",
  ContactManagementSchema
);
