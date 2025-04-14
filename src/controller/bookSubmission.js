import { SubmittedBooks } from "../models/SubmittedBooks.js";
import mongoose from "mongoose";
import { BookManagement } from "../models/book.management.js";
import { RegisterManagement } from "../models/register.management.js";

export const submitedBook = async (req, res) => {

  try {
    const {
      studentId,
      bookId,
      submissionDate,
      paymentType,
      quantity,
      amount,
      submit,
      fine,
      count,
      bookIssueDate
    } = req.body;

    if (!studentId || !bookId || !submissionDate || !paymentType) {
      return res.status(400).json({
        message: "Required fields missing: studentId, bookId, submissionDate, paymentType",
      });
    }

    const newSubmission = new SubmittedBooks({
      studentId,
      bookId,
      submissionDate,
      paymentType,
      quantity: quantity || 0,
      amount: amount || 0,
      submit: submit || false,
      fine: fine || false,
      count: count || 0,
      bookIssueDate: bookIssueDate || Date.now(),
    });

    const savedSubmission = await newSubmission.save();

    return res.status(201).json({
      message: "Book submission saved successfully in db ",
      data: savedSubmission,
    });

  } catch (error) {
    console.error("Error saving submitted book:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getsubmitedBook = async (req, res) => {
    try {
      const allSubmittedBooks = await SubmittedBooks.aggregate([
        {
          $lookup: {
            from: "bookmanagements",
            localField: "bookId",
            foreignField: "_id",
            as: "bookDetails"
          }
        },
        {
          $lookup: {
            from: "registermanagements",
            localField: "studentId",
            foreignField: "_id",
            as: "studentDetails"
          }
        },
        {
          $unwind: "$studentDetails"
        },
        {
          $unwind: "$bookDetails"
        },
        {
          $project: {
            studentName: "$studentDetails.student_Name",
            studentEmail: "$studentDetails.email",
            bookName: "$bookDetails.bookName",
            bookIssueDate: 1,
            submissionDate: 1,
            paymentType: 1,
            quantity: 1,
            amount: 1,
            submit: 1,
            fine: 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]);
  
      return res.status(200).json({
        message: "Submitted books fetched successfully",
        data: allSubmittedBooks,
      });
    } catch (error) {
      console.error("Error fetching submitted books:", error);
      return res.status(500).json({
        message: "Server error while fetching submitted books",
        error: error.message,
      });
    }
  };
  