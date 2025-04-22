import nodemailer from "nodemailer";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";
import fs from "fs";
import moment from "moment";
import mongoose from "mongoose";
import { BookManagement } from "../models/book.management.js";
import { BookAllotment } from "../models/bookAllotment.js";
import { PurchaseManagement } from "../models/purchase.js";
import { BookFine } from "../models/fine.management.js";
import { RegisterManagement } from "../models/register.management.js";
import { SubscriptionType } from "../models/subscriptionType.model.js";

dotenv.config();
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

const generateInvoicePdf = (invoiceData) => {
  const doc = new PDFDocument({ margin: 40 });
  const filePath = "./invoice.pdf";

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(24).text("SAMYOTECH", { align: "center" });
  doc.fontSize(18).text("Library Management System", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Invoice`);
  doc.text(`Date: ${moment().format("MMMM D, YYYY")}`, { align: "right" });
  doc.moveDown(1.5);

  doc.fontSize(16).text("Book Information");
  doc
    .moveTo(doc.page.margins.left, doc.y + 5)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
    .strokeColor('#CCCCCC')
    .stroke();

  doc.moveDown(2);
  invoiceData.books.forEach((book, i) => {
    doc
      .fontSize(12)
      .text(`Book Name: ${book.bookName}`, { continued: true })
      .text(`Quantity: ${book.quantity}`, {align: "right"});

    doc
      .fontSize(12)
      .text(`Issue Date: ${moment(book.bookIssueDate).format("DD/MM/YY")}`, {
        continued: true,
      })
      .text(
        `Submission Date: ${moment(book.submissionDate).format("DD/MM/YYYY")}`, {align: "right"}
      );

    doc.moveDown(2);
  });

  doc.fontSize(16).text("Student Information");
  doc
    .moveTo(doc.page.margins.left, doc.y + 5)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
    .strokeColor('#CCCCCC') 
    .stroke();

  doc.moveDown(2);

  doc
    .fontSize(12)
    .text(`  Name: ${invoiceData.student.studentName}`, { continued: true })
    .text(`  Phone: ${invoiceData.student.phone}`, {align: "right"});

  doc
    .fontSize(12)
    .text(`   Email: ${invoiceData.student.email}`, { continued: true })
    .text(`Register Date: ${moment(invoiceData.student.registerDate).format("DD/MM/YYYY")}`, {align: "right"});

  doc.moveDown(2);

  doc.fontSize(16).text("Payment Information");
  doc
    .moveTo(doc.page.margins.left, doc.y + 5)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
    .strokeColor('#CCCCCC') 
    .stroke();

  doc.moveDown(2);
  doc.fontSize(12);
  doc
    .fontSize(12)
    .text(`  Subscription Type: ${invoiceData.payment.paymentType}`, {
      continued: true,
    })
    .text(` Amount: ₹${invoiceData.payment.amount.toFixed(2)}`, {align: "right"});
  doc.text(` Total Items: ${invoiceData.totalQuantity}`);
  doc.moveDown(3);

  doc
    .fontSize(16)
    .text(`Total Amount: ₹${invoiceData.totalAmount.toFixed(2)}`, {
      align: "right",
    });

  doc.end();
  return filePath;
};

export const sendRegistrationEmail = async (studentEmail, studentName) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.BREVO_SMTP_FROM,
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
          <p>© ${new Date().getFullYear()} Library Management System</p>
        </div>
      </div>
    `,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
export const sendAllotmentInvoiceEmail = async (allotmentId) => {

  try {
    if (!mongoose.Types.ObjectId.isValid(allotmentId)) {
      throw new Error("Invalid ObjectId format.");
    }

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

    const invoiceData = {
      books: bookAllotment.books.map((book) => ({
        bookName: book.bookId?.bookName || "N/A",
        quantity: book.quantity,
        bookIssueDate: book.bookIssueDate,
        submissionDate: book.submissionDate,
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
    };
    const pdfPath = generateInvoicePdf(invoiceData);
    const mailOptions = {
      from: process.env.BREVO_SMTP_FROM,
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
