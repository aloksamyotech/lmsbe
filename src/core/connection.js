import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/LMS");
    console.log("database connection established");
  } catch (error) {
    console.log("error connecting mongodb: " + error);
  }
};
