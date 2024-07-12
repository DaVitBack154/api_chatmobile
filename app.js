// app.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { readdirSync } = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const { connectDB } = require('./config/config');
const { saveMessageToDb } = require('./controller/saveMsgToDb');
const Modelchatuser = require('./model/model');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Middleware สำหรับ parse JSON ที่ส่งเข้ามาใน body
app.use(morgan('dev'));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New user connected');

  // ส่งข้อมูลทั้งหมดไปยังผู้ใช้ที่เข้าร่วม
  socket.on('requestMessages', async () => {
    try {
      const messages = await Modelchatuser.find();
      socket.emit('initialMessages', messages);
    } catch (error) {
      console.error('Error getting messages:', error);
    }
  });

  socket.on('sendMessage', async (data) => {
    try {
      const savedMessage = await saveMessageToDb(data); // เรียกใช้ saveMessage ใน controller
      io.emit('receiveMessage', savedMessage); // ส่งข้อความที่บันทึกแล้วกลับไปยังทุกๆ client ผ่าน WebSocket
    } catch (error) {
      console.error('Error saving message via socket:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Route
readdirSync('./routes').map((file) => {
  app.use(require(`./routes/${file}`));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
