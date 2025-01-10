// import mongoose, { Schema } from "mongoose";

// const AdminSchema = new Schema({
//   student_Name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   select_identity: {
//     type: String,
//     required: true,
//   },
//   mobile_Number: {
//     type: Number,
//     required: true,
//   },
//   register_Date: {
//     type: Date,
//     default: Date.now(),
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   logo: {
//     type: String,
//     required: false,
//     default: "",
//   },
//   role: {
//     type: String,
//     default: "admin",
//   },
// });

// export const Admin = mongoose.model("Admin", AdminSchema);


import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const AdminSchema = new Schema({
  student_Name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  select_identity: { type: String, required: true },
  mobile_Number: { type: Number, required: true },
  register_Date: { type: Date, default: Date.now() },
  password: { type: String, required: true },
  logo: { type: String, required: false, default: '' },
  role: { type: String, default: 'admin' },
});
 
AdminSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

export const Admin = mongoose.model('Admin', AdminSchema);
