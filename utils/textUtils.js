const generatePassword = (length = 12) => {
  /**
   * Generates a random password with the given length.
   * The password contains uppercase, lowercase, digits, and special characters.
   */
  if (length < 8) {
    throw new Error("Password length should be at least 8 characters for security.");
  }
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]<>?/";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return password;
};

module.exports = { generatePassword };
