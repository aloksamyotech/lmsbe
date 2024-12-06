import { BookManagement } from "../models/book.management.js";
import { BookAllotment } from "../models/bookAllotment.js";
// import { User } from "../models/User.js";
import { RegisterManagement } from "../models/register.management.js";
// import { BookAllotment } from "../controller/book.management.js"
const { ObjectId } = mongoose.Types;
import mongoose from "mongoose";

// export const bookAllotmentCount = async (req, res) => {
//   const { studentId } = req.params;
//   console.log("studentId", studentId);

//   try {
//     const student = await Register;

//     Management.findById(studentId);
//     console.log("student", student);

//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }
//     const allotmentsCount = await BookAllotment.countDocuments({
//       studentId: studentId,
//     });

//     return res.status(200).json({ allotmentsCount });
//   } catch (error) {
//     console.error("Error fetching book allotment count:", error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };

export const bookAllotmentCount = async (req, res) => {
  const { studentId } = req.params;
  // console.log("studentId", studentId);

  try {
    const student = await RegisterManagement.findById(studentId);
    // console.log("student", studentId);

    if (!studentId) {
      return res.status(404).json({ message: "Student not found" });
    }

    const allotmentsCount = await BookAllotment.countDocuments({
      studentId: studentId,
    });

    return res.status(200).json({ allotmentsCount });
  } catch (error) {
    console.error("Error fetching book allotment count:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// export const bookAllotment = async (req, res) => {
//   const { bookId, studentId, bookIssueDate, submissionDate, paymentType } = req.body;

//   try {
//     const studentAllotment = await BookAllotment.findOne({ studentId });
//     if (studentAllotment && studentAllotment.bookIds.length >= 5) {
//       return res.status(400).json({ message: "Student can't borrow more than 5 books." });
//     }

//     if (!Array.isArray(bookId)) {
//       return res.status(400).json({ message: "bookId should be an array" });
//     }

//     if (studentAllotment) {
//       // Check if any of the new book IDs are already in the existing document
//       const newBookIds = bookId.filter(id => !studentAllotment.bookIds.includes(id));
//       if (newBookIds.length > 0) {
//         studentAllotment.bookIds.push(...newBookIds);
//         studentAllotment.bookIssueDate = bookIssueDate;
//         studentAllotment.submissionDate = submissionDate;
//         studentAllotment.paymentType = paymentType;

//         await studentAllotment.save();

//         // Update the quantity in BookManagement for each new book
//         for (let id of newBookIds) {
//           await BookManagement.findByIdAndUpdate(id, { $inc: { quantity: -1 } });
//         }
//       }

//       return res.status(200).json({ message: "Books added to existing allotment", allotment: studentAllotment });
//     }

//     // If no existing allotment is found, create a new one
//     const newBookAllotment = new BookAllotment({
//       studentId,
//       bookIds: bookId,
//       bookIssueDate,
//       submissionDate,
//       paymentType,
//     });

//     const bookAllotmentData = await newBookAllotment.save();

//     // Decrease the quantity of books in the BookManagement collection
//     for (let id of bookId) {
//       await BookManagement.findByIdAndUpdate(id, { $inc: { quantity: -1 } });
//     }

//     return res.status(200).json({ message: "New book allotment created", allotment: bookAllotmentData });
//   } catch (error) {
//     console.error("Error allotting book:", error);
//     return res.status(500).json({ message: "Internal server error", error });
//   }
// };

export const bookAllotment = async (req, res) => {
  const { bookId, studentId, bookIssueDate, submissionDate, paymentType } =
    req.body;
  try {
    const studentAllotments = await BookAllotment.find({
      studentId,
    }).countDocuments();
    if (studentAllotments >= 5) {
      return res
        .status(400)
        .json({ message: "Student can't borrowed more than 5 books." });
    }

    if (!Array.isArray(bookId)) {
      return res.status(400).json({ message: "bookId should be an array" });
    }
    const allotments = [];
    for (let id of bookId) {
      const newBookAllotment = new BookAllotment({
        bookId: id,
        studentId,
        bookIssueDate,
        submissionDate,
        paymentType,
      });
      const bookAllotmentData = await newBookAllotment.save();

      await BookManagement.findByIdAndUpdate(id, { $inc: { quantity: -1 } });
      allotments.push(bookAllotmentData);
    }

    return res.status(200).json(allotments);
  } catch (error) {
    console.error("Error allotting book:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

//   const { bookId, studentId, bookIssueDate, submissionDate, paymentType } = req.body;
//   try {
//     const studentAllotments = await BookAllotment.find({ studentId }).countDocuments();
//     if (studentAllotments >= 5) {
//       return res.status(400).json({ message: "Student  already borrow more than 5 books." });
//     }
//     if (!Array.isArray(bookId)) {
//       return res.status(400).json({ message: "bookId should be an array" });
//     }
//     const allotments = [];
//     for (let id of bookId) {
//     const newBookAllotment = new BookAllotment({
//       bookId,
//       studentId,
//       bookIssueDate,
//       submissionDate,
//       paymentType,
//     });

//     const bookAllotmentData = await newBookAllotment.save();
//     await BookManagement.findByIdAndUpdate(bookId, { $inc: { quantity: -1 } });
//     allotments.push(bookAllotmentData);
//   }
//     return res.status(200).json(allotments);
//   } catch (error) {
//     console.error("Error allotting book:", error);
//     return res.status(500).json({ message: "Internal server error", error });
//   }
// };

export const getBookAllotment = async (req, res) => {
  try {
    console.log("Data.........");

    const bookAllotments = await BookAllotment.aggregate([
      {
        $lookup: {
          from: "bookmanagements",
          localField: "bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $lookup: {
          from: "registermanagements",
          localField: "studentId",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      { $unwind: "$bookDetails" },
      { $unwind: "$studentDetails" },
      {
        $project: {
          _id: 1,
          bookName: "$bookDetails.bookName",
          // bookTitle: "$bookDetails.bookTitle",
          student_Name: "$studentDetails.student_Name",

          bookIssueDate: 1,
          submissionDate: 1,
          paymentType: 1,
        },
      },
    ]);
    // console.log("bookAllotments ", bookAllotments);

    return res.status(200).json(bookAllotments);
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const reBookAllotment = async (req, res) => {
  try {
    const bookAllotments = await BookAllotment.aggregate([
      {
        $lookup: {
          from: "bookmanagements",
          localField: "bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $lookup: {
          from: "registermanagements",
          localField: "studentId",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      { $unwind: "$bookDetails" },
      { $unwind: "$studentDetails" },
      {
        $group: {
          _id: "$studentId",
          studentDetails: { $first: "$studentDetails" },
          books: {
            $push: {
              bookId: "$bookDetails._id",
              bookName: "$bookDetails.bookName",
              bookIssueDate: "$bookIssueDate",
              submissionDate: "$submissionDate",
              paymentType: "$paymentType",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          studentName: "$studentDetails.student_Name",
          studentEmail: "$studentDetails.email",
          books: {
            $slice: ["$books", 0, 5],
          },
        },
      },
    ]);

    return res.status(200).json(bookAllotments);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getBookAllotmentById = async (req, res) => {
  try {
    const { id } = req?.params;
    console.log("id..", id);

    if (!id) {
      return res.status(400).json({ message: "ID parameter is required" });
    }

    const bookAllotments = await BookAllotment.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "bookmanagements",
          localField: "bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $lookup: {
          from: "registermanagements",
          localField: "studentId",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      {
        $lookup: {
          from: "subscriptiontypes",
          localField: "paymentType",
          foreignField: "_id",
          as: "paymentType",
        },
      },

      // {
      //   $project: {
      //     _id: 1,
      //     bookName: "$bookDetails.bookName",
      //     student_Name: "$studentDetails.student_Name",
      //     bookIssueDate: 1,
      //     submissionDate: 1,
      //     paymentType: 1,
      //   },
      // },
    ]);
    console.log("bookAllotments", bookAllotments);

    if (!bookAllotments) {
      return res
        .status(404)
        .json({ message: "No book allotment found for the provided ID" });
    }

    return res.status(200).json(bookAllotments);
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const editBookAllotment = async (req, res) => {
  const { id } = req.params;
  const { bookName, student_Name, paymentType, bookIssueDate, submissionDate } =
    req.body;

  // console.log("req body", req.body);

  try {
    const updatedBookAllotment = await BookAllotment.findByIdAndUpdate(
      id,
      {
        bookName,
        student_Name,
        paymentType,
        // bookIssueDate,
        // submissionDate,
      },
      { new: true }
    );

    if (!updatedBookAllotment) {
      return res.status(404).json({ message: "Book Allotment not found" });
    }

    res.status(200).json({
      message: "Book Allotment updated successfully",
      updatedBookAllotment,
    });
  } catch (error) {
    console.error("Error updating book Allotment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const viewBookAllotmentUser = async (req, res) => {
  const { id } = req.params;
  // console.log("ID---------", id);

  try {
    const user = await RegisterManagement.findById(id);
    // console.log("user", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bookAllotments = await BookAllotment.find({ user_id: id });
    // console.log("viewBookAllotmentUser", bookAllotments);

    res.status(200).json({
      user,
      bookAllotments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const findHistoryBookAllotmentUser = async (req, res) => {
  const { id } = req.params;
  // console.log("Befor API..");

  try {
    // console.log("id", id);
    const bookAllotments = await BookAllotment.aggregate([
      {
        // $match: {  studentId: id },
        $match: { studentId: new ObjectId(id) },
      },
      {
        $lookup: {
          from: "bookmanagements",
          localField: "bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $lookup: {
          from: "registermanagements",
          localField: "studentId",
          foreignField: "_id",
          as: "studentDetails",
        },
      },

      { $unwind: "$bookDetails" },
      { $unwind: "$studentDetails" },
      {
        $project: {
          _id: 1,
          bookName: "$bookDetails.bookName",
          bookTitle: "$bookDetails.bookTitle",
          student_Name: "$studentDetails.student_Name",
          bookIssueDate: 1,
          submissionDate: 1,
          paymentType: 1,
        },
      },
    ]);
    // console.log("Student name");

    // console.log("bookAllotments", bookAllotments);

    res.status(200).json(bookAllotments);
  } catch (error) {
    console.error("Error finding book allotments for user:", error);
    res.status(500).json({ message: "Failed to retrieve book allotments" });
  }
};

export const deleteAllotmentBook = async (req, res) => {
  const { id } = req.params;
  // console.log(`id____________________>>>>>>>>>>>>>>>>>>>>>>>>>>`, id);

  try {
    const deletedAllotmentBook = await BookAllotment.findByIdAndDelete(id);
    if (!deletedAllotmentBook) {
      return res.status(404).json({ message: "Book Allotment not found" });
    }
    res.status(200).json({
      message: "Book Allotment deleted successfully",
      deletedAllotmentBook,
    });
  } catch (error) {
    console.error("Error deleting book Allotment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getBookAllotedCount = async (req, res) => {
  try {
    const bookAllotedCount = await BookAllotment.countDocuments({});
    res.status(200).json({ count: bookAllotedCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching book count", error });
  }
};

export const getBookMonthVise = async (req, res) => {
  try {
    const data = await BookAllotment.aggregate([
      {
        $project: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          month: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);
    // console.log(`data`, data);

    const dataMap = data.reduce((acc, { month, count }) => {
      acc[month] = count;
      return acc;
    }, {});
    const result = [];
    for (let month = 1; month <= 12; month++) {
      result.push({
        month,
        count: dataMap[month] || 0,
      });
    }
    // console.log("result", result);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const bookAllotmentReport = async (req, res) => {
  const { startDate, endDate } = req.params;
  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);
  parsedEndDate.setHours(23, 59, 59, 999);
  // console.log("Date", parsedStartDate);
  // console.log("Date-2", parsedEndDate);

  try {
    const newBookAllotment = await BookAllotment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: parsedStartDate,
            $lte: parsedEndDate,
          },
        },
      },
      {
        $lookup: {
          from: "bookmanagements",
          localField: "bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $lookup: {
          from: "registermanagements",
          localField: "studentId",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      { $unwind: "$bookDetails" },
      { $unwind: "$studentDetails" },
      {
        $project: {
          _id: 1,
          bookName: "$bookDetails.bookName",
          bookTitle: "$bookDetails.bookTitle",
          student_Name: "$studentDetails.student_Name",

          bookIssueDate: 1,
          submissionDate: 1,
          paymentType: 1,
        },
      },
      { $sort: { updatedAt: -1 } },
    ]);

    // console.log("newBookAllotment", newBookAllotment);

    return res.status(200).json(newBookAllotment);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `${error.message || "An error occurred"}` });
  }
};
