const nodemailer = require("nodemailer");
const events = require("events");

const mailEvents = new events.EventEmitter();

const transporter = nodemailer.createTransport({
  // service: process.env.SMTP_SERVICE,
  // auth: {
  //   user: process.env.SMTP_EMAIL,
  //   pass: process.env.SMTP_PASS,
  // },
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "c34bdfc9aa936d",
    pass: "674d4ff162bcd0",
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

mailEvents.on("sendEmail", async (to, subject, message) => {
  await sendEmail({ to, subject, message });
});

module.exports = { sendEmail, mailEvents };
