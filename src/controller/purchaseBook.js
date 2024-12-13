import mongoose from "mongoose";
import { PurchaseManagement } from "../models/purchase.js";

export const purchaseBook = async (req, res) => {
  const {
    bookId,
    vendorId,
    // discount,
    price,
    // author,
    // publisherId,
    bookIssueDate,
    quantity,
    totalPrice,
    bookComment,
  } = req.body;

  try {
    console.log("Loading................................");
    console.log("print data", req.body);

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid bookId" });
    }

    const PurchaseManagementSchema = new PurchaseManagement({
      bookId,
      vendorId,
      // publisherId,
      // author,
      // discount,
      price,
      bookIssueDate,
      quantity,
      totalPrice,
      bookComment,
    });

    const PurchaseBookData = await PurchaseManagementSchema.save();
    console.log("BookManagement Data", PurchaseBookData);
    return res.status(200).send(PurchaseBookData);
  } catch (error) {
    console.error("Error in BookManagement", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

// export const deletePurchaseBook = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const deletedPurchaseBook = await PurchaseManagement.findByIdAndDelete(id);
//     if (!deletedPurchaseBook) {
//       return res.status(404).json({ message: "Book not found" });
//     }
//     res
//       .status(200)
//       .json({ message: "Book deleted successfully", deletedPurchaseBook });
//   } catch (error) {
//     console.error("Error deleting book:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
export const deletePurchaseBook = async (req, res) => {
  const { id } = req.params;
  console.log(`id---------------->>>>>>>>>>.`, id);

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

// export const updateBook = async (req, res) => {
//   const { id } = req.params;
//   const { bookName, vendorId, price, quantity } = req.body;

//   try {
//     const updatedBook = await BookManagement.findByIdAndUpdate(
//       id,
//       {
//         bookName,
//         vendorId,
//         // publisherId,
//         // author,
//         // discount,
//         price,
//         quantity,
//         // totalPrice,
//         // returnPrice,
//       },
//       { new: true }
//     );

//     if (!updatedBook) {
//       return res.status(404).json({ message: "Book not found" });
//     }

//     res.status(200).json({ message: "Book updated successfully", updatedBook });
//   } catch (error) {
//     console.error("Error updating book:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// export const getBookCount = async (req, res) => {
//   try {
//     const bookCount = await BookManagement.countDocuments({});
//     res.status(200).json({ count: bookCount });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching book count', error });
//   }
// };

//  export const  getBookCount = async (req, res) => {
//   try {
//     const totalBooks = await Book.countDocuments();

//     return res.status(200).json({
//       success: true,
//       message: "Total books count retrieved successfully",
//       totalBooks,
//     });
//   } catch (error) {
//     console.error("Error counting books:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to count books",
//       error: error.message,
//     });
//   }
// };

// export const purchaseManagement = async (req, res) => {
//   try {
//     const purchaseManagementTable = await PurchaseManagement.find()
//       .populate("bookId", "bookName")
//       .populate("user_id", null, null, { strictPopulate: false });

//     console.log("book Management Table", purchaseManagementTable);

//     res.status(200).json({
//       status: true,
//       message: "Book Management Table successful",
//       BookManagement: purchaseManagementTable,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };

export const updatePurchaseBook = async (req, res) => {
  const { id } = req.params;
  console.log(
    `id------------------------------------>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`,
    id
  );

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
          // publisherId: "$publisherDetails.publisherName",
          // author: 1,
          quantity: 1,
          bookComment: 1,
          price: 1,
        },
      },
    ]);

    console.log("Purchase  Management Table", purchaseManagementTable);

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
