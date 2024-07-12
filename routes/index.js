const express = require('express');
const router = express.Router();
const { getAllMessages, saveMessage } = require('../controller/index');

router.get('/getmessages', getAllMessages);

// Endpoint POST สำหรับการส่งข้อความ
router.post('/savemessages', async (req, res) => {
  try {
    await saveMessage(req.body);
    res.status(201).send('Message saved');
  } catch (error) {
    res.status(500).send('Error saving message');
  }
});

module.exports = router;
