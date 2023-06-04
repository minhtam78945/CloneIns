const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationDir = "image";
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir);
    }
    cb(null, destinationDir);
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
