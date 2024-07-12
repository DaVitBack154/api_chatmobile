const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { readdirSync } = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./config/config');
const Message = require('./model/model');
const { saveMessage } = require('./controller/index');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // หรือระบุโดเมนเฉพาะ เช่น 'http://localhost:3700'
    methods: ['GET', 'POST'],
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: '*',
  })
);
app.use(bodyParser.json());
app.use(morgan('dev'));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New user connected');

  // Send all messages to the user
  socket.on('requestMessages', async () => {
    try {
      const messages = await Message.find();
      socket.emit('initialMessages', messages);
    } catch (error) {
      console.error('Error getting messages:', error);
    }
  });

  // Handle incoming messages
  socket.on('sendMessage', async (data) => {
    try {
      await saveMessage(data);
      io.emit('receiveMessage', data); // ส่งข้อความกลับไปยังทุกๆ client
    } catch (error) {
      console.error('Error saving message via socket:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Route
readdirSync('./routes').map((e) => {
  return app.use(require('./routes/' + e));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
