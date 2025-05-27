const fs = require("fs");

const userModel = require("./user.model");

const { mailEvents } = require("../../services/mailer");
const { generateHash, compareHash } = require("../../utils/bcrypt");
const { generateOTP, generateRandomToken, signJWT } = require("../../utils/token");
const { generateRTDuration } = require("../../utils/date");
const { generatePassword } = require("../../utils/textUtils");

const changePassword = async (currentUser, payload) => {
  const { oldPassword, password } = payload;
  const user = await userModel.findOne({
    _id: currentUser,
    isEmailVerified: true,
    isBlocked: false,
  });
  if (!user) throw new Error("User not found");
  const isValidOldPw = compareHash(user?.password, oldPassword);
  if (!isValidOldPw) throw new Error("Password didn't match");
  const newPassword = generateHash(password);
  const updatedUser = await userModel.updateOne({ _id: currentUser }, { password: newPassword });
  if (updatedUser?.acknowledged) {
    mailEvents.emit(
      "sendEmail",
      user?.email,
      "Password changed successfully",
      `Your password has changed successfully.`
    );
  }
};

const list = async ({ page = 1, limit = 10, search }) => {
  const query = [];
  // Search / Filter
  if (search?.name) {
    query.push({
      $match: {
        name: new RegExp(search?.name, "gi"),
      },
    });
  }

  // Join collection
  query.push({
    $project: {
      password: 0,
      refresh_token: 0,
      otp: 0,
    },
  });
  // Pagination
  query.push(
    {
      $facet: {
        metadata: [
          {
            $count: "total",
          },
        ],
        data: [
          {
            $skip: (+page - 1) * +limit,
          },
          {
            $limit: +limit,
          },
        ],
      },
    },
    {
      $addFields: {
        total: {
          $arrayElemAt: ["$metadata.total", 0],
        },
      },
    },
    {
      $project: {
        metadata: 0,
      },
    }
  );

  const result = await userModel.aggregate(query, { allowDiskUse: true });

  return {
    data: result[0].data,
    total: result[0].total || 0,
    page: +page,
    limit: +limit,
  };
};

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
  const rt_duration = generateRTDuration();
  await userModel.updateOne(
    { email: user?.email },
    {
      refresh_token: {
        code: rt,
        duration: rt_duration,
      },
    }
  );
  return { access_token: signJWT(data), refresh_token: rt, data: "User logged in successfully" };
};

const register = async (payload) => {
  const { password, ...rest } = payload;
  const existingUser = await userModel.findOne({ email: rest?.email });
  if (existingUser) {
    fs.unlinkSync("public".concat(rest.picture));
    throw new Error("Email is already in use");
  }
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

const refreshToken = async (payload) => {
  const { refresh_token, email } = payload;
  const user = await userModel.findOne({ email, isEmailVerified: true, isBlocked: false });
  if (!user) throw new Error("User not found");
  const { refresh_token: rt_in_db } = user;
  if (rt_in_db?.code !== refresh_token) throw new Error("Token mismatch");
  const currentTime = new Date();
  const databaseTime = new Date(rt_in_db.duration);
  if (currentTime > databaseTime) throw new Error("Token expired");
  const data = {
    name: user?.name,
    email: user?.email,
  };
  return { access_token: signJWT(data), refresh_token };
};

const fpTokenGeneration = async ({ email }) => {
  const user = await userModel.findOne({ email, isEmailVerified: true, isBlocked: false });
  if (!user) throw new Error("User not found");
  const fpToken = generateOTP();
  const updatedUser = await userModel.updateOne({ email }, { otp: fpToken });
  if (updatedUser?.acknowledged) {
    mailEvents.emit(
      "sendEmail",
      email,
      "Forget Password",
      `Your forget password token is ${fpToken}.`
    );
  }
};

const fpTokenVerification = async (payload) => {
  const { email, token, password } = payload;
  const user = await userModel.findOne({ email, isEmailVerified: true, isBlocked: false });
  if (!user) throw new Error("User not found");
  const isValidToken = token === user?.otp;
  if (!isValidToken) throw new Error("Token mismatch");
  const newPassword = generateHash(password);
  const updatedUser = await userModel.updateOne({ email }, { password: newPassword, otp: "" });
  if (updatedUser?.acknowledged) {
    mailEvents.emit(
      "sendEmail",
      email,
      "Password Changed Successfully",
      `Your password has changed successfully.`
    );
  }
};

const resetPassword = async ({ email }) => {
  const user = await userModel.findOne({ email, isEmailVerified: true, isBlocked: false });
  if (!user) throw new Error("User not found");
  const password = generatePassword();
  const newPassword = generateHash(password);
  const updatedUser = await userModel.updateOne({ email }, { password: newPassword });
  if (updatedUser?.acknowledged) {
    mailEvents.emit(
      "sendEmail",
      email,
      "Password Reset Successfully",
      `Your password has changed successfully. Your new password is ${password}`
    );
  }
};

const getProfile = async (currentUser) =>
  userModel.findOne({ _id: currentUser }).select("-password -refresh_token -otp");

const updateProfile = async (currentUser, payload) => {
  const user = await userModel.findOne({
    _id: currentUser,
    isEmailVerified: true,
    isBlocked: false,
  });
  if (!user) throw new Error("User not found");
  const newPayload = { name: payload?.name };
  const updatedUser = await userModel.findOneAndUpdate({ _id: currentUser }, newPayload, {
    new: true,
  });
  return { name: updatedUser?.name };
};

const updateUser = async (id, payload) => {
  const user = await userModel.findOne({
    _id: id,
  });
  if (!user) throw new Error("User not found");
  return userModel
    .findOneAndUpdate({ _id: id }, payload, {
      new: true,
    })
    .select("-password -refresh_token -otp");
};

const addUser = async (payload) => {
  const { name, email, roles = [] } = payload;
  const existingUser = await userModel.findOne({ email });
  if (existingUser) throw new Error("Email is already in use");
  const randomPassword = generatePassword();
  const password = generateHash(randomPassword);
  const otp = generateOTP();
  const userRoles = roles.length === 0 ? ["user"] : roles;
  const userPayload = { name, email, roles: userRoles, password, otp };
  const newUser = await userModel.create(userPayload);
  if (newUser) {
    mailEvents.emit(
      "sendEmail",
      email,
      "Welcome to Proresume AI",
      `Thank you for signing up. Please use this ${otp} code to verify your email.`
    );
  }
  return { data: "User added successfully" };
};

const getById = async (id) =>
  userModel.findOne({ _id: id }).select("-password -refresh_token -otp");

const blockUser = async (id) => {
  const user = await userModel.findOne({ _id: id });
  if (!user) throw new Error("User not found");
  const result = await userModel.updateOne({ _id: id }, { isBlocked: !user?.isBlocked });
  if (result.acknowledged) {
    return { data: `User ${!user?.isBlocked ? "blocked" : "unblocked"} successfully` };
  }
};

const getUserReport = async () => {
  return userModel.find().select("-password -refresh_token -otp");
};

module.exports = {
  addUser,
  blockUser,
  changePassword,
  fpTokenGeneration,
  fpTokenVerification,
  getById,
  getProfile,
  getUserReport,
  list,
  login,
  refreshToken,
  register,
  resendEmailOtp,
  resetPassword,
  updateProfile,
  updateUser,
  verifyEmail,
};
