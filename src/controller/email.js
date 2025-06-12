import nodemailer from "nodemailer";
import dotenv from "dotenv";
import PDFDocument from "pdfkit-table";
import fs from "fs";
import moment from "moment";
import mongoose from "mongoose";
import { BookManagement } from "../models/book.management.js";
import { BookAllotment } from "../models/bookAllotment.js";
import { PurchaseManagement } from "../models/purchase.js";
import { VenderManagement } from "../models/vendor.management.js";
import { RegisterManagement } from "../models/register.management.js";
import { SubscriptionType } from "../models/subscriptionType.model.js";
import { SubmittedBooks } from "../models/SubmittedBooks.js";
import { Admin } from "../models/admin.js";

dotenv.config();
const getCurrencySymbol = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId).select("currencySymbol");
    if (!admin) {
      console.error("Admin not found");
      return null;
    }
    return admin.currencySymbol;
  } catch (error) {
    console.error("Error fetching currency symbol:", error);
    return null;
  }
};
const generateInvoicePdf = (invoiceData) => {
  const doc = new PDFDocument({ margin: 40 });
  const filePath = "./invoice.pdf";

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(24).text(invoiceData.company, { align: "center" });
  doc.fontSize(18).text("Library Management System", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Invoice`);
  doc.text(`Date: ${moment().format("MMMM D, YYYY")}`, { align: "right" });
  doc.moveDown(1);

  doc.fontSize(16).text("Student Information");
  doc
    .moveTo(doc.page.margins.left, doc.y + 5)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
    .strokeColor("#CCCCCC")
    .stroke();

  doc.moveDown(1);
  doc
    .fontSize(12)
    .text(`Name: ${invoiceData.student.studentName}`, { continued: true })
    .text(`Phone: ${invoiceData.student.phone}`, { align: "right" });
  doc.moveDown(0.5);
  doc
    .fontSize(12)
    .text(`Email: ${invoiceData.student.email}`, { continued: true })
    .text(
      `Register Date: ${moment(invoiceData.student.registerDate).format("DD/MM/YYYY")}`,
      { align: "right" }
    );

  doc.moveDown(1);
  doc.fontSize(16).text("Book Information");
  doc
    .moveTo(doc.page.margins.left, doc.y + 5)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
    .strokeColor("#CCCCCC")
    .stroke();

  doc.moveDown(1);

  const bookTable = {
    headers: [
      { label: "S.No", property: "sno", width: 40 },
      { label: "Book Name", property: "bookName", width: 120 },
      { label: "Quantity", property: "quantity", width: 60 },
      { label: "Issue Date", property: "issueDate", width: 90 },
      {
        label: "Expected Submission Date",
        property: "submissionDate",
        width: 80,
      },
      { label: "Subscription Type", property: "paymentType", width: 80 },
      { label: "Amount", property: "amount", width: 60 },
    ],
    datas: invoiceData.books.map((book, index) => ({
      sno: index + 1,
      bookName: book.bookName || "N/A",
      quantity: book.quantity ?? 0,
      issueDate: moment(book.bookIssueDate).format("DD/MM/YY"),
      submissionDate: moment(book.submissionDate).format("DD/MM/YYYY"),
      amount: `${invoiceData.currency}${(book.amount || 0).toFixed(2)}`,
      paymentType: book.SubscriptionType || "N/A",
    })),
  };

  doc.table(bookTable, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
    prepareRow: (row, i) => {
      doc.font("Helvetica").fontSize(12);
      return {
        paddingBottom: 3,
      };
    },
  });

  doc.moveDown(1);

  doc.fontSize(16).text("Payment Information");
  doc
    .moveTo(doc.page.margins.left, doc.y + 5)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
    .strokeColor("#CCCCCC")
    .stroke();

  doc.moveDown(1);
  doc
    .text(`Total Items: ${invoiceData.totalQuantity}`, { continued: true })
    .text(
      `Total Amount: ${invoiceData.currency}${invoiceData.totalAmount.toFixed(2)}`,
      {
        align: "right",
      }
    );
  doc.moveDown(1);

  doc.end();
  return filePath;
};
const generatePurchaseInvoicePdf = (purchaseData) => {
  const doc = new PDFDocument({ margin: 40 });
  const filePath = "./purchase_invoice.pdf";
  const currency = purchaseData.currency || "₹";

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(24).text(purchaseData.company, { align: "center" });
  doc.fontSize(18).text("Library Management System", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Invoice`);
  doc.text(`Date: ${moment().format("MMMM D, YYYY")}`, { align: "right" });
  doc.moveDown(1);

  doc.fontSize(16).text("Vendor Information");
  doc
    .moveTo(doc.page.margins.left, doc.y + 5)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
    .strokeColor("#CCCCCC")
    .stroke();

  doc.moveDown(2);
  doc
    .fontSize(12)
    .text(`Vendor Name: ${purchaseData.vendorName}`, { continued: true })
    .text(`Phone: ${purchaseData.phoneNumber}`, { align: "right" });
  doc.moveDown(0.5);

  doc
    .fontSize(12)
    .text(`Email: ${purchaseData.email}`, { continued: true })
    .text(`Company Name: ${purchaseData.companyName}`, { align: "right" });

  doc.moveDown(2);

  doc.fontSize(16).text("Purchase Items");
  doc
    .moveTo(doc.page.margins.left, doc.y + 5)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
    .strokeColor("#CCCCCC")
    .stroke();

  doc.moveDown(2);
  doc
    .fontSize(12)
    .text(`Book Name: ${purchaseData.bookname}`, { continued: true })
    .text(`Quantity: ${purchaseData.quantity}`, { align: "right" });
  doc.moveDown(1);

  doc
    .fontSize(12)
    .text(`Unit Price: ${currency}${purchaseData.priceperBook.toFixed(2)}`, {
      continued: true,
    })
    .text(
      `Total: ${currency}${(purchaseData.priceperBook * purchaseData.quantity).toFixed(2)}`,
      { align: "right" }
    );
  doc.moveDown(1);

  doc
    .fontSize(12)
    .text(`Advance Payment: ${currency}${purchaseData.advancepayment}`, {
      continued: true,
    })
    .text(`Discount: ${currency}${purchaseData.discount}`, { align: "right" });
  doc.moveDown(1);

  doc.text(
    `Purchase Date: ${new Date(purchaseData.purchesDate).toLocaleDateString()}`
  );
  doc.moveDown(2);

  doc.fontSize(16).text("Total Amount");
  doc
    .moveTo(doc.page.margins.left, doc.y + 5)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
    .strokeColor("#CCCCCC")
    .stroke();

  doc.moveDown(2);
  doc
    .fontSize(12)
    .text(`Total Items: ${purchaseData.quantity}`, { continued: true });
  doc
    .fontSize(16)
    .text(`Total Amount: ${currency}${purchaseData.totalAmount.toFixed(2)}`, {
      align: "right",
    });

  doc.end();
  return filePath;
};
const generateSubmitInvoicePdf = (submissionData) => {
  const doc = new PDFDocument({ margin: 40 });
  const filePath = "./submit_invoice.pdf";
  const currency = submissionData.currency || "₹";

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(24).text(submissionData.company, { align: "center" });
  doc.fontSize(18).text("Library Management System", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text("Invoice");
  doc.text(`Date: ${moment().format("MMMM D, YYYY")}`, { align: "right" });
  doc.moveDown(1.5);

  doc.fontSize(16).text("Book Information");
  doc
    .moveTo(doc.page.margins.left, doc.y + 5)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
    .strokeColor("#CCCCCC")
    .stroke();
  doc.moveDown(2);

  doc
    .fontSize(12)
    .text(`Book Name: ${submissionData.bookName}`, { continued: true })
    .text(`Quantity: ${submissionData.quantity}`, { align: "right" });
  doc.moveDown(1);

  doc
    .fontSize(12)
    .text(
      `Issue Date: ${moment(submissionData.bookIssueDate).format("DD/MM/YYYY")}`,
      { continued: true }
    )
    .text(
      `Submission Date: ${moment(submissionData.submissionDate).format("DD/MM/YYYY")}`,
      { align: "right" }
    );

  doc.moveDown(2);

  doc.fontSize(16).text("Student Information");
  doc
    .moveTo(doc.page.margins.left, doc.y + 5)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
    .strokeColor("#CCCCCC")
    .stroke();
  doc.moveDown(2);

  doc
    .fontSize(12)
    .text(`Name: ${submissionData.studentName}`, { continued: true })
    .text(`Phone: ${submissionData.phone}`, { align: "right" });
  doc.moveDown(1);

  doc
    .fontSize(12)
    .text(`Email: ${submissionData.email}`, { continued: true })
    .text(
      `Register Date: ${moment(submissionData.registerDate).format("DD/MM/YYYY")}`,
      { align: "right" }
    );

  doc.moveDown(2);

  doc.fontSize(16).text("Payment Information");
  doc
    .moveTo(doc.page.margins.left, doc.y + 5)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
    .strokeColor("#CCCCCC")
    .stroke();
  doc.moveDown(2);

  doc
    .fontSize(12)
    .text(`Subscription Type: ${submissionData.paymentType}`, {
      continued: true,
    })
    .text(`Amount: ${currency}${submissionData.amount?.toFixed(2) || "0.00"}`, {
      align: "right",
    });

  doc.moveDown(2);
  doc.fontSize(16).text("Fine Details");
  doc
    .moveTo(doc.page.margins.left, doc.y + 5)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
    .strokeColor("#CCCCCC")
    .stroke();
  doc.moveDown(2);

  if (submissionData.fine && submissionData.fine.length > 0) {
    const fineTable = {
      headers: ["Sno.", "Reason", "Amount"],
      rows: submissionData.fine.map((fine, index) => [
        index + 1,
        fine.reason || "N/A",
        `${currency}${fine.amount?.toFixed(2) || "0.00"}`,
      ]),
    };

    doc.table(fineTable, {
      width: 500,
      padding: 2,
      columnSpacing: 10,
      prepareHeader: () => doc.fontSize(13).fillColor("black"),
      prepareRow: (row, i) =>
        doc.fontSize(12).fillColor(i % 2 ? "black" : "#444444"),
    });
  } else {
    doc.fontSize(12).fillColor("gray").text("No fines applied.");
  }

  const totalFine =
    submissionData.fine?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;

  doc.moveDown(3);
  doc
    .fontSize(16)
    .fillColor("black")
    .text(`Total Item : ${submissionData.quantity} `, { continued: true })
    .text(`Total Amount: ${currency}${submissionData.totalAmount.toFixed(2)}`, {
      align: "right",
    });

  doc.end();
  return filePath;
};
export const sendRegistrationEmail = async (
  studentEmail,
  studentName,
  adminId
) => {
  const admin = await Admin.findById(adminId, "smtpCode Sending_email company");

  if (!admin) {
    throw new Error("Admin not found.");
  }

  const formeamil = admin.Sending_email;
  const company = admin.company;
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: admin.smtpCode,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: formeamil,
      to: studentEmail,
      subject: "Welcome to Our Library!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd;">
          <div style="text-align: center; padding-bottom: 20px;">
            <h1 style="color: #4CAF50;">📚 Welcome to Our Library!</h1>
          </div>
          <p style="font-size: 16px; color: #333;">Hi <strong>${studentName}</strong>,</p>
          <p style="font-size: 15px; color: #333;">
            Thank you for registering with our library. We’re excited to have you on board!
          </p>
          <p style="font-size: 15px; color: #333;">
            You now have access to a wide range of books, study materials, and resources. We hope this will enhance your learning journey.
          </p>
          <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e9; border-left: 4px solid #4CAF50;">
            <p style="margin: 0; font-size: 15px;">If you have any questions, feel free to reach out to us.</p>
          </div>
          <p style="font-size: 15px; margin-top: 30px;">Best regards,<br><strong>Library Team</strong></p>
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #888;">
            <p>© ${new Date().getFullYear()} ${company}Library Management System</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
export const sendAllotmentInvoiceEmail = async (allotmentId, adminId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(allotmentId)) {
      throw new Error("Invalid ObjectId format.");
    }
    const admin = await Admin.findById(adminId, "smtpCode Sending_email company");
    if (!admin) {
      throw new Error("Admin not found.");
    }
    const formeamil = admin.Sending_email;
    const company = admin.company;

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: admin.smtpCode,
      },
    });
    const bookAllotment = await BookAllotment.findById(allotmentId)
      .populate({
        path: "books.bookId",
        model: BookManagement,
      })
      .populate({
        path: "studentId",
        model: RegisterManagement,
      })
      .populate({
        path: "books.paymentType",
        model: SubscriptionType,
        select: "title",
        strictPopulate: false,
      });

    if (!bookAllotment) {
      throw new Error("No data found for this ID.");
    }
    const currency = await getCurrencySymbol(adminId);
    const invoiceData = {
      books: bookAllotment.books.map((book) => ({
        bookName: book.bookId?.bookName || "N/A",
        quantity: book.quantity,
        bookIssueDate: book.bookIssueDate,
        submissionDate: book.submissionDate,
        SubscriptionType: book.paymentType?.title || "N/A",
        amount: book.amount,
      })),
      totalQuantity: bookAllotment.books.reduce(
        (total, book) => total + (book.quantity || 0),
        0
      ),
      student: {
        studentName: bookAllotment.studentId?.student_Name || "N/A",
        phone: bookAllotment.studentId?.mobile_Number || "N/A",
        email: bookAllotment.studentId?.email || "N/A",
        registerDate: bookAllotment.studentId?.registerDate || new Date(),
      },
      payment: {
        paymentType: bookAllotment.books[0]?.paymentType?.title || "N/A",
        amount: bookAllotment.books.reduce(
          (total, book) => total + (book.amount || 0),
          0
        ),
      },
      totalAmount: bookAllotment.books.reduce(
        (total, book) => total + (book.amount || 0) * (book.quantity || 0),
        0
      ),
      currency,
      company,
    };
    const pdfPath = generateInvoicePdf(invoiceData);
    const mailOptions = {
      from: formeamil,
      to: invoiceData.student.email,
      subject: "Library Book Allotment Invoice",
      text: `Hi ${invoiceData.student.studentName},\n\nPlease find your invoice attached.\n\nRegards,\nLibrary Team`,
      attachments: [
        {
          filename: "invoice.pdf",
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    fs.unlinkSync(pdfPath);
  } catch (error) {
    console.error("Error in sendAllotmentInvoiceEmail:", error.message);
    throw error;
  }
};
export const sendpurchesInvoiceEmail = async (purchesId, adminId) => {
  const admin = await Admin.findById(adminId, "smtpCode Sending_email company");
  if (!admin) {
    throw new Error("Admin not found.");
  }
  const formeamil = admin.Sending_email;
  const company = admin.company;
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: admin.smtpCode,
    },
  });
  try {
    const purchase = await PurchaseManagement.findById(purchesId)
      .populate({
        path: "vendorId",
        model: VenderManagement,
      })
      .populate({
        path: "bookId",
        model: BookManagement,
      });

    if (!purchase) {
      console.error("Purchase not found");
      return;
    }
    const currency = await getCurrencySymbol(adminId);
    const purchesData = {
      bookname: purchase.bookId.bookName || "NaN",
      vendorName: purchase.vendorId.vendorName || "NaN",
      companyName: purchase.vendorId.companyName || "NaN",
      phoneNumber: purchase.vendorId.phoneNumber || "NaN",
      email: purchase.vendorId.email || "NaN",
      priceperBook: purchase.price || 0,
      quantity: purchase.quantity || 0,
      purchesDate: purchase.bookIssueDate || "NaN",
      totalAmount: purchase.price * purchase.quantity || 0,
      advancepayment: purchase.advancepayment || 0,
      discount: purchase.discount || 0,
      currency,
      company,
    };
    const pdfPath = generatePurchaseInvoicePdf(purchesData);
    const mailOptions = {
      from: formeamil,
      to: purchase.vendorId?.email,
      subject: "New Purchase Invoice",
      text: ` Dear Vendor,
        Please find attached the invoice for your recent purchase.

        Best regards,
        Library Team`,
      attachments: [
        {
          filename: "invoice.pdf",
          path: pdfPath,
        },
      ],
    };
    await transporter.sendMail(mailOptions);
    fs.unlinkSync(pdfPath);
  } catch (error) {
    console.error("Error sending invoice email", error);
  }
};
export const sendSubmitInvoiceEmail = async (submitId, adminId) => {
  const admin = await Admin.findById(adminId, "smtpCode Sending_email company");
  if (!admin) {
    throw new Error("Admin not found.");
  }
  const formeamil = admin.Sending_email;
  const company = admin.company;
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: admin.smtpCode,
    },
  });
  try {
    const submission = await SubmittedBooks.findById(submitId)
      .populate({
        path: "studentId",
        model: RegisterManagement,
      })
      .populate({
        path: "bookId",
        model: BookManagement,
      })
      .populate({
        path: "paymentType",
        model: SubscriptionType,
      });

    if (!submission) {
      console.error("Submission not found");
      return;
    }
    const fineTotal = Array.isArray(submission.fines)
      ? submission.fines.reduce((sum, f) => sum + (f.amount || 0), 0)
      : 0;

    const baseAmount = (submission.quantity || 0) * (submission.amount || 0);

    const totalAmount = baseAmount + fineTotal;
    const currency = await getCurrencySymbol(adminId);
    const submissionData = {
      studentName: submission.studentId.student_Name || "NaN",
      phone: submission.studentId.mobile_Number || "N/A",
      email: submission.studentId.email || "N/A",
      registerDate: submission.studentId.registerDate || new Date(),
      amount: submission.amount || 0,
      bookName: submission.bookId.bookName || "N/A",
      quantity: submission.quantity || 0,
      bookIssueDate: submission.bookId.bookIssueDate || "N/A",
      submissionDate: submission.createdAt || "N/A",
      fine: submission.fines || [],
      paymentType: submission.paymentType.title || "NaN",
      currency,
      totalAmount,
      company,
    };

    const pdfPath = generateSubmitInvoicePdf(submissionData);
    const mailOptions = {
      from: formeamil,
      to: submission.studentId.email,
      subject: "Book Submission Invoice",
      text: `
    Dear ${submission.studentId.name || "Student"},
    
    Thank you for submitting your book(s) to the library. Please find attached the invoice for your recent submission.    
    Best regards,  
    Library Management  
    `,
      attachments: [
        {
          filename: "invoice.pdf",
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    fs.unlinkSync(pdfPath);
  } catch (error) {
    console.error("Error sending invoice email", error);
  }
};
