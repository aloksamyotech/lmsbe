import { BookManagement } from "../models/book.management.js";

// export const addBook = async (req, res) => {
//   const {
//     bookName,
//     title,
//     author,
//     bookIssueDate,
//     publisherName,

//     // totalPrice,
//     // returnPrice,
//     // quantity,
//     bookDistribution,
//   } = req.body;
//   const upload_identity = req.file ? req.file.path : "";

//   try {

//     const BookManagementSchema = new BookManagement({
//       bookName,
//       title,
//       author,
//       bookIssueDate,
//       publisherName,
//       upload_identity ,
//       // quantity,
//       // totalPrice,
//       // returnPrice,
//       bookDistribution,
//     });

//     const BookManagementData = await BookManagementSchema.save();

//     return res.status(200).send(BookManagementData);
//   } catch (error) {
//     console.error("Error in BookManagement", error);
//     return res.status(500).send({ message: "Internal Server Error" });
//   }
// };

// Set up multer storage
export const addBook = async (req, res) => {
  const {
    bookName,
    title,
    author,
    bookIssueDate,
    publisherName,
    bookDistribution,
  } = req.body;

  console.log(`req.file`, req.file);

  let upload_Book = req.file ? req.file.path : "";
  console.log(`upload_Book--->>>`, upload_Book);

  try {
    const newBook = new BookManagement({
      bookName,
      title,
      author,
      bookIssueDate,
      publisherName,
      upload_Book,
      bookDistribution,
    });

    const savedBook = await newBook.save();
    return res.status(200).send(savedBook);
  } catch (error) {
    console.error("Error saving book:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const bookManagement = async (req, res) => {
  try {
    const bookManagementTable = await BookManagement.find().populate(
      "user_id",
      null,
      null,
      { strictPopulate: false },
      { active: false },
      { $sort: { _id: -1 } },
    );

    res.status(200).json({
      status: true,
      message: " Book Management Table successful",
      BookManagement: bookManagementTable,
    });
  } catch (error) {
    res.status(500).json({ message: " Internal server error", error });
  }
};

export const deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBook = await BookManagement.findByIdAndDelete(
      id,
      { active: false },
    );
    
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
    title,
    author,
    bookIssueDate,
    publisherName,
    // totalPrice,
    // returnPrice,
    // quantity,
    bookDistribution,
  } = req.body;

  try {
    const updatedBook = await BookManagement.findByIdAndUpdate(
      id, 
      {
        bookName,
        title,
        author,
        bookIssueDate,
        publisherName,
        // totalPrice,
        // returnPrice,
        // quantity,
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

export const getBookCount = async (req, res) => {
  try {
    const bookCount = await BookManagement.countDocuments({});
    res.status(200).json({ count: bookCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching book count", error });
  }
};

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

export const viewBookUser = async (req, res) => {
  const { id } = req.params;
  console.log("ID---------", id);

  try {
    const user = await RegisterManagement.findById(id
      , { active: false },
    );
    console.log("user", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bookManagements = await BookManagement.find({ user_id: id });
    console.log("viewBookUser", bookManagements);

    res.status(200).json({
      user,
      bookManagements,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
