const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './upload/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage }).array('image', 10); // Allow up to 10 files

module.exports = upload;
