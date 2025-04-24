import { MongoServerClosedError } from "mongodb";
import { BookManagement } from "../models/book.management.js";
import { BookAllotment } from "../models/bookAllotment.js";
import { PurchaseManagement } from "../models/purchase.js";
import { BookFine } from "../models/fine.management.js";
import { RegisterManagement } from "../models/register.management.js";
import { SubmittedBooks } from "../models/SubmittedBooks.js";
import { Admin } from "../models/admin.js";
const { ObjectId } = mongoose.Types;
import mongoose from "mongoose";
import Types from "mongoose";
import { BookAllotmentHistory } from "../models/bookallotmentHistory.js";
import { SubscriptionType } from "../models/subscriptionType.model.js";
import moment from "moment-timezone";
import { sendAllotmentInvoiceEmail } from "./email.js";
export const bookAllotmentCount = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await RegisterManagement.findById(studentId, {
      active: false,
    });

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
export const bookAllotment = async (req, res) => {
  const {
    bookId,
    studentId,
    bookIssueDate,
    submissionDate,
    paymentType,
    amount,
  } = req.body;
  try {
    const studentAllotments = await BookAllotment.countDocuments({
      studentId,
    });

    if (studentAllotments >= 5) {
      return res
        .status(400)
        .json({ message: "Student can't borrow more than 5 books." });
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
        amount,
      });

      const bookAllotmentData = await newBookAllotment.save();

      const bookManagement = await BookManagement.findById(id);

      if (bookManagement && bookManagement.quantity > 0) {
        await BookManagement.findByIdAndUpdate(id, { $inc: { quantity: -1 } });
      } else {
        return res
          .status(400)
          .json({ message: `Book with ID ${id} is out of stock.` });
      }

      allotments.push(bookAllotmentData);
    }

    return res.status(200).json(allotments);
  } catch (error) {
    console.error("Error allotting book:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
export const manyBookAllotment = async (req, res) => { 
  const allotmentsData = req.body;

  try {
    const studentId = allotmentsData[0]?.studentId;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res
        .status(400)
        .json({ message: `Invalid student ID: ${studentId}` });
    }

    const student = await RegisterManagement.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const newBookCount = allotmentsData.reduce((acc, item) => acc + item.quantity, 0);

    if (student.bookCount + newBookCount > 5) {
      return res.status(400).json({
        message: `Student already has ${student.bookCount} books. Can only take ${5 - student.bookCount} more.`,
      });
    }

    const newAllotment = new BookAllotment({
      studentId,
      books: [],
      count: 0,
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
      if (!bookManagement || bookManagement.bookQuantity < quantity) {
        throw new Error(`Book with ID ${bookId} is out of stock.`);
      }

      await BookManagement.findOneAndUpdate(
        { _id: bookId },
        { $inc: { bookQuantity: -quantity } },
        { new: true }
      );

      newAllotment.books.push({
        bookId,
        bookIssueDate,
        submissionDate,
        paymentType,
        quantity,
        amount,
      });
    }

    newAllotment.count = newAllotment.books.length;

    await newAllotment.save();

    student.bookCount += newBookCount;
    await student.save();
    const adminId = allotmentsData[0]?.adminId;
    const admin = await Admin.findById(adminId);    
    if (admin?.allotmentEmail) {      
      await sendAllotmentInvoiceEmail(newAllotment._id,adminId );
    }

    return res.status(201).json({
      message: "Books allotted successfully",
      allotmentId: newAllotment._id,
      allotment: newAllotment,
    });
  } catch (error) {
    console.error("Error allotting books:", error);
    return res.status(400).json({ message: error.message });
  }
};
export const getBookAllotment = async (req, res) => {
  try {
    const bookAllotments = await BookAllotment.aggregate([
      { $unwind: "$books" },
      { $match: { "books.active": true } },
      {
        $lookup: {
          from: "bookmanagements",
          localField: "books.bookId",
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
          studentId: 1,
          "bookDetails.bookName": 1,
          "studentDetails.student_Name": 1,
          "studentDetails.studentId": 1,
          "books.bookIssueDate": 1,
          "books.submissionDate": 1,
          "books.paymentType": 1,
          "books.quantity": 1,
          "books.amount": 1,
          "books.submit": 1,
          "books.fine": 1,
        },
      },
    ]);

    if (!bookAllotments.length) {
      return res.status(404).json({ message: "No book allotments found" });
    }

    return res.status(200).json(bookAllotments);
  } catch (error) {
    console.error("Error fetching book allotments:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
export const reBookAllotment = async (req, res) => {
  try {
    const bookAllotments = await BookAllotment.aggregate([
      {
        $match: { active: true },
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
          mobile_Number: "$studentDetails.mobile_Number",
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
        $match: { active: true },
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
    ]);

    if (!bookAllotments) {
      return res
        .status(404)
        .json({ message: "No book allotment found for the provided ID" });
    }

    return res.status(200).json(bookAllotments);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};
export const editBookAllotment = async (req, res) => {
  const { id } = req.params;
  const { bookName, student_Name, paymentType, bookIssueDate, submissionDate } =
    req.body;

  try {
    const updatedBookAllotment = await BookAllotment.findByIdAndUpdate(
      id,

      {
        bookName,
        student_Name,
        paymentType,
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

  try {
    const user = await RegisterManagement.findById(id, { active: false });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bookAllotments = await BookAllotment.find({ studentId: id });
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

  try {
    const bookAllotments = await BookAllotment.find({ studentId: id })
      .populate({
        path: "books.bookId",
        model: "BookManagement",
      })
      .populate({
        path: "studentId",
        model: "RegisterManagement",
      })
      .populate({
        path: "paymentType",
        model: "SubscriptionType",
        strictPopulate: false,
      })
      .sort({ createdAt: -1 });

    if (!bookAllotments || bookAllotments.length === 0) {
      return res
        .status(404)
        .json({ message: "No book allotments found for this user" });
    }

    res.status(200).json(bookAllotments);
  } catch (error) {
    console.error("Error finding book allotments for user:", error);
    res.status(500).json({ message: "Failed to retrieve book allotments" });
  }
};
export const deleteAllotmentBook = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAllotmentBook = await BookAllotment.findByIdAndDelete(id, {
      active: false,
    });
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
        $match: { active: true },
      },
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

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const bookAllotmentReport = async (req, res) => {
  const { startDate, endDate } = req.params;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Both startDate and endDate are required" });
  }

  const parsedStartDate = moment.utc(startDate, "YYYY-MM-DD").startOf("day");
  const parsedEndDate = moment.utc(endDate, "YYYY-MM-DD").endOf("day");

  try {
    const bookAllotments = await BookAllotment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: parsedStartDate.toDate(),
            $lte: parsedEndDate.toDate(),
          },
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
        $unwind: {
          path: "$studentDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "bookmanagements",
          localField: "books.bookId",
          foreignField: "_id",
          as: "allBookDetails",
        },
      },
      {
        $lookup: {
          from: "subscriptiontypes",
          localField: "books.paymentType",
          foreignField: "_id",
          as: "allPaymentTypes",
        },
      },
      {
        $addFields: {
          books: {
            $map: {
              input: "$books",
              as: "book",
              in: {
                $mergeObjects: [
                  "$$book",
                  {
                    bookDetail: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$allBookDetails",
                            as: "bd",
                            cond: {
                              $eq: ["$$bd._id", "$$book.bookId"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                    paymentDetail: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$allPaymentTypes",
                            as: "pt",
                            cond: {
                              $eq: ["$$pt._id", "$$book.paymentType"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          allBookDetails: 0,
          allPaymentTypes: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    if (bookAllotments.length === 0) {
      return res
        .status(200)
        .json({ message: "No records found for the given date range" });
    }

    return res.status(200).json(bookAllotments);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while fetching data",
    });
  }
};
export const receiveBook = async (req, res) => {
  try {
    const ReceiveBooks = await BookAllotment.find()
      .populate("studentId", "student_Name email mobile_Number")
      .populate("books.bookId", "title author")
      .populate("books.paymentType", "title");

    const activeBookAllotments = ReceiveBooks.filter((bookAllotment) =>
      bookAllotment.books.some((book) => book.active === true)
    );

    if (activeBookAllotments.length === 0) {
      return res
        .status(404)
        .json({ message: "No active Book Allotments found" });
    }

    const allBooks = activeBookAllotments.flatMap((bookAllotment) => {
      return (bookAllotment.books || []).map((book) => ({
        allotmentId: bookAllotment._id || "N/A",
        student: {
          studentId: bookAllotment.studentId?._id || "N/A",
          studentName: bookAllotment.studentId?.student_Name || "N/A",
          email: bookAllotment.studentId?.email || "N/A",
          mobileNumber: bookAllotment.studentId?.mobile_Number || "N/A",
        },
        bookId: book.bookId?._id || "N/A",
        bookTitle: book.bookId?.title || "N/A",
        bookAuthor: book.bookId?.author || "N/A",
        paymentType: book.paymentType?.title || "N/A",
        amount: book.amount ?? 0,
        bookIssueDate: book.bookIssueDate || null,
        submissionDate: book.submissionDate || null,
        quantity: book.quantity ?? 0,
        fine: book.fine ?? 0,
        active: book.active ?? false,
        submit: book.submit ?? false,
        _id: book._id || "N/A",
        submitCount: book.submitCount ?? 0,
      }));
    });
    
    res.status(200).json({
      message: "All active books fetched successfully",
      books: allBooks,
    });
  } catch (error) {
    console.error("Error fetching book Allotments:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const postReceiveBook = async (req, res) => {
  const { bookId, studentId, email } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(_Id)) {
      return res.status(400).json({ message: "Invalid bookId" });
    }

    const BookAllotmentSchema = new BookAllotment({
      bookId,
      studentId,
      email,
    });

    const receiveBookData = await BookAllotmentSchema.save();

    return res.status(200).send(receiveBookData);
  } catch (error) {
    console.error("Error in Book Management:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
export const newReceiveBook = async (req, res) => {
  const { bookId, studentId, email } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid bookId" });
    }

    const existingBookAllotment = await BookAllotment.find({
      email,
      active: false,
    });

    const BookAllotmentSchema = new BookAllotment({
      bookId,
      studentId,
      email,
    });

    const receiveBookData = await BookAllotmentSchema.save();

    return res.status(200).send(receiveBookData);
  } catch (error) {
    console.error("Error in Book Management:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
export const getReceiveBook = async (req, res) => {
  try {
    const bookAllotments = await BookAllotment.aggregate([
      {
        $match: { active: true },
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
          as: "subscriptionDetails",
        },
      },
      { $unwind: "$bookDetails" },
      { $unwind: "$studentDetails" },
      { $unwind: "$subscriptionDetails" },
    ]);

    return res.status(200).json(bookAllotments);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
export const removeReceiveBook = async (req, res) => {
  const { id } = req.params;

  try {
    const removedReceiveBook = await BookAllotment.findOneAndUpdate(
      { "books._id": new mongoose.Types.ObjectId(id) },
      {
        $set: {
          "books.$.active": false,
          "books.$.submit": true,
        },
        $inc: { count: -1 },
      },
      { new: true }
    );

    if (!removedReceiveBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book received allotment removed successfully",
      removedReceiveBook,
    });
  } catch (error) {
    console.error("Error removing the received book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const submitBook = async (req, res) => {
  const { id } = req.params;
  const { receivequantity } = req.body;

  try {
    const bookExists = await BookAllotment.findOne({
      books: { $elemMatch: { _id: new mongoose.Types.ObjectId(id) } },
    });

    if (!bookExists) {
      return res.status(404).json({ message: "Book not found" });
    }

    const targetBook = bookExists.books.find(
      (b) => b._id.toString() === id.toString()
    );

    if (!targetBook) {
      return res.status(404).json({ message: "Book not found in allotment" });
    }

    const updatedSubmitCount = (targetBook.submitCount || 0) + receivequantity;

    if (updatedSubmitCount > targetBook.quantity) {
      return res.status(400).json({ message: "Submitted quantity exceeds allotted amount" });
    }

    const isFullySubmitted = updatedSubmitCount === targetBook.quantity;
    const isActive = !isFullySubmitted;
    
    const submittedBook = await BookAllotment.findOneAndUpdate(
      { "books._id": id },
      {
        $set: {
          "books.$.submitCount": updatedSubmitCount,
          "books.$.submit": isFullySubmitted,
          "books.$.active": isActive,
        }
      },
      { new: true }
    );

    await RegisterManagement.findByIdAndUpdate(
      bookExists.studentId,
      { $inc: { bookCount: -receivequantity } },
      { new: true }
    );

    return res.status(200).json({
      message: "Book submitted successfully",
      submittedBook,
    });
  } catch (error) {
    console.error("Error submitting book:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getSubmitBook = async (req, res) => {
  const { selectedStudentId } = req.params;

  try {
    const submittedBooks = await BookAllotment.find({
      studentId: selectedStudentId,
      submit: true,
    });

    if (!submittedBooks || submittedBooks.length === 0) {
      return res.status(404).json({ message: "No submitted books found" });
    }

    return res.status(200).json({
      message: "Successfully fetched submitted books",
      submittedBooks,
    });
  } catch (error) {
    console.error("Error fetching submitted books:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
export const getSubmitBookDetails = async (req, res) => {
  const { selectedStudentId } = req?.params;

  try {
    const submittedBooks = await BookAllotment.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(selectedStudentId),
          submit: true,
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
          from: "subscriptiontypes",
          localField: "paymentType",
          foreignField: "_id",
          as: "paymentDetails",
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
    ]);

    return res.status(200).json({
      message: "Successfully fetched submitted books",
      submittedBooks,
    });
  } catch (error) {
    console.error("Error fetching submitted books:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
export const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ObjectId format." });
    }

    const bookAllotment = await BookAllotment.findById(id)
      .populate({
        path: "books.bookId",
        model: "BookManagement",
      })
      .populate({
        path: "studentId",
        model: "RegisterManagement",
      })
      .populate({
        path: "books.paymentType",
        model: "SubscriptionType",
        select: "title",
        strictPopulate: false,
      });

    if (!bookAllotment) {
      return res.status(404).json({ message: "No data found for this ID." });
    }

    return res.status(200).json(bookAllotment);
  } catch (error) {
    console.error("Error during find operation:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
export const getAllSubmitBookDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const submittedBooks = await BookAllotment.aggregate([
      {
        $unwind: "$books",
      },
      {
        $match: {
          "books.submit": true,
        },
      },
      {
        $lookup: {
          from: "bookmanagements",
          localField: "books.bookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $lookup: {
          from: "subscriptiontypes",
          localField: "books.paymentType",
          foreignField: "_id",
          as: "paymentDetails",
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
    ]);
    return res.status(200).json({
      message: "Successfully fetched submitted books",
      submittedBooks,
    });
  } catch (error) {
    console.error("Error fetching submitted books:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const fetchBooks = async (req, res) => {
  try {
    const response = await BookAllotment.find()
      .populate("studentId", "student_Name email mobile_Number")
      .populate("books.bookId", "title author")
      .populate("books.paymentType", "title")
      .sort({ createdAt: -1 });

    const formattedResponse = response.map((item) => {
      const totalAmount = item.books.reduce(
        (sum, book) => sum + (book.amount || 0) * (book.quantity || 1),
        0
      );

      return {
        allotmentId: item.id,
        studentName: item.studentId?.student_Name || "N/A",
        studentEmail: item.studentId?.email || "N/A",
        studentMobile: item.studentId?.mobile_Number || "N/A",
        totalAmount: `${totalAmount.toFixed(2)}`,
        books: item.books.map((book) => ({
          bookName: book.bookId?.title || "N/A",
          bookAuthor: book.bookId?.author || "N/A",
          quantity: book.quantity,
          amount: `${(book.amount || 0).toFixed(2)}`,
          submissionType: book.paymentType?.title || "N/A",
          submissionDate: book.submissionDate
            ? new Date(book.submissionDate).toLocaleDateString()
            : "N/A",
        })),
      };
    });

    res
      .status(200)
      .json({ message: "Data is available", response: formattedResponse });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getBookAllotmentInvoice = async (req, res) => {
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

        const paymentDetails = await SubscriptionType.findById(
          item.paymentType
        );

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
export const trendingBooks = async (req, res) => {
  try {
    const allottedBooks = await BookAllotment.aggregate([
      {
        $unwind: "$books",
      },
      {
        $project: {
          _id: 0,
          bookId: "$books.bookId",
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
        $unwind: "$bookDetails",
      },
      {
        $group: {
          _id: "$bookId",
          title: { $first: "$bookDetails.title" },
          author: { $first: "$bookDetails.author" },
          img: { $first: "$bookDetails.upload_Book" },
        },
      },
      {
        $project: {
          _id: 0,
          bookId: "$_id",
          title: 1,
          author: 1,
          img: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Trending books fetched successfully",
      data: allottedBooks,
    });
  } catch (error) {
    console.error("Error fetching trending books:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trending books",
      error: error.message,
    });
  }
};
export const submissionReport = async (req, res) => {
  const { startDate, endDate } = req.params;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Both startDate and endDate are required" });
  }

  const parsedStartDate = moment.utc(startDate, "YYYY-MM-DD").startOf("day");
  const parsedEndDate = moment.utc(endDate, "YYYY-MM-DD").endOf("day");

  try {
    const bookAllotments = await BookAllotment.aggregate([
      {
        $unwind: "$books"
      },
      {
        $match: {
          "books.submit": true,
          "books.updatedAt": {
            $gte: parsedStartDate.toDate(),
            $lte: parsedEndDate.toDate()
          }
        }
      },
      {
        $lookup: {
          from: "bookmanagements",
          localField: "books.bookId",
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
        $lookup: {
          from: "subscriptiontypes",
          localField: "books.paymentType",
          foreignField: "_id",
          as: "paymentType"
        }
      },
      {
        $lookup: {
          from: "bookfines",
          localField: "_id",
          foreignField: "allotmentId",
          as: "finedetalis"
        }
      },
      {
        $unwind: {
          path: "$studentDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$paymentType",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$bookDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$finedetalis",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          "books.updatedAt": -1
        }
      },

    ]);

    if (bookAllotments.length === 0) {
      return res.status(200).json({
        message: "No records found for the given date range with submit = true"
      });
    }

    return res.status(200).json(bookAllotments);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while fetching data"
    });
  }
};

