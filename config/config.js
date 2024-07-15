const mongoose = require('mongoose');
const DB_URI = 'mongodb://127.0.0.1:27017/Chatapp';
const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connect MongoDB Success');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อ MongoDB:', error);
  }
};

module.exports = {
  connectDB,
};
