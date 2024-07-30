const express = require('express');
const router = express.Router();
const {
  getAllMessages,
  saveMessage,
  UploadImage,
} = require('../controller/index');
const upload = require('../middleware/image');

//chat
router.get('/getmessages', getAllMessages);

// Endpoint POST สำหรับการส่งข้อความ
router.post('/postmessages', saveMessage);

// router.post('/uploadImages', upload.array('image', 10), async (req, res) => {
//   try {
//     const { messageId } = req.body; // Extract message ID from request body
//     const files = req.files; // Extract files from request

//     if (!files || files.length === 0) {
//       return res.status(400).json({ error: 'No files provided' });
//     }

//     // Call function to handle image upload and update the message
//     await UploadImage(files, messageId, req.app.get('io'));

//     res.status(200).json({ message: 'Images uploaded successfully' });
//   } catch (error) {
//     console.error('Error uploading images:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
router.post('/upload/img', upload.array('image', 10), UploadImage);

module.exports = router;
