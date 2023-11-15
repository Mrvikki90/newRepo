const multer = require("multer");
const shortid = require("shortid");
const DIR = "./public/";
const path = require("path");

const imageStorage = multer.diskStorage({
  destination: "images",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      return cb(new Error("Please upload a valid image file."));
    }
    cb(null, true);
  },
});

exports.imageUpload = imageUpload;
