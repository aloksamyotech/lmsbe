import express from "express";
import multer from "multer";
import path from "path";

import {
  addBook,
  addManyBooks,
  bookManagement,
  deleteBook,
  getBookCount,
  updateBook,
  viewBookUser,
} from "../controller/book.management.js";
import {
  addContact,
  deleteContact,
  getContactManagement,
  updateContact,
} from "../controller/contact.management.js";

import {
  addVenderBook,
  deleteVender,
  getVenderCount,
  getVenderManagement,
  updateVender,
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
  getLogo,
  getMarkFavorite,
  getRegisterStudentCount,
  getSubscription,
  markFavorite,
  markSubscription,
  profilePage,
  registerManagement,
  registerMany,
  updateProfilePage,
  updateRegister,
} from "../controller/register.management.js";
import {
  bookAllotment,
  bookAllotmentCount,
  bookAllotmentReport,
  deleteAllotmentBook,
  editBookAllotment,
  findHistoryBookAllotmentUser,
  getBookAllotedCount,
  getBookAllotment,
  getBookAllotmentById,
  getBookMonthVise,
  getInvoice,
  getReceiveBook,
  getSubmitBook,
  getSubmitBookDetails,
  newReceiveBook,
  postReceiveBook,
  reBookAllotment,
  receiveBook,
  removeReceiveBook,
  submitBook,
  viewBookAllotmentUser,
} from "../controller/bookAllotment.js";
import {
  deletePurchaseBook,
  getPurchaseInvoice,
  purchaseBook,
  purchaseManagement,
  updatePurchaseBook,
} from "../controller/purchaseBook.js";
import {
  addSubscriptionType,
  deleteSubscriptionType,
  getSubscriptionTypeTable,
  updateSubscriptionType,
} from "../controller/subscriptionType.js";

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

//               -----------------------------  LMS -----------------------------

// router.post("/user/register",registerUser);
// router.post("/user/login",loginUser);
// router.get("/user/getAllUsers",getAllUsers)

// -----------------    SubscriptionManagement       ---------------------------

router.post("/user/subscriptionType", addSubscriptionType);
router.get("/user/getSubscriptionType", getSubscriptionTypeTable);
router.delete("/user/deleteSubscriptionType/:id", deleteSubscriptionType);
router.put("/user/editSubscriptionType/:id", updateSubscriptionType);

//------------------    BOOK MANAGEMENT ---------------------

router.post("/user/addBook", upload.single("upload_Book"), addBook);
router.post("/user/addManyBooks", upload.single("excelFile"), addManyBooks);

router.get("/user/bookManagement", bookManagement);
router.get("/user/viewBookUser", viewBookUser);
router.delete("/user/deleteBook/:id", deleteBook);
router.put("/user/editBook/:id", updateBook);
router.get("/user/getBookCount", getBookCount);

//--------------   Vendor Management ------------------------

router.post("/user/addVenderBook", addVenderBook);
router.get("/user/venderManagement", getVenderManagement);
router.delete("/user/deleteVender/:id", deleteVender);
router.put("/user/editVender/:id", updateVender);
router.get("/user/getVenderCount", getVenderCount);

//-----------------  Contact ----------------------

router.post("/user/addContact", addContact);
router.get("/user/contactManagement", getContactManagement);
router.put("/user/editContact/:id", updateContact);
router.delete("/user/deleteContact/:id", deleteContact);

//------------------ Publications --------------------

router.post("/user/addPublications", addPublications);
router.get("/user/getPublications", getPublications);
router.put("/user/editPublications/:id", editPublications);
router.delete("/user/deletePublications/:id", deletePublications);
router.get("/user/getPublicationsCount", getPublicationsCount);

// -----------------  Register Student ---------------------------

router.post("/user/addRegister", upload.single("upload_identity"), addRegister);
router.post("/user/registerMany", registerMany);

// router.post("/user/upload",uploadFiles);
router.get("/user/registerManagement", registerManagement);
router.put("/user/editRegister/:id", updateRegister);
router.delete("/user/deleteRegister/:id", deleteRegister);
router.get("/user/getRegisterStudentCount", getRegisterStudentCount);
router.post("/user/markFavorite/:id", markFavorite);
router.get("/user/getMarkFavorite", getMarkFavorite);
router.get("/user/profilePage", profilePage);
router.put(
  "/user/editProfilePage/:id",
  upload.single("logo"),
  updateProfilePage
);
router.get("/user/getLogo", getLogo);

router.post("/user/markSubscription/:id", markSubscription);
router.get("/user/getSubscription", getSubscription);

// router.get("/user/getAllUsers",getAllUsers)

//  -------------------   Allotment Management  --------------------------

router.get(
  "/user/findHistoryBookAllotmentUser/:id",
  findHistoryBookAllotmentUser
);
router.post("/user/bookAllotment", bookAllotment);
router.get("/user/allotmentManagement", getBookAllotment);
router.get("/user/getReceiveBook", getReceiveBook);
router.post("/user/removeReceiveBook/:id", removeReceiveBook);
router.post("/user/submitBook/:id", submitBook);
router.get("/user/getSubmitBook/:selectedStudentId", getSubmitBook);
router.get(
  "/user/getSubmitBookDetails/:selectedStudentId",
  getSubmitBookDetails
);
router.get("/user/getInvoice/:id", getInvoice);

router.get("/user/receiveBook", receiveBook);
router.post("/user/postReceiveBook", postReceiveBook);
router.post("/user/newReceiveBook", newReceiveBook);
router.get("/user/reBookAllotment", reBookAllotment);
router.put("/user/editBookAllotment/:id", editBookAllotment);
router.get("/user/getBookAllotmentById/:id", getBookAllotmentById);
router.get("/user/viewBookAllotmentUser/:id", viewBookAllotmentUser);
router.delete("/user/deleteAllotmentBook/:id", deleteAllotmentBook);
router.get("/user/bookAllotmentCount/:studentId", bookAllotmentCount);
router.get("/user/getBookMonthVise", getBookMonthVise);
router.get("/user/getBookAllotedCount", getBookAllotedCount);
router.get(
  "/user/bookAllotmentReport/:startDate/:endDate",
  bookAllotmentReport
);

//  ----------------------   Purchase    ----------------------
// purchaseBook
router.post("/user/purchaseBook", purchaseBook);
router.get("/user/purchaseManagement", purchaseManagement);
router.get("/user/getPurchaseInvoice/:id", getPurchaseInvoice);
router.delete("/user/deletePurchaseBook/:id", deletePurchaseBook);
router.put("/user/editPurchaseBook/:id", updatePurchaseBook);
// router.get('/user/getBookCount',getBookCount);

export default router;
