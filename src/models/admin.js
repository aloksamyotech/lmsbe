import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new Schema({
  student_Name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  select_identity: { type: String, required: true },
  mobile_Number: { type: Number, required: true },
  register_Date: { type: Date, default: Date.now() },
  password: { type: String, required: true },
  logo: { type: String, required: false, default: "" },
  role: { type: String, default: "admin" },
  currencyCode: {
    type: String,
    default: "INR",
  },
  currencySymbol: {
    type: String,
    default: "₹",
  },
  Sending_email: {
    type: String,
    required: true,
    match: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, 
    default:''
  },
  smtpCode: {
    type: String,
    required: true,
    default:''
  }, 
  registrationEmail:{type:Boolean, default:true},
  allotmentEmail:{type:Boolean, default:true},
  submissionEmail:{type:Boolean, default:true},
  purchesEmail:{type:Boolean, default:true},
  company:{
    type:String,
    default:'Test'
  },
});



export const Admin = mongoose.model("Admin", AdminSchema);
