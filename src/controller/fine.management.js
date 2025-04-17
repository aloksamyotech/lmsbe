import { response } from "express";
import { BookFine } from "../models/fine.management.js";
import { BookAllotment } from "../models/bookAllotment.js";

import mongoose from "mongoose";

export const addFineBook = async (req, res) => {
  const { reason, bookId, studentId, amount, _id, allotmentId } = req.body;

  try {
    if (!studentId || !bookId) {
      return res
        .status(400)
        .send({ message: "bookId and studentId are required" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(bookId) ||
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(_id) ||
      !mongoose.Types.ObjectId.isValid(allotmentId)
    ) {
      return res
        .status(400)
        .send({ message: "Invalid bookId, studentId, or allotmentId format" });
    }

    const FineManagementSchema = new BookFine({
      bookId: new mongoose.Types.ObjectId(bookId),
      studentId: new mongoose.Types.ObjectId(studentId),
      fineAmount: amount,
      reason,
      allotmentId: new mongoose.Types.ObjectId(allotmentId),
    });

    await FineManagementSchema.save();

    const fineObj = {
      reason,
      fineAmount: amount,
    };

    const updatedAllotment = await BookAllotment.updateOne(
      {
        _id: allotmentId,
        "books.bookId": bookId,
      },
      {
        $set: {
          "books.$.fine": true,
        },
        $push: {
          "books.$.fines": fineObj,
        },
      }
    );

    if (updatedAllotment.modifiedCount === 0) {
      return res.status(400).send({ message: "Allotment update failed" });
    }

    const updatedBook = await BookAllotment.findOne(
      {
        _id: allotmentId,
        "books.bookId": bookId,
      },
      {
        "books.$": 1,
      }
    );

    return res.status(200).send({
      message: "Fine added successfully",
      updatedBook: updatedBook.books[0],
    });
  } catch (error) {
    console.error("Error in Fine Book Management", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getFineBook = async (req, res) => {
  try {
    const { studentId } = req.params;

    const fineBooks = await BookFine.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },

      {
        $lookup: {
          from: "bookallotments",
          localField: "bookId",
          foreignField: "bookId",
          as: "bookAllotmentDetails",
        },
      },
      {
        $unwind: {
          path: "$bookAllotmentDetails",
          preserveNullAndEmptyArrays: true,
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
      { $unwind: { path: "$bookDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "registermanagements",
          localField: "studentId",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      {
        $unwind: { path: "$studentDetails", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "subscriptiontypes",
          localField: "bookAllotmentDetails.paymentType",
          foreignField: "_id",
          as: "subscriptionDetails",
        },
      },
      {
        $unwind: {
          path: "$subscriptionDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,
          reason: 1,
          amount: 1,
          fine: 1,
          createdAt: 1,
          updatedAt: 1,
          bookDetails: {
            bookName: 1,
            title: 1,
            author: 1,
            publisherName: 1,
          },
          studentDetails: {
            student_Name: 1,
            email: 1,
            mobile_Number: 1,
          },
          subscriptionDetails: {
            title: 1,
            amount: 1,
            discount: 1,
          },
          bookAllotmentDetails: {
            bookIssueDate: 1,
            submissionDate: 1,
            quantity: 1,
          },
        },
      },
    ]);

    if (!fineBooks || fineBooks.length === 0) {
      return res
        .status(404)
        .json({ message: "No fines found for this student." });
    }

    return res.status(200).json(fineBooks);
  } catch (error) {
    console.error("Error fetching fine book details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
export const getAllFineBooks = async (req, res) => {
  try {
    const data = await BookFine.aggregate([
      {
        $lookup: {
          from: "bookallotments",
          localField: "bookId",
          foreignField: "_id",
          as: "bookAllotmentsDetails",
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
          from: "bookmanagements",
          localField: "bookAllotmentsDetails.bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },

      {
        $lookup: {
          from: "subscriptiontypes",
          localField: "bookAllotmentsDetails.paymentType",
          foreignField: "_id",
          as: "paymentTypeDetails",
        },
      },

      {
        $unwind: {
          path: "$bookAllotmentsDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$studentDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$bookDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$paymentTypeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (!data || data.length === 0) {
      return res.status(404).send({ message: "No fine books found" });
    }

    return res.status(200).send(data);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const findByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const data = await BookFine.aggregate([
      {
        $lookup: {
          from: "bookallotments",
          localField: "bookId",
          foreignField: "_id",
          as: "bookAllotmentsDetails",
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
          from: "bookmanagements",
          localField: "bookAllotmentsDetails.bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },

      {
        $lookup: {
          from: "subscriptiontypes",
          localField: "bookAllotmentsDetails.paymentType",
          foreignField: "_id",
          as: "paymentTypeDetails",
        },
      },

      {
        $unwind: {
          path: "$bookAllotmentsDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$studentDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$bookDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$paymentTypeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (!fines || fines.length === 0) {
      return res
        .status(404)
        .json({ message: "No fines found for this student." });
    }

    return res.status(200).json(fines);
  } catch (error) {
    console.error("Error fetching fine book details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const findFineByStudentIdAndBookId = async (req, res) => {
  try {
    const { bookId, studentId } = req?.params;
    const bookObjectId = new mongoose.Types.ObjectId(bookId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const findData = await BookFine.aggregate([
      {
        $match: {
          bookId: bookObjectId,
          studentId: studentObjectId,
        },
      },
    ]);
    if (!findData || findData.length === 0) {
      return res.status(404).json({
        message: "Fine record not found for the provided studentId and bookId",
      });
    }
    return res.status(200).json(findData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while fetching fine data",
      error: error.message,
    });
  }
};

export const findFineByStudentIdAndBookIdInvoice = async (req, res) => {
  try {
    const { bookId, studentId } = req?.params;
    const bookObjectId = new mongoose.Types.ObjectId(bookId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const findData = await BookFine.find({
      studentId: studentObjectId,
    });
    if (!findData || findData.length === 0) {
      return res.status(404).json({
        message: "Fine record not found for the provided studentId and bookId",
      });
    }
    return res.status(200).json(findData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while fetching fine data",
      error: error.message,
    });
  }
};
export const findFinebyAllotmentIdAndBookId = async (req, res) => {  
  const { allotmentId, bookId } = req.params;

  if (!allotmentId || !bookId) {
    return res.status(400).json({
      message: "Invalid or missing allotment ID or book ID",
    });
  }

  try {
    const fines = await BookFine.find({ allotmentId, bookId });

    if (fines.length === 0) {
      return res.status(200).json({
        message: "No fine found for this allotment and book ID",
        fines: [], 
      });
    }

    return res.status(200).json({
      message: "Fine found successfully",
      fines,
    });
  } catch (error) {
    console.error("Error fetching fine by allotmentId and bookId:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
