const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      text: message
    });

    console.log("Email sent successfully");

  } catch (error) {
    console.log("Email error:", error.message);
  }
};

module.exports = { sendEmail };