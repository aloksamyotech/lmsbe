import { RegisterManagement } from "../models/register.management.js";
import multer from "multer";
import path from "path";

export const addRegister = async (req, res) => {
  console.log(`req?.body`, req?.body);
  console.log(`req?.file`, req?.file);

  const {
    student_id,
    student_Name,
    email,
    mobile_Number,
    select_identity,
    register_Date,
  } = req.body;
  const upload_identity = req.file ? req.file.path : "";

  try {
    const registerData = new RegisterManagement({
      student_id,
      student_Name,
      email,
      mobile_Number,
      select_identity,
      upload_identity,
      register_Date,
    });
    console.log("Register Management Data", registerData);
    const savedData = await registerData.save();
    console.log("Register Management Data", savedData);
    return res.status(200).send(savedData);
  } catch (error) {
    console.error("Error in Register Management", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const registerManagement = async (req, res) => {
  try {
    const registerManagementTable = await RegisterManagement.find().populate(
      "user_id",
      null,
      null,
      { strictPopulate: false }
    );
    console.log("Register Management Table", registerManagementTable);
    res.status(200).json({
      status: true,
      message: "Register Table successful",
      RegisterManagement: registerManagementTable,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: " Internal server error", error });
  }
};

export const deleteRegister = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRegister = await RegisterManagement.findByIdAndDelete(id);
    if (!deletedRegister) {
      return res.status(404).json({ message: "Register not found" });
    }
    res
      .status(200)
      .json({ message: "Register deleted successfully", deletedRegister });
  } catch (error) {
    console.error("Error deleting Register:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateRegister = async (req, res) => {
  const { id } = req.params;
  const {
    student_id,
    student_Name,
    email,
    mobile_Number,
    select_identity,
    upload_identity,
    register_Date,
  } = req.body;

  try {
    const updatedRegister = await RegisterManagement.findByIdAndUpdate(
      id,
      {
        student_id,
        student_Name,
        email,
        mobile_Number,
        select_identity,
        upload_identity,
        register_Date,
      },
      { new: true }
    );

    if (!updatedRegister) {
      return res.status(404).json({ message: "Register not found" });
    }

    res
      .status(200)
      .json({ message: "Register updated successfully", updateRegister });
  } catch (error) {
    console.error("Error updating  Register:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    console.log("Data............");

    const { userId } = req.query;
    console.log("user id", userId);

    const user = await RegisterManagement.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// export const getAllUsers = async (req, res) => {
//   try {
//     // Fetch all users from the database, excluding passwords
//     const users = await RegisterManagement.find(userId);

//     // Check if any users were found
//     if (!users.length) {
//       return res.status(404).json({ message: "No users found" });
//     }

//     // Send the users data in the response
//     res.status(200).json({ users });
//   } catch (error) {
//     console.error("Error in getAllUsers:", error);
//     res.status(500).json({ message: "Internal Server Error", error });
//   }
// };
