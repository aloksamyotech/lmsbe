import { BookManagement } from "../models/book.management.js";
export const addBook = async (req, res) => {
  const {
    bookName,
    title,
    author,
    bookIssueDate,
    publisherName,
    bookDistribution,
  } = req.body;

  let upload_Book = req.file ? req.file.path : ""; 

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

export const addManyBooks = async (req, res) => {
  const data = req?.body;

  try {
    const addManyBooks = data.map((book) => {
      const {
        "Book Name": bookName,
        "Book Title": title,
        "Author Name": author,
        "Publisher Name": publisherName,
        "Upload Book Image": upload_Book,
        "Book Description": bookDescription,
      } = book;
      let uploadBookPath = req.file ? req.file.path : upload_Book;
 
      return {
        bookName,
        title,
        author,
        publisherName,
        upload_Book: uploadBookPath,
        bookDescription,
      };
    }); 
    const savedData = await BookManagement.insertMany(addManyBooks); 

    return res.status(200).send(savedData);
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
export const viewBookUser = async (req, res) => {
  const { id } = req.params;
  console.log("ID---------", id);

  try {
    const user = await RegisterManagement.findById(id, { active: false });
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
