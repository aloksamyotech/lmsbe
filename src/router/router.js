import express from "express";
import multer from "multer";
import path from "path";
import { verifyJWT } from "../middleware/auth.js";

import {
  addBook,
  addManyBooks,
  bookManagement,
  deleteBook,
  getBookCount,
  updateBook,
  viewBookUser,
  bookAllotments,
  bookmangmentTable,
  bookData,
} from "../controller/book.management.js";
import {
  addContact,
  deleteContact,
  getContactManagement,
  updateContact,
} from "../controller/contact.management.js";
import {
  submitedBook,
  getsubmitedBook,
  getsubmitedBookinvoice,
  monthwiseSubmission,
} from "../controller/bookSubmission.js";
import {
  addVenderBook,
  deleteVender,
  getVenderCount,
  getVenderManagement,
  updateVender,
  viewVendorDetails,
} from "../controller/vender.management.js";
import {
  addPublications,
  deletePublications,
  editPublications,
  getPublications,
  getPublicationsCount,
} from "../controller/publications.management.js";
import {
  addRegister,
  deleteRegister,
  getMarkFavorite,
  getRegisterStudentCount,
  getSubscription,
  markFavorite,
  markSubscription,
  registerManagement,
  registerMany,
  updateRegister,
} from "../controller/register.management.js";
import {
  bookAllotment,
  bookAllotmentCount,
  bookAllotmentReport,
  fetchBooks,
  findHistoryBookAllotmentUser,
  getAllSubmitBookDetails,
  getBookAllotedCount,
  getBookAllotment,
  getBookAllotmentInvoice,
  getInvoice,
  getSubmitBook,
  getSubmitBookDetails,
  manyBookAllotment,
  newReceiveBook,
  postReceiveBook,
  receiveBook,
  removeReceiveBook,
  submitBook,
  viewBookAllotmentUser,
  trendingBooks,
  monthviseData,
} from "../controller/bookAllotment.js";

import {
  addSubscriptionType,
  deleteSubscriptionType,
  getSubscriptionTypeTable,
  updateSubscriptionType,
} from "../controller/subscriptionType.js";
import {
  deletePurchaseBook,
  getPurchaseInvoice,
  purchaseBook,
  purchaseManagement,
  updatePurchaseBook,
  purchaseReport,
  purchaseMonthviseData,
} from "../controller/purchaseBook.js";
import {
  bookAllotmentHistory,
  getBookAllotmentHistory,
  getBookDetailHistoryStudentId,
} from "../controller/bookallotmentHistory.js";
import {
  createUser,
  adminGetLogo,
  adminProfilePage,
  adminUpdateProfilePage,
  loginAdmin,
  updateEmailContorller,
  updatepassword,
  emailInfo,
} from "../controller/admin.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const router = express.Router();

// -------------------------------------------  Admin  ---------------------
router.post("/user/createUser", createUser);
router.get("/user/adminProfilePage", adminProfilePage);
router.put(
  "/user/adminEditProfilePage/:id",
  verifyJWT,
  upload.single("logo"),
  adminUpdateProfilePage
);
router.get("/user/adminGetLogo", adminGetLogo);
router.post("/user/login", loginAdmin);
router.put("/user/updateEmailContorller", verifyJWT, updateEmailContorller);
router.put("/user/updatepassword", verifyJWT, updatepassword);
router.patch("/user/emailInfo", verifyJWT, emailInfo);

// -----------------    SubscriptionManagement       ---------------------------

router.post("/user/subscriptionType", verifyJWT, addSubscriptionType);

router.get("/user/getSubscriptionType", verifyJWT, getSubscriptionTypeTable);
router.delete(
  "/user/deleteSubscriptionType/:id",
  verifyJWT,
  deleteSubscriptionType
);
router.put("/user/editSubscriptionType/:id", verifyJWT, updateSubscriptionType);

//------------------    BOOK MANAGEMENT ---------------------

router.post("/user/addBook", verifyJWT, upload.single("upload_Book"), addBook);
router.post(
  "/user/addManyBooks",
  verifyJWT,
  upload.single("excelFile"),
  addManyBooks
);
router.get("/user/alotmentsbooks", bookAllotments);
router.get("/user/bookManagement", bookManagement);
router.get("/user/viewBookUser", viewBookUser);
router.delete("/user/deleteBook/:id", verifyJWT, deleteBook);
router.put("/user/editBook/:id", verifyJWT, updateBook);
router.get("/user/getBookCount", verifyJWT, getBookCount);
router.get("/user/bookmangmentTable", verifyJWT, bookmangmentTable);
router.get("/user/bookData/:id", verifyJWT, bookData);

//--------------   book submission  ------------------------
router.post("/user/submitedBook", verifyJWT, submitedBook);
router.get("/user/getsubmitedBook", verifyJWT, getsubmitedBook);
router.get("/user/getsubmitedBookinvoice", verifyJWT, getsubmitedBookinvoice);
router.post("/user/monthwiseSubmission", verifyJWT ,monthwiseSubmission);
//--------------   Vendor Management ------------------------

router.post("/user/addVenderBook", verifyJWT, addVenderBook);
router.get("/user/venderManagement", verifyJWT, getVenderManagement);
router.delete("/user/deleteVender/:id", verifyJWT, deleteVender);
router.put("/user/editVender/:id", verifyJWT, updateVender);
router.get("/user/getVenderCount", verifyJWT, getVenderCount);
router.get("/user/viewVendorDetails/:id", verifyJWT, viewVendorDetails);

//-----------------  Favorite Students ----------------------

router.post("/user/addContact", verifyJWT, addContact);
router.get("/user/contactManagement", getContactManagement);
router.put("/user/editContact/:id", updateContact);
router.delete("/user/deleteContact/:id", verifyJWT, deleteContact);

//------------------ Publications --------------------

router.post("/user/addPublications", verifyJWT, addPublications);
router.get("/user/getPublications", verifyJWT, getPublications);
router.put("/user/editPublications/:id", verifyJWT, editPublications);
router.delete("/user/deletePublications/:id", verifyJWT, deletePublications);
router.get("/user/getPublicationsCount", verifyJWT, getPublicationsCount);

// -----------------  Register Student ---------------------------

router.post(
  "/user/addRegister",
  upload.single("upload_identity"),
  verifyJWT,
  addRegister
);
router.post("/user/registerMany", verifyJWT, registerMany);

router.get("/user/registerManagement", verifyJWT, registerManagement);
router.put("/user/editRegister/:id", verifyJWT, updateRegister);
router.delete("/user/deleteRegister/:id", verifyJWT, deleteRegister);
router.get("/user/getRegisterStudentCount", verifyJWT, getRegisterStudentCount);
router.post("/user/markFavorite/:id", verifyJWT, markFavorite);
router.get("/user/getMarkFavorite", verifyJWT, getMarkFavorite);

router.post("/user/markSubscription/:id", verifyJWT, markSubscription);
router.get("/user/getSubscription", verifyJWT, getSubscription);

//  -------------------   Allotment Management  --------------------------

router.get(
  "/user/findHistoryBookAllotmentUser/:id",
  verifyJWT,
  findHistoryBookAllotmentUser
);
router.post("/user/bookAllotment", verifyJWT, bookAllotment);
router.post("/user/manyBookAllotment", verifyJWT, manyBookAllotment);
router.get("/user/allotmentManagement", verifyJWT, getBookAllotment);
router.post("/user/removeReceiveBook/:id", verifyJWT, removeReceiveBook);
router.post("/user/submitBook/:id", verifyJWT, submitBook);
router.get("/user/getSubmitBook/:selectedStudentId", getSubmitBook);
router.get(
  "/user/getSubmitBookDetails/:selectedStudentId",
  getSubmitBookDetails
);
router.get("/user/getAllSubmitBookDetails", verifyJWT, getAllSubmitBookDetails);
router.get("/user/getInvoice/:id", verifyJWT, getInvoice);
router.get("/user/receiveBook", verifyJWT, receiveBook);
router.post("/user/postReceiveBook", verifyJWT, postReceiveBook);
router.post("/user/newReceiveBook", newReceiveBook);
router.get("/user/viewBookAllotmentUser/:id", verifyJWT, viewBookAllotmentUser);

router.get(
  "/user/bookAllotmentCount/:studentId",
  verifyJWT,
  bookAllotmentCount
);
router.get("/user/getBookAllotedCount", verifyJWT, getBookAllotedCount);
router.get(
  "/user/bookAllotmentReport/:startDate/:endDate",
  verifyJWT,
  bookAllotmentReport
);
router.get("/user/trendingBooks", verifyJWT, trendingBooks);
router.post("/user/monthviseData", verifyJWT, monthviseData);

//  ---------------------- Purchase Book -----------------------

router.post("/user/purchaseBook", verifyJWT, purchaseBook);
router.delete("/user/deletePurchaseBook/:id", verifyJWT, deletePurchaseBook);
router.patch("/user/updatePurchaseBook", verifyJWT, updatePurchaseBook);
router.get("/user/purchaseManagement", verifyJWT, purchaseManagement);
router.get("/user/getPurchaseInvoice/:id", verifyJWT, getPurchaseInvoice);
router.get(
  "/user/purchaseReport/:startDate/:endDate",
  verifyJWT,
  purchaseReport
);
router.post("/user/purchaseMonthviseData", verifyJWT, purchaseMonthviseData);

//      -----------------   Book Allotment History  ---------------
router.post("/user/bookAllotmentHistory", bookAllotmentHistory);
router.get("/user/getBookAllotmentHistory", getBookAllotmentHistory);
router.get(
  "/user/getBookDetailHistoryStudentId/:id",
  verifyJWT,
  getBookDetailHistoryStudentId
);
router.get("/user/getdataalocated", fetchBooks);
router.get("/user/getBookAllotmentInvoice/:id", getBookAllotmentInvoice);

export default router;
