const userModel = require("./user.model");
const { mailEvents } = require("../../services/mailer");
const { generateHash, compareHash } = require("../../utils/bcrypt");
const { generateOTP, generateRandomToken, signJWT } = require("../../utils/token");

const login = async (payload) => {
  const { email, password } = payload;
  const user = await userModel.findOne({ email });
  if (!user) throw new Error("User not found");
  if (user?.isBlocked) throw new Error("User blocked. Contact Admin for support");
  if (!user?.isEmailVerified) throw new Error("Email verification pending.");
  const isValidPassword = compareHash(user?.password, password);
  if (!isValidPassword) throw new Error("Email or Password mismatch");
  const data = {
    name: user?.name,
    email: user?.email,
  };
  const rt = generateRandomToken();
  await userModel.updateOne({ email: user?.email }, { refresh_token: rt });
  return { access_token: signJWT(data), refresh_token: rt, data: "User logged in successfully" };
};

const register = async (payload) => {
  const { password, ...rest } = payload;
  const existingUser = await userModel.findOne({ email: rest?.email });
  if (existingUser) throw new Error("Email is already in use");
  rest.password = generateHash(password);
  rest.otp = generateOTP();
  const newUser = await userModel.create(rest);
  if (newUser) {
    mailEvents.emit(
      "sendEmail",
      rest?.email,
      "Welcome to Proresume AI",
      `Thank you for signing up. Please use this ${rest.otp} code to verify your email.`
    );
  }
};

const verifyEmail = async (payload) => {
  const { email, otp } = payload;
  if (otp.length !== 6) throw new Error("OTP must be 6 digits");
  const user = await userModel.findOne({ email, isEmailVerified: false });
  if (!user) throw new Error("User not found");
  const isValidOTP = user.otp === String(otp);
  if (!isValidOTP) throw new Error("OTP mismatch");
  const userUpdate = await userModel.updateOne({ email }, { isEmailVerified: true, otp: "" });
  if (userUpdate) {
    mailEvents.emit(
      "sendEmail",
      email,
      "Email Verified Successfully",
      `Thank you for verifying your email.`
    );
  }
};

const resendEmailOtp = async (payload) => {
  const { email } = payload;
  const user = await userModel.findOne({ email, isEmailVerified: false });
  if (!user) throw new Error("User not found");
  const otp = generateOTP();
  const userUpdate = await userModel.updateOne({ email }, { otp });
  if (userUpdate) {
    mailEvents.emit(
      "sendEmail",
      email,
      `Your OTP code for email verification is ${otp}`,
      `Please use this ${otp} code to verify your email.`
    );
  }
};

module.exports = { login, register, resendEmailOtp, verifyEmail };
