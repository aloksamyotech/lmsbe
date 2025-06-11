import { BookManagement } from "../models/book.management.js";
import {PublicationsManagement} from '../models/publications.management.js'; 
export const addBook = async (req, res) => {
  const {
    bookName,
    title,
    author,
    bookIssueDate,
    publisher,
    bookDistribution,
  } = req.body;
  
  let upload_Book = req.file ? req.file.path : "";

  try {
    const existingBook = await BookManagement.findOne({
      bookName: { $regex: new RegExp(`^${bookName}$`, "i") },
      author: { $regex: new RegExp(`^${author}$`, "i") },
    });

    if (existingBook) {
      return res.status(400).send({
        message: `Book "${bookName}" by author "${author}" already exists.`,
      });
    }

    const newBook = new BookManagement({
      bookName,
      title,
      author,
      bookIssueDate,
      publisher,
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

export const addManyBooks = async (req, res) => {
  const data = req?.body;

  try {
    const publisherNames = [...new Set(data.map(b => b["Publisher Name"].trim()))];

    const existingPublishers = await PublicationsManagement.find({
      publisherName: { $in: publisherNames }
    });

    const publisherMap = {};
    existingPublishers.forEach(pub => {
      publisherMap[pub.publisherName.toLowerCase()] = pub._id;
    });

    for (const pubName of publisherNames) {
      if (!publisherMap[pubName.toLowerCase()]) {
        const newPub = new PublicationsManagement({ publisherName: pubName });
        const savedPub = await newPub.save();
        publisherMap[pubName.toLowerCase()] = savedPub._id;
      }
    }

    const bookAuthorPairs = data.map(book => ({
      bookName: book["Book Name"],
      author: book["Author Name"]
    }));

    const existingBooks = await BookManagement.find({
      $or: bookAuthorPairs.map(({ bookName, author }) => ({
        bookName,
        author,
      })),
    });

    const existingSet = new Set(
      existingBooks.map(b => `${b.bookName.toLowerCase()}|${b.author.toLowerCase()}`)
    );

    const filteredData = data.filter(book => {
      const key = `${book["Book Name"].toLowerCase()}|${book["Author Name"].toLowerCase()}`;
      return !existingSet.has(key);
    });

    const booksToInsert = filteredData.map(book => {
      const {
        "Book Name": bookName,
        "Book Title": title,
        "Author Name": author,
        "Publisher Name": publisherName,
        "Upload Book Image": upload_Book,
        "Book Description": bookDescription,
      } = book;

      return {
        bookName,
        title,
        author,
        publisher: publisherMap[publisherName.trim().toLowerCase()], // Use the _id here
        upload_Book,
        bookDescription,
      };
    });

    const savedData = await BookManagement.insertMany(booksToInsert);

    return res.status(200).send({
      inserted: savedData,
      skipped: data.length - savedData.length,
      message: `${savedData.length} books added. ${data.length - savedData.length} duplicate entries skipped.`,
    });
  } catch (error) {
    console.error("Error in Book Management Bulk Insert", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const bookManagement = async (req, res) => {
  try {
    const bookManagementTable = await BookManagement.aggregate([
      {
        $lookup: {
          from: "purchasemanagements",
          localField: "_id",
          foreignField: "bookId",
          as: "purchaseDetails",
        },
      },
      {
        $unwind: {
          path: "$purchaseDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          bookName: 1,
          title: 1,
          bookIssueDate: 1,
          author: 1,
          publisherName: 1,
          upload_Book: 1,
          active: 1,
          bookDistribution: 1,

          quantity: "$purchaseDetails.quantity",
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    res.status(200).json({
      status: true,
      message: "Book Management Table successful",
      BookManagement: bookManagementTable,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
// export const bookmangmentTable = async (req, res) => {
//   try {
//     const books = await BookManagement.find();

//     if (!books || books.length === 0) {
//       return res.status(404).json({
//         status: false,
//         message: "No books found",
//       });
//     }
//     res.status(200).json({
//       status: true,
//       message: "Books retrieved successfully",
//       data: books,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
export const bookmangmentTable = async (req, res) => {
  try {
    const books = await BookManagement.find().populate('publisher');

    if (!books || books.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No books found",
      });
    }
    res.status(200).json({
      status: true,
      message: "Books retrieved successfully",
      data: books,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const bookAllotments = async (req, res) => {
  try {
    const bookManagementTable = await BookManagement.aggregate([
      {
        $lookup: {
          from: "purchasemanagements",
          localField: "_id",
          foreignField: "bookId",
          as: "purchaseDetails",
        },
      },
      {
        $unwind: {
          path: "$purchaseDetails",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          bookName: 1,
          title: 1,
          bookIssueDate: 1,
          author: 1,
          publisherName: 1,
          upload_Book: 1,
          active: 1,
          bookDistribution: 1,

          quantity: "$purchaseDetails.quantity",
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    res.status(200).json({
      status: true,
      message: "Book Management Table successful",
      BookManagement: bookManagementTable,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBook = await BookManagement.findByIdAndDelete(id, {
      active: false,
    });

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
    publisher,
    bookDistribution,
    description
  } = req.body;
  
  const updatedFields = {
    bookName,
    title,
    author,
    bookIssueDate,
    publisher: publisher,
    bookDistribution,
    description,
  };

  if (req.file) {
    updatedFields.upload_Book = req.file.path;
  }

  try {
    const updatedBook = await BookManagement.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({ message: 'Book updated successfully', updatedBook });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Internal Server Error' });
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
export const viewBookUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await RegisterManagement.findById(id, { active: false });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bookManagements = await BookManagement.find({ user_id: id });

    res.status(200).json({
      user,
      bookManagements,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const bookData = async (req, res) => {
  const { id } = req.params;
  try {
    const book = await BookManagement.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({
      message: "Book data fetched successfully",
      data: book,
    });
  } catch (error) {
    console.error("Error fetching book data:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
