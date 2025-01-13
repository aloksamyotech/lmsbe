import mongoose from "mongoose";
import { Admin } from "../models/admin.js";

export const connectDb = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/LMS");
    // await mongoose.connect(
    //   "mongodb+srv://amanasati:amanasati@cluster0.p2zjm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    // );

    const adminExist = await Admin.findOne({ email: "admin@gmail.com" });
    if (!adminExist) {
      const newAdmin = new Admin({
        student_Name: "admin",
        email: "admin@gmail.com",
        password: "12345",
        mobile_Number: "898938393",
        select_identity: "Pan Card",
        register_Date: "05/10/2025",
        logo: "",
        role: "admin",
      });
      const savedAdmin = await newAdmin.save();
      return {
        user: savedAdmin,
      };
    }
    console.log("database connection established");
  } catch (error) {
    console.log("error connecting mongodb: " + error);
  }
};
export default connectDb;
