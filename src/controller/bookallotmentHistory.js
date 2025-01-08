import mongoose, { Mongoose } from "mongoose";
import { BookAllotmentHistory } from "../models/bookallotmentHistory.js";
import { BookManagement } from "../models/book.management.js";
import { SubscriptionType } from "../models/subscriptionType.model.js";
import { RegisterManagement } from "../models/register.management.js";
const ObjectId = mongoose.Types.ObjectId;
 
export const bookAllotmentHistory = async (req, res) => {
  const { studentId, bookDetails } = req?.body; 

  try { 
    let history = new BookAllotmentHistory({
      studentId, 
      allotmentDetails: bookDetails,
    }); 

    await history.save();

    return res
      .status(200)
      .json({ message: "Allotment history saved successfully!" });
  } catch (error) {
    console.error("Error saving allotment history:", error);
    return res.status(500).json({ error: "Failed to save allotment history." });
  }
};

export const getBookAllotmentHistory = async (req, res) => {
  try {
    const histories = await BookAllotmentHistory.aggregate([
      {
        $lookup: {
          from: "registermanagements",
          localField: "studentId",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
    ]); 

    if (!histories || histories.length === 0) {
      return res
        .status(404)
        .json({ error: "No allotment history found for any student." });
    }

    return res.status(200).json({
      message: "Allotment history retrieved successfully!",
      histories,
    });
  } catch (error) {
    console.error("Error retrieving allotment history:", error);
    return res
      .status(500)
      .json({ error: "Failed to retrieve allotment history." });
  }
};

export const getBookDetailHistoryStudentId = async (req, res) => {
  const { id } = req?.params;
  try {
    const data = await BookAllotmentHistory.findById(id);

    if (!data) {
      return res
        .status(404)
        .json({ message: "No history found for this student." });
    }
    const studentDetails = await RegisterManagement.findById(data.studentId);
    if (!studentDetails) {
      return res.status(404).json({ message: "Student not found." });
    }
    const allotmentDetails = await Promise.all(
      data.allotmentDetails.map(async (item) => {
        const bookDetails = await BookManagement.findById(item.bookId);
        if (!bookDetails) { 
        }
        const paymentDetails = await SubscriptionType.findById(item.paymentId);
        if (!paymentDetails) { 
        }
        return {
          ...item.toObject(),
          bookDetails: bookDetails || null,
          paymentDetails: paymentDetails || null,
        };
      })
    );
    return res.status(200).json({
      studentDetails,
      allotmentDetails,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error fetching student history.", error });
  }
};
 