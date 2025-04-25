const nodemailer = require("nodemailer");
const events = require("events");

const mailEvents = new events.EventEmitter();

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error.toString());
  } else {
    console.log("Email Server is ready to take our messages");
  }
});

const sendEmail = async ({ to, subject, message }) => {
  try {
    return await transporter.sendMail({
      from: `"ProResumeAI" <no-reply@proresume.ai>`,
      to,
      subject,
      html: message,
    });
  } catch (e) {
    console.log("sendEmail err");
  }
};

mailEvents.on("sendEmail", async (to, subject, message) => {
  await sendEmail({ to, subject, message });
});

module.exports = { sendEmail, mailEvents };
