const multer = require('multer');
const crypto = require('crypto-js');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload/img/');
  },
  filename: function (req, file, cb) {
    const randomString = crypto.lib.WordArray.random(3).toString(
      crypto.enc.Hex
    ); // Generates a 6-character random string
    const ext = path.extname(file.originalname);
    cb(null, randomString + '-' + Date.now() + ext);
  },
});

const uploadAll = multer({ storage: storage });

module.exports = uploadAll;
