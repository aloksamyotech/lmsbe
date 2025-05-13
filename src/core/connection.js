import mongoose from "mongoose";
import { Admin } from "../models/admin.js";
import dotenv from "dotenv";

dotenv.config();

export const connectDb = async () => {
  try {
    // await mongoose.connect("mongodb://127.0.0.1:27017/LMS");
    // server data base
    await mongoose.connect(
      process.env.db
    );
    console.log("Database connetced ")
    const adminExist = await Admin.findOne({ email: "admin@gmail.com" });
    if (!adminExist) {
      const newAdmin = new Admin({
        student_Name: "admin",
        email: "admin@gmail.com",
        password:
          "$2a$10$VeYTXYVQ/edci2sI85Ynw.dAEmOAQJDqf80y4QgYrmWJ0EENYU1Ru", //password = admin123
        mobile_Number: "898938393",
        select_identity: "Pan Card",
        register_Date: "05/10/2025",
        logo: "",
        role: "admin",
        Sending_email:"diksha.kushwah@samyotech.in",
        smtpCode:"xsmtpsib-1b5d89ac60dc9685afaec3afd8d9745abaa44625f8cb4320444a840d8683a…"
      });
      const savedAdmin = await newAdmin.save();
      return {
        user: savedAdmin,
      };
    }
  } catch (error) {
    console.error("error connecting mongodb: " + error);
  }
};
export default connectDb;
