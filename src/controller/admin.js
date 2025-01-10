import { Admin } from "../models/admin.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
let JWT_SECRET = "abc";

export const adminProfilePage = async (req, res) => {
  try {
    const admin = await Admin.find();
    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "No  Admin found with  status",
      });
    }
    res.status(200).json({
      status: true,
      message: " Admin fetched successfully",
      students: admin,
    });
  } catch (error) {
    console.error("Error fetching  Admin:", error);
    res
      .status(500)
      .json({ status: false, message: "Internal server error", error });
  }
};

export const adminUpdateProfilePage = async (req, res) => {
  console.log(`body data----------------------->>>>>>>>>> `, req.body);
  console.log(`file data----------------------->>>>>>>>>>  `, req.file);
  const { id } = req.params;
  const { email, mobile_Number, student_Name, register_Date } = req.body;
  const logo = req.file ? req.file.path : "";
  console.log(`logo`, logo);
  const updatedData = {
    email,
    mobile_Number,
    student_Name,
    register_Date,
    logo,
  };
  try {
    const updatedRegister = await Admin.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (!updatedRegister) {
      return res.status(404).json({ message: "Register not found" });
    }
    res
      .status(200)
      .json({ message: "Register updated successfully", updatedRegister });
  } catch (error) {
    console.error("Error updating Register:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminGetLogo = async (req, res) => {
  try {
    const logo = await Admin.find();
    res.status(200).json({
      status: true,
      message: "admin data fetched successfully",
      students: logo,
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res
      .status(500)
      .json({ status: false, message: "Internal server error", error });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(200)
        .json({ statusCode: 404, message: "Admin not found" });
    }

    const matchPassword = admin.password == password;
    if (!matchPassword) {
      return res
        .status(200)
        .json({ statusCode: 404, message: "Password Not Match" });
    }

    const payload = {
      _id: admin?._id,
      name: admin?.name,
      logo: admin?.logo,
    };

    const userToken = jwt.sign(password, JWT_SECRET);
    return res.status(200).json({
      statusCode: 200,
      message: `found Successfully`,
      payload,
      userToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
