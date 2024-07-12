const Modelchat = require('../model/model');

// ฟังก์ชันสำหรับดึงข้อความทั้งหมด
module.exports.getAllMessages = async () => {
  try {
    const messages = await Modelchat.find();
    res.json(messages);
  } catch (error) {
    res.status(500).send('Error retrieving messages');
  }
};

module.exports.saveMessage = async () => {
  try {
    const newMessage = new Modelchat(data);
    await newMessage.save();
    console.log('Message saved successfully:', newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    throw error; // สามารถเพิ่ม throw เพื่อระบุปัญหาได้
  }
};
