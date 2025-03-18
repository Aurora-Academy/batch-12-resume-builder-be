const crypto = require("crypto");
const JWT = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const generateOTP = (digits = 6) => crypto.randomInt(100000, 999999);

const signJWT = (data) =>
  JWT.sign(
    {
      data,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_DURATION }
  );

const verifyJWT = () => {};

const generateRandomToken = () => uuidv4();

module.exports = { generateOTP, generateRandomToken, signJWT };
