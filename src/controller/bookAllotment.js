import { BookManagement } from "../models/book.management.js";
import { BookAllotment } from "../models/bookAllotment.js";
// import { User } from "../models/User.js";
import { RegisterManagement } from "../models/register.management.js";
// import { BookAllotment } from "../controller/book.management.js"
const { ObjectId } = mongoose.Types;
import mongoose from "mongoose";

export const bookAllotment = async (req, res) => {
  const { bookId, studentId, bookIssueDate, submissionDate, paymentType } =
    req.body;
  try {
    console.log("Loading................................");
    console.log("print data", req.body);
    const BookAllotmentSchema = new BookAllotment({
      bookId,
      studentId,
      bookIssueDate,
      submissionDate,
      paymentType,
    });

    const BookAllotmentData = await BookAllotmentSchema.save();
    console.log("Book Allotment Data ", BookAllotmentData);

    await BookManagement.findByIdAndUpdate(bookId, { $inc: { quantity: -1 } });

    return res.status(200).send(BookAllotmentData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: " Internal server error", error });
  }
};
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
          bookTitle: "$bookDetails.bookTitle",
          student_Name: "$studentDetails.student_Name",

          bookIssueDate: 1,
          submissionDate: 1,
          paymentType: 1,
        },
      },
    ]);
    console.log("bookAllotments ", bookAllotments);

    return res.status(200).json(bookAllotments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const editBookAllotment = async (req, res) => {
  const { id } = req.params;
  const { bookName, student_Name, paymentType, bookIssueDate, submissionDate } =
    req.body;

    console.log("req body", req.body);
    

  try {
    const updatedBookAllotment = await BookAllotment.findByIdAndUpdate(
      id,
      {
        bookName,
        student_Name,
        paymentType,
        bookIssueDate,
        submissionDate,
      },
      { new: true }
    );

    if (!updatedBookAllotment) {
      return res.status(404).json({ message: "Book Allotment not found" });
    }

    res.status(200).json({message: "Book Allotment updated successfully",updatedBookAllotment});
  } catch (error) {
    console.error("Error updating book Allotment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const viewBookAllotmentUser = async (req, res) => {
  const { id } = req.params;
  console.log("ID---------", id);

  try {
    const user = await RegisterManagement.findById(id);
    console.log("user", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bookAllotments = await BookAllotment.find({ user_id: id });
    // console.log("viewBookAllotmentUser");

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
  console.log("Befor API..");

  try {
    console.log("id", id);
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
    console.log("Student name");

    console.log("bookAllotments", bookAllotments);

    res.status(200).json(bookAllotments);
  } catch (error) {
    console.error("Error finding book allotments for user:", error);
    res.status(500).json({ message: "Failed to retrieve book allotments" });
  }
};

export const deleteAllotmentBook = async (req, res) => {
  const { id } = req.params;

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
