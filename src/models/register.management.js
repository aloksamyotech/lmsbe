import mongoose, { Schema } from "mongoose";
const RegisterManagementSchema = new Schema({
  // student_id: {
  //   type: String,
  //   required: true,
  // },
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
  favorite: {
    type: Boolean,
    default: false,
  },
  subscription:{
    type:Boolean,
    default:false,
  }
});
export const RegisterManagement = mongoose.model(
  "RegisterManagement",
  RegisterManagementSchema
);
