import { RegisterManagement } from "../models/register.management.js";
import multer from "multer";
import path from "path";

export const addRegister = async (req, res) => {
  const { student_Name, email, mobile_Number, select_identity, register_Date } =
    req.body;
  const upload_identity = req.file ? req.file.path : "";

  try {
    const registerData = new RegisterManagement({
      student_Name,
      email,
      mobile_Number,
      select_identity,
      upload_identity,
      register_Date,
    });
    const savedData = await registerData.save();
    return res.status(200).send(savedData);
  } catch (error) {
    console.error("Error in Register Management", error);
    return res.status(500).send({ message: "Internal  Server Error" });
  }
};

export const registerMany = async (req, res) => {
  const data = req?.body;

  try {
    const registerData = data.map((student) => {
      const {
        student_Name,
        email,
        mobile_Number,
        select_identity,
        register_Date,
      } = student;
      const upload_identity = student.file ? student.file.path : "";
      return {
        student_Name,
        email,
        mobile_Number,
        select_identity,
        upload_identity,
        register_Date,
      };
    });
    const savedData = await RegisterManagement.insertMany(registerData);

    return res.status(200).send(savedData);
  } catch (error) {
    console.error("Error in Register Management Bulk Insert", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const registerManagement = async (req, res) => {
  try {
    const registerManagementTable = await RegisterManagement.find().populate(
      "user_id",
      null,
      null,
      { active: false },

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

export const registerManagementView = async (req, res) => {
  const { id } = req.params;
  try {
    const registerManagementTable = await RegisterManagement.findById(id, {
      active: false,
    }).populate("user_id", null, null, { strictPopulate: false });
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
    const deletedRegister = await RegisterManagement.findByIdAndDelete(id, {
      active: false,
    });
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
    const { userId } = req.query;
    console.log("user id", userId);

    const user = await RegisterManagement.findById(userId, { active: false });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getRegisterStudentCount = async (req, res) => {
  try {
    const bookCount = await RegisterManagement.countDocuments({});
    res.status(200).json({ count: bookCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching book count", error });
  }
};

export const markFavorite = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await RegisterManagement.findById(id);
    console.log("student========", student);

    if (!student) {
      return res
        .status(404)
        .json({ status: false, message: "Student not found" });
    }

    student.favorite = !student.favorite;

    const updatedStudent = await student.save();
    console.log("updatedStudent=====", updatedStudent);

    res.status(200).json({
      status: true,
      message: `Marked as favorite ${student.favorite ? "successfully" : "removed"}`,
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error marking favorite:", error);
    res
      .status(500)
      .json({ status: false, message: "Internal server error", error });
  }
};

export const getMarkFavorite = async (req, res) => {
  try {
    const favoriteStudents = await RegisterManagement.find({
      favorite: true,
      active: true,
    });

    res.status(200).json({
      status: true,
      message: "Favorite students fetched successfully",
      students: favoriteStudents,
    });
  } catch (error) {
    console.error("Error fetching favorite students:", error);
    res
      .status(500)
      .json({ status: false, message: "Internal server error", error });
  }
};

 

export const markSubscription = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await RegisterManagement.findById(id, { active: false });

    if (!student) {
      return res
        .status(404)
        .json({ status: false, message: "Student not found" });
    }

    student.subscription = !student.subscription;

    const updatedStudent = await student.save();

    res.status(200).json({
      status: true,
      message: `Marked as subscription ${student.subscription ? "successfully" : "removed"}`,
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error marking subscription:", error);
    res
      .status(500)
      .json({ status: false, message: "Internal server error", error });
  }
};

export const getSubscription = async (req, res) => {
  try {
    const subscriptionStudents = await RegisterManagement.find({
      subscription: true,
      active: false,
    });
    if (subscriptionStudents.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No students found with subscription status",
      });
    }
    res.status(200).json({
      status: true,
      message: "subscription students fetched successfully",
      students: subscriptionStudents,
    });
  } catch (error) {
    console.error("Error fetching subscription students:", error);
    res
      .status(500)
      .json({ status: false, message: "Internal server error", error });
  }
};
