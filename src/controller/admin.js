import { Admin } from "../models/admin.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
let JWT_SECRET = "abc";

export const createUser = async (req, res) => {
  const { student_Name, email, select_identity, mobile_Number, password, logo, role } = req.body;
  try {
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10); 
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new Admin({
      student_Name,
      email,
      select_identity,
      mobile_Number,
      password: hashedPassword, 
      logo, 
      role, 
    });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, {
      expiresIn: "1h", 
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        student_Name: newUser.student_Name,
        email: newUser.email,
        select_identity: newUser.select_identity,
        mobile_Number: newUser.mobile_Number,
        register_Date: newUser.register_Date,
        logo: newUser.logo,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error form api" });
  }
};
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
  const { id } = req.params;
  let { email, mobile_Number, student_Name, register_Date, currencyCode, currencySymbol } = req.body;

  if (register_Date && register_Date.includes("/")) {
    const [day, month, year] = register_Date.split('/');
    register_Date = new Date(`${year}-${month}-${day}`);
  }

  const logo = req.file ? req.file.path : "";
  const updatedData = {
    email,
    mobile_Number,
    student_Name,
    register_Date,
    logo,
    currencyCode,
    currencySymbol,
  };
  try {
    const updatedRegister = await Admin.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (!updatedRegister) {
      return res.status(404).json({ message: "Register not found" });
    }
    res.status(200).json({ message: "Register updated successfully", updatedRegister });
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

    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatch) {
      return res.status(200).json({ statusCode: 404, message: "Password Not Match" });
    }

    const payload = {
      _id: admin._id,
      name: admin.name,
      logo: admin.logo,
      email: admin.email,
      currencyCode:admin.currencyCode,
      currencySymbol:admin.currencySymbol
    };

    const userToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); 

    return res.status(200).json({
      statusCode: 200,
      message: `Found Successfully`,
      payload,
      userToken,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const updateEmailContorller = async (req, res) => {  
  try {
    const { adminId, registrationEmail, allotmentEmail, submissionEmail, purchesEmail } = req.body;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      {
        registrationEmail,
        allotmentEmail,
        submissionEmail,
        purchesEmail
      },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Email preferences updated", updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: "Error updating preferences", error });
  }
};
