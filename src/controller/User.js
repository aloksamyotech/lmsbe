import { RegisterManagement } from "../models/register.management.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";

// export const updateProfilePage = async (req, res) => {
//     console.log(`body data----------------------->>>>>>>>>> `, req.body);
//     console.log(`file data----------------------->>>>>>>>>>  `, req.file);
//     const { id } = req.params;
//     const { email, mobile_Number, student_Name, register_Date } = req.body;
//     const logo = req.file ? req.file.path : "";
//     console.log(`logo`, logo);
//     const updatedData = {
//       student_Name,
//       email,
//       mobile_Number,
//       register_Date,
//       logo,
//     };
//     try {
//       const updatedRegister = await RegisterManagement.findByIdAndUpdate(
//         id,
//         updatedData,
//         { new: true }
//       );
//       if (!updatedRegister) {
//         return res.status(404).json({ message: "Register not found" });
//       }
//       res
//         .status(200)
//         .json({ message: "Register updated successfully", updateRegister });
//     } catch (error) {
//       console.error("Error updating  Register:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   };

// export const updateProfilePage = async (req, res) => {
//   console.log(`body data----------------------->>>>>>>>>> `, req.body);
//   console.log(`file data----------------------->>>>>>>>>>  `, req.file);
//   const { id } = req.params;
//   const { email, mobile_Number, student_Name, register_Date } = req.body;
//   const logo = req.file ? req.file.path : "";
//   console.log(`logo`, logo);
//   const updatedData = {
//     student_Name,
//     email,
//     mobile_Number,
//     register_Date,
//     logo,
//   };
//   try {
//     const updatedRegister = await RegisterManagement.findByIdAndUpdate(
//       id,
//       updatedData,
//       { new: true }
//     );
//     if (!updatedRegister) {
//       return res.status(404).json({ message: "Register not found" });
//     }
//     res
//       .status(200)
//       .json({ message: "Register updated successfully", updatedRegister });
//   } catch (error) {
//     console.error("Error updating Register:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// export const getLogo = async (req, res) => {
//   try {
//     const logo = await RegisterManagement.find({
//       role: "admin",
//       active: true,
//     });
//     res.status(200).json({
//       status: true,
//       message: "admin data fetched successfully",
//       students: logo,
//     });
//   } catch (error) {
//     console.error("Error fetching admin data:", error);
//     res
//       .status(500)
//       .json({ status: false, message: "Internal server error", error });
//   }
// };
