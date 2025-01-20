import { MongoServerClosedError } from "mongodb";
import { BookManagement } from "../models/book.management.js";
import { BookAllotment } from "../models/bookAllotment.js";
import { PurchaseManagement } from "../models/purchase.js";

import { RegisterManagement } from "../models/register.management.js";
const { ObjectId } = mongoose.Types;
import mongoose from "mongoose";
import Types from "mongoose";

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
  console.log("Request body========================>", req.body);

  try {
    // Assuming studentId is the same for all books, we just get it from the first book in the list
    const studentId = allotmentsData[0]?.studentId;

    // Validate the student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res
        .status(400)
        .json({ message: `Invalid student ID: ${studentId}` });
    }

    // Find the student's existing allotment record
    let studentAllotment = await BookAllotment.findOne({ studentId });

    if (!studentAllotment) {
      // If no allotment exists for this student, create a new one
      studentAllotment = new BookAllotment({
        studentId,
        books: [],
        count: 0,
      });
    }

    // Add the new books to the student's existing allotment
    for (const allotment of allotmentsData) {
      const {
        bookId,
        quantity,
        bookIssueDate,
        submissionDate,
        paymentType,
        amount,
      } = allotment;

      // Check if the book already exists in the books array
      const existingBookIndex = studentAllotment.books.findIndex(
        (book) => book.bookId.toString() === bookId
      );

      if (existingBookIndex >= 0) {
        // If the book already exists, update the quantity
        studentAllotment.books[existingBookIndex].quantity += quantity;
      } else {
        // If the book does not exist, add it to the array
        studentAllotment.books.push({
          bookId,
          bookIssueDate,
          submissionDate,
          paymentType,
          quantity,
          amount,
        });
      }

      // Update stock in BookManagement
      const bookManagement = await BookManagement.findById(bookId);
      if (!bookManagement || bookManagement.quantity < quantity) {
        throw new Error(`Book with ID ${bookId} is out of stock.`);
      }

      await PurchaseManagement.findOneAndUpdate(
        { bookId: new mongoose.Types.ObjectId(bookId) },
        { $inc: { quantity: -quantity } },
        { new: true }
      );
    }

    // Update the total book count in the student's allotment
    studentAllotment.count = studentAllotment.books.length;

    // Save the updated student allotment record
    await studentAllotment.save();

    return res.status(200).json({ message: "Books allotted successfully" });
  } catch (error) {
    console.error("Error allotting books:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const getBookAllotment = async (req, res) => {
  try {
    console.log("Data.........");

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
      // {
      //   $project: {
      //     _id: 1,
      //     bookName: "$bookDetails.bookName",
      //     // bookTitle: "$bookDetails.bookTitle",
      //     student_Name: "$studentDetails.student_Name",

      //     bookIssueDate: 1,
      //     submissionDate: 1,
      //     paymentType: 1,
      //   },
      // },
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
    const user = await RegisterManagement.findById(id, { active: false });
    // console.log("user", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bookAllotments = await BookAllotment.find({ user_id: id });

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
    // console.log("id", id);
    const bookAllotments = await BookAllotment.aggregate([
      {
        // $match: {  studentId: id },
        $match: { studentId: new ObjectId(id) },
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

      { $unwind: "$bookDetails" },
      { $unwind: "$studentDetails" },
      { $unwind: "$paymentType" },
      {
        $project: {
          _id: 1,
          bookName: "$bookDetails.bookName",
          bookTitle: "$bookDetails.bookTitle",
          student_Name: "$studentDetails.student_Name",
          paymentType: "$paymentType.title",
          amount: "$paymentType.amount",
          bookIssueDate: 1,
          submissionDate: 1,
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
        $match: { active: true },
      },
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
      {
        $lookup: {
          from: "subscriptiontypes",
          localField: "paymentType",
          foreignField: "_id",
          as: "paymentType",
        },
      },
      { $unwind: "$bookDetails" },
      { $unwind: "$studentDetails" },
      { $unwind: "$paymentType" },
      {
        $project: {
          _id: 1,
          bookName: "$bookDetails.bookName",
          bookTitle: "$bookDetails.bookTitle",
          student_Name: "$studentDetails.student_Name",
          paymentType: "$paymentType.title",
          bookIssueDate: 1,
          submissionDate: 1,
        },
      },
      { $sort: { _id: -1 } },
    ]);

    // console.log("newBookAllotment", newBookAllotment);

    return res.status(200).json(newBookAllotment);
  } catch (error) {
    return res
      .status(500)
      .json({ error: `${error.message || "An error occurred"}` });
  }
};

export const receiveBook = async (req, res) => {
  const { id } = req.params;
  try {
    const ReceiveBook = await BookAllotment.findById(id, { active: true });

    if (!ReceiveBook) {
      return res.status(404).json({ message: "find Book Allotment not found" });
    }

    res.status(200).json({
      message: "find BookAllotment successfully",
      ReceiveBook,
    });
  } catch (error) {
    console.error("Error updating book Allotment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const postReceiveBook = async (req, res) => {
  const { bookId, studentId, email } = req.body;

  try {
    console.log("Loading................................");
    console.log("Received data:", req.body);
    if (!mongoose.Types.ObjectId.isValid(_Id)) {
      return res.status(400).json({ message: "Invalid bookId" });
    }

    const BookAllotmentSchema = new BookAllotment({
      bookId,
      studentId,
      email,
    });

    const receiveBookData = await BookAllotmentSchema.save();
    console.log("Received Book Data:", receiveBookData);

    return res.status(200).send(receiveBookData);
  } catch (error) {
    console.error("Error in Book Management:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const newReceiveBook = async (req, res) => {
  const { bookId, studentId, email } = req.body;

  try {
    console.log("Loading................................");
    console.log("Received data:", req.body);

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid bookId" });
    }

    const existingBookAllotment = await BookAllotment.find({
      email,
      active: false,
    });

    if (existingBookAllotment.length > 0) {
      console.log(
        "Found Book Allotment with this email:",
        existingBookAllotment
      );
    } else {
      console.log("No Book Allotment found with this email.");
    }

    const BookAllotmentSchema = new BookAllotment({
      bookId,
      studentId,
      email,
    });

    const receiveBookData = await BookAllotmentSchema.save();
    console.log("Received Book Data:", receiveBookData);

    return res.status(200).send(receiveBookData);
  } catch (error) {
    console.error("Error in Book Management:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getReceiveBook = async (req, res) => {
  try {
    console.log("Data.........");

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
      // {
      //   $project: {
      //     _id: 1,
      //     bookName: "$bookDetails.bookName",
      //     // bookTitle: "$bookDetails.bookTitle",
      //     student_Name: "$studentDetails.student_Name",

      //     bookIssueDate: 1,
      //     submissionDate: 1,
      //     paymentType: 1,
      //   },
      // },
    ]);
    // console.log("bookAllotments ", bookAllotments);

    return res.status(200).json(bookAllotments);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const removeReceiveBook = async (req, res) => {
  const { id } = req.params;
  console.log(`Received ID for removal: ${id}`);

  const updateData = {
    active: false,
    submit: true,
    $inc: { count: -1 },
  };

  try {
    const removedReceiveBook = await BookAllotment.findByIdAndUpdate(
      id,
      updateData,
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
  console.log("ID>>>", id);

  try {
    const bookExists = await BookAllotment.findOne({ bookId: id });
    if (!bookExists) {
      return res.status(404).json({ message: "Book not found" });
    }

    const submittedBook = await BookAllotment.findOneAndUpdate(
      { bookId: id },
      { submit: true },
      { new: true }
    );

    if (!submittedBook) {
      return res.status(404).json({ message: "No book found to submit" });
    }

    console.log("Submitted book:", submittedBook);
    return res.status(200).json({
      message: "Book successfully submitted",
      submittedBook,
    });
  } catch (error) {
    console.error("Error submitting book:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
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

    console.log("Fetched submitted books:", submittedBooks);
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
  console.log(`selectedStudentId`, selectedStudentId);

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

    console.log("Fetched submitted books:", submittedBooks);
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
    console.log(`id----->>>`, id);

    const bookAllotments = await BookAllotment.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
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
          as: "subscriptionDetails",
        },
      },
      { $unwind: "$bookDetails" },
      { $unwind: "$studentDetails" },
      { $unwind: "$subscriptionDetails" },
    ]);
    console.log("bookAllotments", bookAllotments);

    return res.status(200).json(bookAllotments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const getAllSubmitBookDetails = async (req, res) => {
  try {
    const submittedBooks = await BookAllotment.aggregate([
      {
        $match: {
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

    console.log("Fetched submitted books:", submittedBooks);
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
// Adjust the path if necessary

export const fetchBooks = async (req, res) => {
  try {
    // Fetch all BookAllotments and populate nested fields
    const response = await BookAllotment.find()
      .populate("studentId", "student_Name email mobile_Number")
      .populate("books.bookId", "title author")
      .populate("books.paymentType", "title");

    // Format the response to include total amount for each allotment
    const formattedResponse = response.map((item) => {
      const totalAmount = item.books.reduce(
        (sum, book) => sum + (book.amount || 0),
        0
      ); // Calculate total amount for this specific allotment

      return {
        studentName: item.studentId?.student_Name || "N/A",
        studentEmail: item.studentId?.email || "N/A",
        studentMobile: item.studentId?.mobile_Number || "N/A",
        totalAmount: `₹${totalAmount.toFixed(2)}`, // Include total amount
        books: item.books.map((book) => ({
          bookName: book.bookId?.title || "N/A",
          bookAuthor: book.bookId?.author || "N/A",
          quantity: book.quantity,
          amount: `₹${(book.amount || 0).toFixed(2)}`,
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
