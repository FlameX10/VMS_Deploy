// config/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// check connection
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Mail server error:", error);
  } else {
    console.log("✅ Mail server is ready");
  }
});
