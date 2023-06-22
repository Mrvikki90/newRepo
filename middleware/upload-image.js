const multer = require("multer");
var shortid = require("shortid");
const DIR = "./public/";
const path = require("path");

const imageStorage = multer.diskStorage({
  // Destination to store image
  destination: "images",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
    // file.fieldname is name of the field (image)
    // path.extname get the uploaded file extension
  },
});
exports.imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    req.body.filename = file.originalname;
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      // upload only png and jpg format
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});
