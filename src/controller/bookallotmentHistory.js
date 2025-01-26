import mongoose, { Mongoose } from "mongoose";
import { BookAllotmentHistory } from "../models/bookallotmentHistory.js";
import { BookManagement } from "../models/book.management.js";
import { SubscriptionType } from "../models/subscriptionType.model.js";
import { RegisterManagement } from "../models/register.management.js";
const ObjectId = mongoose.Types.ObjectId;

export const bookAllotmentHistory = async (req, res) => {
  const allotmentsData = req.body;

  try {
    const studentId = allotmentsData[0]?.studentId;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res
        .status(400)
        .json({ message: `Invalid student ID: ${studentId}` });
    }
    const newAllotment = new BookAllotmentHistory({
      studentId,
      count: 0,
      allotmentDetails: [],
    });

    for (const allotment of allotmentsData) {
      const {
        bookId,
        quantity,
        bookIssueDate,
        submissionDate,
        paymentType,
        amount,
      } = allotment;

      if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new Error(`Invalid book ID: ${bookId}`);
      }

      const bookManagement = await BookManagement.findById(bookId);
      if (!bookManagement || bookManagement.quantity < quantity) {
        throw new Error(`Book with ID ${bookId} is out of stock.`);
      }
      await BookManagement.findByIdAndUpdate(bookId, {
        $inc: { quantity: -quantity },
      });

      newAllotment.allotmentDetails.push({
        bookId,
        bookIssueDate,
        submissionDate,
        paymentType,
        quantity,
        amount,
      });
    }

    newAllotment.count = newAllotment.allotmentDetails.length;

    await newAllotment.save();

    return res.status(201).json({
      message: "Books allotted successfully",
      allotment: newAllotment,
    });
  } catch (error) {
    console.error("Error allotting books:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const getBookAllotmentHistory = async (req, res) => {
  try {
    const studentId = req.query.studentId;
 
    let pipeline = [
      {
        $lookup: {
          from: "registermanagements",  
          localField: "studentId",  
          foreignField: "_id", 
          as: "studentDetails", 
        }
      },
      {
        $unwind: {
          path: "$studentDetails", 
          preserveNullAndEmptyArrays: false  
        }
      },
      {
        $lookup: {
          from: "bookmanagements",  
          localField: "allotmentDetails.bookId",  
          foreignField: "_id",  
          as: "bookDetails",  
        }
      },
      {
        $unwind: {
          path: "$bookDetails", 
          preserveNullAndEmptyArrays: true 
        }
      },
    ];

    if (studentId) {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: `Invalid student ID: ${studentId}` });
      }

      pipeline.push({ $match: { studentId: mongoose.Types.ObjectId(studentId) } });
    }
    const allotments = await BookAllotmentHistory.aggregate(pipeline); 
    if (!allotments || allotments.length === 0) {
      return res.status(404).json({ message: "No allotments found" });
    } 
    return res.status(200).json({ allotments });
  } catch (error) {
    console.error("Error fetching book allotments:", error);
    return res.status(500).json({ message: error.message });
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
