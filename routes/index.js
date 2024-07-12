const express = require('express');
const router = express.Router();
const { getAllMessages, saveMessage } = require('../controller/index');
//chat
router.get('/getmessages', getAllMessages);

// Endpoint POST สำหรับการส่งข้อความ
router.post('/postmessages', saveMessage);

module.exports = router;
