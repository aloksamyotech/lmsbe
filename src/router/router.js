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
  deleteAllotmentBook,
  editBookAllotment,
  findHistoryBookAllotmentUser,
  getAllSubmitBookDetails,
  getBookAllotedCount,
  getBookAllotment,
  getBookAllotmentById,
  getBookMonthVise,
  getInvoice,
  getReceiveBook,
  getSubmitBook,
  getSubmitBookDetails,
  manyBookAllotment,
  newReceiveBook,
  postReceiveBook,
  reBookAllotment,
  receiveBook,
  removeReceiveBook,
  submitBook,
  viewBookAllotmentUser,
} from "../controller/bookAllotment.js";

import {
  addSubscriptionType,
  deleteSubscriptionType,
  getSubscriptionTypeTable,
  updateSubscriptionType,
} from "../controller/subscriptionType.js";
import {
  addFineBook,
  findByStudentId,
  getAllFineBooks,
  getFineBook,
} from "../controller/fine.management.js";
import {
  deletePurchaseBook,
  getPurchaseInvoice,
  purchaseBook,
  purchaseManagement,
  updatePurchaseBook,
} from "../controller/purchaseBook.js";
import {
  bookAllotmentHistory,
  getBookAllotmentHistory,
  getBookDetailHistoryStudentId,
} from "../controller/bookallotmentHistory.js";
import  { adminGetLogo, adminProfilePage, adminUpdateProfilePage, loginAdmin } from "../controller/admin.js";
 
  
 

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

router.get("/user/adminProfilePage",adminProfilePage);
router.put("/user/adminEditProfilePage/:id",upload.single("logo"),adminUpdateProfilePage);
router.get("/user/adminGetLogo",adminGetLogo); 
router.post("/user/login",loginAdmin); 


//   -----------------------------  LMS -----------------------------

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

router.post("/user/markSubscription/:id", markSubscription);
router.get("/user/getSubscription", getSubscription);

// router.get("/user/getAllUsers",getAllUsers)

//  -------------------   Allotment Management  --------------------------

router.get(
  "/user/findHistoryBookAllotmentUser/:id",
  findHistoryBookAllotmentUser
);
router.post("/user/bookAllotment", bookAllotment);
router.post("/user/manyBookAllotment", manyBookAllotment);
router.get("/user/allotmentManagement", getBookAllotment);
router.get("/user/getReceiveBook", getReceiveBook); //-------------------------------
router.post("/user/removeReceiveBook/:id", removeReceiveBook); //----------------------
router.post("/user/submitBook/:id", submitBook);
router.get("/user/getSubmitBook/:selectedStudentId", getSubmitBook);
router.get(
  "/user/getSubmitBookDetails/:selectedStudentId",
  getSubmitBookDetails
);
router.get("/user/getAllSubmitBookDetails", getAllSubmitBookDetails);
// router.post("/user/payFine/:id",payFine)  //>>>>>>>>>>>>>>>>...........<<<<<<<<<<
// router.get("/user/fineBook/:selectedStudentId",fineBook)  //>>>>>>>>>>>>>>>>...........<<<<<<<<<<
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

//  ----------------------   Fine    ----------------------
// router.post("/user/payFine/:id",payFine)
router.post("/user/addFineBook", addFineBook);
router.get("/user/getFineBook/:studentId", getFineBook);
router.get("/user/getAllFineBooks", getAllFineBooks);
router.get("/user/findByStudentId", findByStudentId);

// router.get("/user/fineBook/:selectedStudentId",fineBook)

//  ---------------------- Purchase Book -----------------------

router.post("/user/purchaseBook", purchaseBook);
router.delete("/user/deletePurchaseBook/:id", deletePurchaseBook);
router.put("/user/updatePurchaseBook", updatePurchaseBook);
router.get("/user/purchaseManagement", purchaseManagement);
router.get("/user/getPurchaseInvoice/:id", getPurchaseInvoice);

//      -----------------   Book Allotment History  ---------------
router.post("/user/bookAllotmentHistory", bookAllotmentHistory);
router.get("/user/getBookAllotmentHistory", getBookAllotmentHistory);
router.get(
  "/user/getBookDetailHistoryStudentId/:id",
  getBookDetailHistoryStudentId
);

export default router;
