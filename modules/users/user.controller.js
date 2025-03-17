const userModel = require("./user.model");
const { sendEmail } = require("../../services/mailer");
const { generateHash } = require("../../utils/bcrypt");

const login = ({ email, password }) => {};

const register = async (payload) => {
  const { password, ...rest } = payload;
  const existingUser = await userModel.findOne({ email: rest?.email });
  if (existingUser) throw new Error("Email is already in use");
  rest.password = generateHash(password);
  const newUser = await userModel.create(rest);
  if (newUser) {
    await sendEmail({
      to: rest?.email,
      subject: "Welcome to Proresume AI",
      message: "Thank you for signing up",
    });
  }
};

module.exports = { login, register };
