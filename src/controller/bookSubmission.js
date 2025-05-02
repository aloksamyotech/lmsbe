import { SubmittedBooks } from "../models/SubmittedBooks.js";
import mongoose from "mongoose";
import { BookManagement } from "../models/book.management.js";
import { RegisterManagement } from "../models/register.management.js";
import { Admin } from "../models/admin.js";
import {sendSubmitInvoiceEmail} from "../controller/email.js";
export const submitedBook = async (req, res) => {
  try {
    const {
      allotmentId,
      studentId,
      bookId,
      submissionDate,
      paymentType,
      quantity,
      amount,
      fine,
      count,
      bookIssueDate,
      totalFineAmount,
      fines,
      adminId,
    } = req.body;

    if (!studentId || !bookId || !submissionDate || !paymentType) {
      return res.status(400).json({
        message:
          "Required fields missing: studentId, bookId, submissionDate, paymentType",
      });
    }

    const newSubmission = new SubmittedBooks({
      allotmentId,
      studentId,
      bookId,
      submissionDate,
      paymentType,
      quantity: quantity || 0,
      amount: amount || 0,
      fine: fine || false,
      totalFineAmount: totalFineAmount || 0,
      fines: fines || [],
      count: count || 0,
      bookIssueDate: bookIssueDate || Date.now(),
    });

    const savedSubmission = await newSubmission.save();
    const admin = await Admin.findById(adminId);

    if (admin?.submissionEmail) {
      await sendSubmitInvoiceEmail(savedSubmission._id.toString(),adminId);
    }
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
          as: "subscriptiontypes",
        },
      },
      {
        $lookup: {
          from: "bookfines",
          localField: "allotmentId",
          foreignField: "allotmentId",
          as: "fineDetails",
        },
      },
      { $unwind: "$studentDetails" },
      { $unwind: "$bookDetails" },
      {
        $project: {
          studentName: "$studentDetails.student_Name",
          studentEmail: "$studentDetails.email",
          bookName: "$bookDetails.bookName",
          bookIssueDate: 1,
          submissionDate: 1,
          paymentType: "$subscriptiontypes.title",
          quantity: 1,
          amount: 1,
          submit: 1,
          fine: 1,
          fineAmount: "$totalFineAmount",
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
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
export const getsubmitedBookinvoice = async (req, res) => {
  try {
    const allSubmittedBooks = await SubmittedBooks.aggregate([
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
          as: "subscriptiontypes",
        },
      },
      { $unwind: "$studentDetails" },
      { $unwind: "$bookDetails" },
      {
        $sort: { createdAt: -1 },
      },
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