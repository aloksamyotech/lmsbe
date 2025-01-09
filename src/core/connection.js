import mongoose from "mongoose";
import { User } from "../models/User.js";

export const connectDb = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/LMS");
    const adminExist = await User.findOne({ email: "admin@gmail.com" });
    if (!adminExist) {
      const newUser = new User({
        student_Name: "admin",
        email: "admin@gmail.com",
        password: "12345",
        mobile_Number: "898938393", 
        select_identity:"Pan Card",
        register_Date:"05/10/2025",
        logo :"",
        role: "admin"
      });
      const savedUser = await newUser.save();
      return {
        user: savedUser,
      }
    };
    console.log("database connection established");
  } catch (error) {
    console.log("error connecting mongodb: " + error);
  }
  
};
export default connectDb;