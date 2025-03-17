const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email Server is ready to take our messages");
  }
});
const sendEmail = async ({ to, subject, message }) => {
  return await transporter.sendMail({
    from: `"ProResumeAI" <no-reply@proresume.ai>`,
    to,
    subject,
    html: message,
  });
};

module.exports = { sendEmail };
