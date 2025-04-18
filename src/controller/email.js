import nodemailer from "nodemailer";
import dotenv  from "dotenv";

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
export const sendAlloteinvoiceEmail = async (req, res) => {};
