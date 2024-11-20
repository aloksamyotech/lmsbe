import express from "express";
import multer from "multer";
import path from "path";

// import { registerUser, loginUser, report, getAllUsers } from "../controller/User.js";
// import { createPurchase, purchaseTable } from "../controller/purchase.js";
// import { transaction } from "../controller/transaction.js";
// import { referral } from "../controller/referral.js";
// import { helpSupport, getHelpSupport, newHelpSupport } from "../controller/helpSupport.js";
// import { findToken } from "../controller/token.js";
// import {  getNotification, newNotification, notification,} from "../controller/notification.Admin.js";
// import { getUserList } from "../controller/userList.js";
// import { getNotificationUser, postNotificationUser } from "../controller/notification.user.js";
// import {userHelpSupport } from "../controller/userHelpSupport.js";
// import { getUserDetails } from "../controller/User.js";
import {
  addBook,
  bookManagement,
  deleteBook,
  updateBook,
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
  getVenderManagement,
  updateVender,
} from "../controller/vender.management.js";
// import { BookManagement } from "../models/book.management.js";
import {
  addPublications,
  deletePublications,
  editPublications,
  getPublications,
} from "../controller/publications.management.js";
import {
  addRegister,
  deleteRegister,
  registerManagement,
  updateRegister,
} from "../controller/register.management.js";
import {
  bookAllotment,
  deleteAllotmentBook,
  editBookAllotment,
  findHistoryBookAllotmentUser,
  getBookAllotment,
  viewBookAllotmentUser,
} from "../controller/bookAllotment.js";

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

//------------------    BOOK MANAGEMENT ---------------------

router.post("/user/addBook", addBook);
router.get("/user/bookManagement", bookManagement);
router.delete("/user/deleteBook/:id", deleteBook);
router.put("/user/editBook/:id", updateBook);

//--------------   Vender Management ------------------------

router.post("/user/addVenderBook", addVenderBook);
router.get("/user/venderManagement", getVenderManagement);
router.delete("/user/deleteVender/:id", deleteVender);
router.put("/user/editVender/:id", updateVender);

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

// -----------------  Register Student ---------------------------

router.post("/user/addRegister", upload.single("upload_identity"), addRegister);
router.get("/user/registerManagement", registerManagement);
router.put("/user/editRegister/:id", updateRegister);
router.delete("/user/deleteRegister/:id", deleteRegister);
// router.get("/user/getAllUsers",getAllUsers)

//  -------------------   Allotment Management  --------------------------

router.get(
  "/user/findHistoryBookAllotmentUser/:id",
  findHistoryBookAllotmentUser
);
router.post("/user/bookAllotment", bookAllotment);
router.get("/user/allotmentManagement", getBookAllotment);
router.put("/user/editBookAllotment/:id", editBookAllotment);
router.get("/user/viewBookAllotmentUser/:id", viewBookAllotmentUser);
router.delete("/user/deleteAllotmentBook/:id", deleteAllotmentBook);

//   ------------------    Fine    ----------------------

// router.post("/user/abmin")

//   ---------------------   View  --------------------------------

// router.get("/user/viewUser",viewuser);

//  ---------------------------------------------------------------------------

// router.post("/purchase", createPurchase);
// router.get("/purchase/table", purchaseTable);
// router.post("/transaction",transaction);
// router.post("/user/referral", referral);
// router.post("/user/helpSupport",helpSupport);
// router.post("/user/getHelpSupport",getHelpSupport);
// router.get("/user/newHelpSupport",newHelpSupport);
// router.post("/user/postNotificationUser",postNotificationUser);
// router.get("/user/getNotificationUser",getNotificationUser);

// router.get("/user/report", report);

// Route to get user details by user ID
// router.get("/user/getUserDetails", getUserDetails);

//  Admin Router

// router.post("/admin/notification",notification);
// router.post("/admin/getNotification",getNotification);
// router.get("/admin/newNotification",newNotification);
// router.get("/admin/userHelpSupport",userHelpSupport)
// router.get("/admin/getUserList",getUserList)

// router.get("/token", findToken);

export default router;
