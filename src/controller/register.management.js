import { RegisterManagement } from "../models/register.management.js";
import multer from "multer";
import path from "path";

export const addRegister = async (req, res) => {
  console.log(`req?.body`, req?.body);
  console.log(`req?.file`, req?.file);

  const {
    // student_id,
    student_Name,
    email,
    mobile_Number,
    select_identity,
    register_Date,
  } = req.body;
  const upload_identity = req.file ? req.file.path : "";

  try {
    const registerData = new RegisterManagement({
      // student_id,
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


export const registerManagementView = async (req, res) => {
  const { id } = req.params;
  try {
    const registerManagementTable = await RegisterManagement.findById(id).populate(
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
    // student_id,
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
        // student_id,
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

export const getRegisterStudentCount = async (req, res) => {
  try {
    const bookCount = await RegisterManagement.countDocuments({});
    res.status(200).json({ count: bookCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching book count", error });
  }
};

// export const markFavorite = async(req,res)=>{
//   const { id } = req.params;
//   try {
//     const favoriteManagementTable = await RegisterManagement.find().populate(
//       "user_id",
//       null,
//       null,
//     );
//     console.log("Favorite Management Table", favoriteManagementTable);
//     res.status(200).json({
//       status: true,
//       message: "Favorite Table successful",
//       FavoriteManagement : favoriteManagementTable,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: " Internal server error", error });
//   }
// }

export const markFavorite = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await RegisterManagement.findById(id);

    if (!student) {
      return res
        .status(404)
        .json({ status: false, message: "Student not found" });
    }

    student.favorite = !student.favorite;

    const updatedStudent = await student.save();

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
    const favoriteStudents = await RegisterManagement.find({ favorite: true });
    if (favoriteStudents.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No students found with favorite status",
      });
    }
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

export const profilePage = async (req, res) => {
  try {
    const admin = await RegisterManagement.find({ role: "admin" });
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

// export const profilepage = async (req, res) => {
//   try {
//     const studentId = req.params.studentId;

//     const student = await RegisterManagement.findById(studentId);

//     if (!student) {
//       return res.status(404).json({
//         status: false,
//         message: "No student found with the provided ID",
//       });
//     }

//     res.status(200).json({
//       status: true,
//       message: "Student fetched successfully",
//       student: student,
//     });
//   } catch (error) {
//     console.error("Error fetching student:", error);
//     res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error,
//     });
//   }
// };


export const markSubscription = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await RegisterManagement.findById(id);

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
    const subscriptionStudents = await RegisterManagement.find({ subscription: true });
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