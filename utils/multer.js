const multer = require("multer");

const storage = (storageLocation = "public/users") =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, storageLocation);
    },
    filename: (req, file, cb) => {
      cb(null, String(Date.now()).concat("-", file.originalname));
    },
  });

const upload = (storage, fileSize = 1000000) =>
  multer({
    storage,
    limits: {
      fileSize, // 1MB
    },
    // Add file filters (png, jpg, jpeg)
  });

module.exports = { storage, upload, multer };
