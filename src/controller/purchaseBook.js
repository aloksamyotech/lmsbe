import mongoose from "mongoose";
import { PurchaseManagement } from "../models/purchase.js";
import { BookAllotment } from "../models/bookAllotment.js";
import { BookManagement } from "../models/book.management.js";
import {VenderManagement } from "../models/vendor.management.js"; 
import moment from 'moment-timezone';
// export const purchaseBook = async (req, res) => {
//   const {
//     bookId,
//     vendorId, 
//     price, 
//     bookIssueDate,
//     quantity,
//     totalPrice,
//     bookComment,
//   } = req.body;

//   try { 

//     if (!mongoose.Types.ObjectId.isValid(bookId)) {
//       return res.status(400).json({ message: "Invalid bookId" });
//     }

//     const PurchaseManagementSchema = new PurchaseManagement({
//       bookId,
//       vendorId,
//       price,
//       bookIssueDate,
//       quantity,
//       totalPrice,
//       bookComment,
//     });

//     const PurchaseBookData = await PurchaseManagementSchema.save();
//     // console.log("BookManagement Data", PurchaseBookData);
//     return res.status(200).send(PurchaseBookData);
//   } catch (error) {
//     console.error("Error in BookManagement", error);
//     return res.status(500).send({ message: "Internal Server Error" });
//   }
// };
export const purchaseBook = async (req, res) => {
  console.log("purchesing book ----------------------------------")
  const {
    bookId,
    vendorId,
    price,
    bookIssueDate,
    quantity,
    totalPrice,
    bookComment,
  } = req.body;

  try {
   
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid bookId" });
    }

    const PurchaseManagementSchema = new PurchaseManagement({
      bookId,
      vendorId,
      price,
      bookIssueDate,
      quantity,
      totalPrice,
      bookComment,
    });

    const PurchaseBookData = await PurchaseManagementSchema.save();
   
    const book = await BookManagement.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const newQuantity = Number(book.bookQuantity) + Number(quantity);
    const updatedBook = await BookManagement.findByIdAndUpdate(
      bookId,
      { bookQuantity: newQuantity },
      { new: true }  
    );

    if (!updatedBook) {
      return res.status(400).json({ message: "Error updating book quantity" });
    }

    return res.status(200).json({
      purchase: PurchaseBookData,
      updatedBook: updatedBook,
    });
  } catch (error) {
    console.error("Error in BookManagement", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
export const deletePurchaseBook = async (req, res) => {
  const { id } = req.params; 

  try {
    const deletedPurchaseBook = await PurchaseManagement.findByIdAndDelete(id, {
      active: false,
    });
    if (!deletedPurchaseBook) {
      return res.status(404).json({ message: "Book not found" });
    }
    res
      .status(200)
      .json({ message: "Book deleted successfully", deletedPurchaseBook });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}; 
export const updatePurchaseBook = async (req, res) => {
  const { id } = req.params;
   const { price, quantity } = req.body;

  try {
    const updatedBook = await PurchaseManagement.findByIdAndUpdate(
      id,
      { active: false },

      {
        price,
        quantity,
      },
      { new: true },
      { sort: _id }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book updated successfully", updatedBook });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const purchaseManagement = async (req, res) => {
  try {
    const purchaseManagementTable = await PurchaseManagement.aggregate([
      {
        $match: { active: true },
      },
      {
        $lookup: {
          from: "vendermanagements",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendorDetails",
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
        $unwind: "$vendorDetails",
        $unwind: "$bookDetails",
      },
      {
        $project: {
          _id: 1,
          bookName: "$bookDetails.bookName",
          vendorId: "$vendorDetails.vendorName", 
          quantity: 1,
          bookComment: 1,
          price: 1,
        },
      },
      { $sort: { _id: -1 } },
    ]); 

    res.status(200).json({
      status: true,
      message: " Purchase Management Table successful",
      BookManagement: purchaseManagementTable,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
 
export const getPurchaseInvoice = async (req, res) => {
  try {
    const { id } = req.params; 
    const bookAllotments = await PurchaseManagement.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "vendermanagements",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendorDetails",
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
        $unwind: {
          path: "$vendorDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$bookDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    console.log("bookAllotments", bookAllotments);

    return res.status(200).json(bookAllotments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const purchaseReport = async (req, res) => {
  console.log("API calling from backend");

  const { startDate, endDate } = req.params;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Both startDate and endDate are required" });
  }

  // Parse the startDate and endDate using Moment.js and convert them to UTC
  const parsedStartDate = moment.utc(startDate, 'YYYY-MM-DD').startOf('day'); // Start of the day in UTC
  const parsedEndDate = moment.utc(endDate, 'YYYY-MM-DD').endOf('day'); // End of the day in UTC

  console.log("Parsed Start Date (UTC):", parsedStartDate.toISOString());
  console.log("Parsed End Date (UTC):", parsedEndDate.toISOString());

  try {
    // Aggregation query to get purchase records along with bookName and vendorName
    const purchases = await PurchaseManagement.aggregate([
      // Match for records within the date range based on bookIssueDate
      {
        $match: {
          bookIssueDate: {
            $gte: parsedStartDate.toDate(), // Greater than or equal to start date (converted to Date)
            $lte: parsedEndDate.toDate(),   // Less than or equal to end date (converted to Date)
          },
        },
      },

      // Lookup for book details (bookName)
      {
        $lookup: {
          from: 'bookmanagements', // Book details collection
          localField: 'bookId',     // Field in PurchaseManagement collection
          foreignField: '_id',      // Field in bookmanagements collection
          as: 'bookDetails',        // Store result in bookDetails field
        },
      },

      // Lookup for vendor details (vendorName)
      {
        $lookup: {
          from: 'vendermanagements', 
          localField: 'vendorId',    // Field in PurchaseManagement collection
          foreignField: '_id',       // Field in vendormanagements collection
          as: 'vendorDetails',       // Store result in vendorDetails field
        },
      },

      // Unwind the arrays from the lookup results
      { $unwind: { path: '$bookDetails', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$vendorDetails', preserveNullAndEmptyArrays: true } },
      { $sort: { _id: -1 } },
    ]);

    console.log("Purchases found:", purchases);

    // If no records are found, return a message
    if (purchases.length === 0) {
      return res.status(200).json({ message: "No purchase records found for the given date range" });
    }

    // Return the results
    return res.status(200).json(purchases);

  } catch (error) {
    // Handle any errors during the query
    console.error("Error:", error);
    return res.status(500).json({ error: error.message || "An error occurred while fetching data" });
  }
};
