import { BookManagement } from "../models/book.management.js";
import { BookAllotment } from "../models/bookAllotment.js";
// import { User } from "../models/User.js";
import { RegisterManagement } from "../models/register.management.js";
// import { BookAllotment } from "../controller/book.management.js"
const { ObjectId } = mongoose.Types;
import mongoose from "mongoose";

export const bookAllotmentCount = async (req, res) => {
  const { studentId } = req.params;
  // console.log("studentId", studentId);

  try {
    const student = await RegisterManagement.findById(studentId, {
      active: false,
    });
    console.log("student", student);

    if (!studentId) {
      return res.status(404).json({ message: "Student not found" });
    }
    const allotmentsCount = await BookAllotment.countDocuments({
      studentId: studentId,
    });
    console.log("HRitik", allotmentsCount);
    return res.status(200).json({ allotmentsCount });
  } catch (error) {
    console.error("Error fetching book allotment count:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// export const    = async (req, res) => {
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

// export const manyBookAllotment = async (req, res) => {
//   const allotmentsData = req.body;

//   try {
//     for (const allotment of allotmentsData) {
//       const { studentId } = allotment;

//       if (!mongoose.Types.ObjectId.isValid(studentId)) {
//         return res
//           .status(400)
//           .json({ message: `Invalid student ID: ${studentId}` });
//       }
//       const studentAllotments = await BookAllotment.countDocuments({
//         studentId,
//       });
//       console.log("Varma >>>>>>>>>", studentAllotments);

//       if (studentAllotments >= 5) {
//         return res
//           .status(400)
//           .json({ message: "Student can't borrow more than 5 books." });
//       }
//     }

//     const allotmentsToInsert = allotmentsData.map((allotment) => ({
//       bookId: allotment.bookId,
//       studentId: allotment.studentId,
//       bookIssueDate: allotment.bookIssueDate,
//       submissionDate: allotment.submissionDate,
//       paymentType: allotment.paymentType,
//       amount: allotment.amount,
//     }));

//     const allotments = await BookAllotment.insertMany(allotmentsToInsert);

//     const bookUpdatePromises = allotmentsData.map(async (allotment) => {
//       const { bookId, studentId } = allotment;
//       const bookManagement = await BookManagement.findById(bookId);
//       if (!bookManagement || bookManagement.quantity <= 0) {
//         await BookAllotment.deleteMany({ studentId, bookId });
//         throw new Error(`Book with ID ${bookId} is out of stock.`);
//       } else {
//         await BookManagement.findByIdAndUpdate(bookId, {
//           $inc: { quantity: -1 },
//         });
//       }
//     });

//     await Promise.all(bookUpdatePromises);
//     return res.status(200).json(allotments);
//   } catch (error) {
//     console.error("Error allotting books:", error);
//     return res.status(400).json({ message: error.message });
//   }
// };

// export const manyBookAllotment = async (req, res) => {
//   const allotmentsData = req.body;

//   try {
//     for (const allotment of allotmentsData) {
//       const { studentId } = allotment;

//       if (!mongoose.Types.ObjectId.isValid(studentId)) {
//         return res
//           .status(400)
//           .json({ message: `Invalid student ID: ${studentId}` });
//       }

//       const studentAllotments = await BookAllotment.countDocuments({
//         studentId,
//       });
//       console.log("Varma >>>>>>>>>", studentAllotments);

//       if (studentAllotments >= 5) {
//         return res
//           .status(400)
//           .json({ message: "Student can't borrow more than 5 books." });
//       }
//     }

//     const allotmentsToInsert = allotmentsData.map((allotment) => ({
//       bookId: allotment.bookId,
//       studentId: allotment.studentId,
//       bookIssueDate: allotment.bookIssueDate,
//       submissionDate: allotment.submissionDate,
//       paymentType: allotment.paymentType,
//       amount: allotment.amount,
//       count: 1,
//     }));

//     const allotments = await BookAllotment.insertMany(allotmentsToInsert);

//     for (const allotment of allotmentsData) {
//       const { studentId } = allotment;

//       const studentAllotmentCount = await BookAllotment.countDocuments({
//         studentId,
//       });
//       await BookAllotment.updateMany(
//         { studentId },
//         { $set: { count: studentAllotmentCount } }
//       );
//     }

//     const bookUpdatePromises = allotmentsData.map(async (allotment) => {
//       const { bookId, studentId } = allotment;
//       const bookManagement = await BookManagement.findById(bookId);
//       if (!bookManagement || bookManagement.quantity <= 0) {
//         await BookAllotment.deleteMany({ studentId, bookId });
//         throw new Error(`Book with ID ${bookId} is out of stock.`);
//       } else {
//         await BookManagement.findByIdAndUpdate(bookId, {
//           $inc: { quantity: -1 },
//         });
//       }
//     });

//     await Promise.all(bookUpdatePromises);
//     return res.status(200).json(allotments);
//   } catch (error) {
//     console.error("Error allotting books:", error);
//     return res.status(400).json({ message: error.message });
//   }
// };

export const manyBookAllotment = async (req, res) => {
  const allotmentsData = req.body;

  try {
    for (const allotment of allotmentsData) {
      const { studentId } = allotment;

      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res
          .status(400)
          .json({ message: `Invalid student ID: ${studentId}` });
      }

      const studentAllotments = await BookAllotment.countDocuments({
        studentId,
      });
      console.log("Varma >>>>>>>>>", studentAllotments);

      if (studentAllotments >= 5) {
        return res
          .status(400)
          .json({ message: "Student can't borrow more than 5 books." });
      }
    }

    const allotmentsToInsert = allotmentsData.map((allotment) => ({
      bookId: allotment.bookId,
      studentId: allotment.studentId,
      bookIssueDate: allotment.bookIssueDate,
      submissionDate: allotment.submissionDate,
      paymentType: allotment.paymentType,
      amount: allotment.amount,
      count: 1,
    }));

    const allotments = await BookAllotment.insertMany(allotmentsToInsert);

    for (const allotment of allotmentsData) {
      const { studentId } = allotment;

      const studentAllotmentCount = await BookAllotment.countDocuments({
        studentId,
      });

      await RegisterManagement.findOneAndUpdate(
        { user_id: studentId },
        { $set: { count: studentAllotmentCount } }
      );
    }

    const bookUpdatePromises = allotmentsData.map(async (allotment) => {
      const { bookId, studentId } = allotment;
      const bookManagement = await BookManagement.findById(bookId);
      if (!bookManagement || bookManagement.quantity <= 0) {
        await BookAllotment.deleteMany({ studentId, bookId });
        throw new Error(`Book with ID ${bookId} is out of stock.`);
      } else {
        await BookManagement.findByIdAndUpdate(bookId, {
          $inc: { quantity: -1 },
        });
      }
    });

    await Promise.all(bookUpdatePromises);
    return res.status(200).json(allotments);
  } catch (error) {
    console.error("Error allotting books:", error);
    return res.status(400).json({ message: error.message });
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

// export const removeReceiveBook = async (req, res) => {
//   const { id } = req.params;
//   console.log(`Received ID for removal: ${id}`);

//   const updateData = {
//     active: false,
//     submit: true,
//   };
//   try {
//     const removedReceiveBook = await BookAllotment.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true }
//     );

//     if (!removedReceiveBook) {
//       return res.status(404).json({ message: "Book not found" });
//     }

//     res.status(200).json({
//       message: "Book received allotment removed successfully",
//       removedReceiveBook,
//     });
//   } catch (error) {
//     console.error("Error removing the received book:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

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

// export const removeReceiveBook = async (req, res) => {
//   const { id } = req.params;
//   console.log(
//     `id------------------JJJJJJJJJJJJOkflkdfjslkfjsdlkfsjlkfjds;lkjdslkdsjfld`,
//     id
//   );

//   try {
//     const receiveBook = await BookAllotment.findByIdAndUpdate(
//       id,
//       { submit: true },
//       { active: true },
//       { new: true }
//     );
//     console.log(`receiveBook`, receiveBook);

//     if (!receiveBook) {
//       return res.status(404).json({ message: "Receive Book not found" });
//     }

//     res.status(200).json({
//       message: "Receive Book successfully removed and marked as submitted",
//       receiveBook,
//     });
//   } catch (error) {
//     console.error("Error removing receive book:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// export const submitBook = async (req, res) => {
//   const { id } = req.params;
// console.log('ID>>>',id);

//   try {
//     const submittedBook = await BookAllotment.findOneAndUpdate(
//       { bookId: id },
//       { submit: true }
//     );

//     if (!submittedBook) {
//       return res.status(404).json({ message: "No book found to submit" });
//     }

//     console.log("Submitted book:", submittedBook);
//     return res.status(200).json({
//       message: "Book successfully submitted",
//       submittedBook,
//     });
//   } catch (error) {
//     console.error("Error submitting book:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

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

// export const getSubmitBook = async (req, res) => {
//   const { selectedStudentId } = req.params;

//   try {
//     const submittedBooks = await BookAllotment.aggregate([
//       {
//         $match: {
//           studentId: selectedStudentId,
//           submit: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "bookmanagements",
//           localField: "bookId",
//           foreignField: "_id",
//           as: "bookDetails",
//         },
//       },
//       {
//         $lookup: {
//           from: "subscriptiontypes",
//           localField: "paymentType",
//           foreignField: "_id",
//           as: "paymentDetails",
//         },
//       },
//       {
//         $lookup: {
//           from: "registermanagements",
//           localField: "studentId",
//           foreignField: "_id",
//           as: "studentDetails",
//         },
//       },
//       { $unwind: { path: "$bookDetails", preserveNullAndEmptyArrays: true } },
//       {
//         $unwind: { path: "$paymentDetails", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $unwind: { path: "$studentDetails", preserveNullAndEmptyArrays: true },
//       },
//     ]);

//     if (!submittedBooks || submittedBooks.length === 0) {
//       return res.status(404).json({ message: "No submitted books found" });
//     }

//     console.log("Fetched submitted books:", submittedBooks);
//     return res.status(200).json({
//       message: "Successfully fetched submitted books",
//       submittedBooks,
//     });
//   } catch (error) {
//     console.error("Error fetching submitted books:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

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

// export const fineBook = async (req, res) => {

//   const { selectedStudentId } = req?.params;
//   console.log(`selectedStudentId`, selectedStudentId);

//   try {
//     const submittedFineBooks = await BookAllotment.aggregate([
//       {
//         $match: {
//           studentId: new mongoose.Types.ObjectId(selectedStudentId),
//           fine: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "bookmanagements",
//           localField: "bookId",
//           foreignField: "_id",
//           as: "bookDetails",
//         },
//       },
//       {
//         $lookup: {
//           from: "subscriptiontypes",
//           localField: "paymentType",
//           foreignField: "_id",
//           as: "paymentDetails",
//         },
//       },
//       {
//         $lookup: {
//           from: "registermanagements",
//           localField: "studentId",
//           foreignField: "_id",
//           as: "studentDetails",
//         },
//       },
//     ]);

//     console.log("Fetched fine books:", submittedFineBooks);
//     return res.status(200).json({
//       message: "Successfully fetched fine books",
//       submittedFineBooks,
//     });
//   } catch (error) {
//     console.error("Error fetching fine books:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

// export const payFine = async (req, res) => {
//   const { id } = req.params;
//   console.log(`Received ID for removal: ${id}`);

//   const updateData = {
//     fine: true,
//   };
//   try {
//     const bookFine = await BookAllotment.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true }
//     );

//     if (!bookFine) {
//       return res.status(404).json({ message: "Book not found" });
//     }

//     res.status(200).json({
//       message: "Book received allotment removed successfully",
//       bookFine,
//     });
//   } catch (error) {
//     console.error("Error removing the received book:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };