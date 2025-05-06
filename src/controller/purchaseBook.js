import mongoose from "mongoose";
import { PurchaseManagement } from "../models/purchase.js";
import { BookAllotment } from "../models/bookAllotment.js";
import { BookManagement } from "../models/book.management.js";
import { VenderManagement } from "../models/vendor.management.js";
import moment from "moment-timezone";
import { Admin } from "../models/admin.js";
import { sendpurchesInvoiceEmail } from "./email.js";

export const purchaseBook = async (req, res) => {
  const {
    bookId,
    vendorId,
    price,
    bookIssueDate,
    quantity,
    totalPrice,
    bookComment,
    adminId,
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
    const admin = await Admin.findById(adminId);

    if (admin?.purchesEmail) {
      await sendpurchesInvoiceEmail( PurchaseBookData._id,adminId);
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
  const { id, price, quantity, bookId } = req.body;

  try {
    const updatedPurchase = await PurchaseManagement.findByIdAndUpdate(
      id,
      { price, quantity },
      { new: true }
    );

    if (!updatedPurchase) {
      return res.status(404).json({ message: "Purchase record not found" });
    }

    const updatedBook = await BookManagement.findByIdAndUpdate(
      bookId,
      { bookQuantity: quantity },
      { new: true }  
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book & Purchase updated successfully",
      updatedPurchase,
      updatedBook,
    });

  } catch (error) {
    console.error("Error updating records:", error);
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
          bookId:"$bookDetails._id",
          bookName: "$bookDetails.bookName",
          vendorId: "$vendorDetails.vendorName", 
          quantity: 1,
          bookComment: 1,
          price: 1,
          bookIssueDate:1,
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


    return res.status(200).json(bookAllotments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const purchaseReport = async (req, res) => {

  const { startDate, endDate } = req.params;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Both startDate and endDate are required" });
  }

  const parsedStartDate = moment.utc(startDate, 'YYYY-MM-DD').startOf('day'); 
  const parsedEndDate = moment.utc(endDate, 'YYYY-MM-DD').endOf('day'); 

  try {
    const purchases = await PurchaseManagement.aggregate([
      {
        $match: {
          bookIssueDate: {
            $gte: parsedStartDate.toDate(), 
            $lte: parsedEndDate.toDate(),  
          },
        },
      },

      {
        $lookup: {
          from: 'bookmanagements', 
          localField: 'bookId',     
          foreignField: '_id',     
          as: 'bookDetails',       
        },
      },

      {
        $lookup: {
          from: 'vendermanagements', 
          localField: 'vendorId',   
          foreignField: '_id',      
          as: 'vendorDetails',      
        },
      },

      { $unwind: { path: '$bookDetails', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$vendorDetails', preserveNullAndEmptyArrays: true } },
      { $sort: { _id: -1 } },
    ]);


    if (purchases.length === 0) {
      return res.status(200).json({ message: "No purchase records found for the given date range" });
    }

    return res.status(200).json(purchases);

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message || "An error occurred while fetching data" });
  }
};
export const purchaseMonthviseData = async (req, res) => {
  try {
    const { year } = req.body;
    
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59`);

    const data = await PurchaseManagement.aggregate([
      {
        $match: {
          bookIssueDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: '$bookIssueDate' }, 
          totalPurchasedBooks: { $sum: '$quantity' } 
        }
      },
      {
        $sort: { _id: 1 }  
      }
    ]);
    

    const result = Array(12).fill(0);
    data.forEach((entry) => {
      result[entry._id - 1] = entry.totalPurchasedBooks;  
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching purchase month-wise data:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
