import { BookManagement } from "../models/book.management.js";

export const addBook = async (req, res) => {
  const {
    bookName,
    bookTitle,
    authorName,
    bookIssueDate,
    publisherName,
    totalPrice,
    returnPrice,
    quantity,
    bookDistribution,
  } = req.body;

  try {
    console.log("Loading................................");
    console.log("print data", req.body);

    const BookManagementSchema = new BookManagement({
      bookName,
      bookTitle,
      authorName,
      bookIssueDate,
      publisherName,
      quantity,
      totalPrice,
      returnPrice,
      bookDistribution,
    });

    const BookManagementData = await BookManagementSchema.save();
    console.log("BookManagement Data", BookManagementData);
    return res.status(200).send(BookManagementData);
  } catch (error) {
    console.error("Error in BookManagement", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const bookManagement = async (req, res) => {
  try {
    const bookManagementTable = await BookManagement.find().populate(
      "user_id",
      null,
      null,
      { strictPopulate: false }
    );
    console.log("book Management Table", bookManagementTable);
    res.status(200).json({
      status: true,
      message: " Book Management Table successful",
      BookManagement: bookManagementTable,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: " Internal server error", error });
  }
};

export const deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBook = await BookManagement.findByIdAndDelete(id);
    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ message: "Book deleted successfully", deletedBook });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateBook = async (req, res) => {
  const { id } = req.params;
  const {
    bookName,
    bookTitle,
    authorName,
    bookIssueDate,
    publisherName,
    totalPrice,
    returnPrice,
    quantity,
    bookDistribution,
  } = req.body;

  try {
    const updatedBook = await BookManagement.findByIdAndUpdate(
      id,
      {
        bookName,
        bookTitle,
        authorName,
        bookIssueDate,
        publisherName,
        totalPrice,
        returnPrice,
        quantity,
        bookDistribution,
      },
      { new: true }
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
