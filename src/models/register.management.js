import mongoose, { Schema } from "mongoose";
const RegisterManagementSchema = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  register_Date: {
    type: Date,
    default: Date.now(),
  },
  active: {
    type: Boolean,
    default: true,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  logo: {
    type: String,
    required: false,
    default: "",
  },
  subscription: {
    type: Boolean,
    default: false,
  },
  count: { 
    type: Number,
    required: false,
    default: 0,
  },
});
export const RegisterManagement = mongoose.model(
  "RegisterManagement",
  RegisterManagementSchema
);
