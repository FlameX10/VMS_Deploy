import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // important
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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
