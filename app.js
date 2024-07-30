const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { readdirSync } = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const { connectDB } = require('./config/config');
const { saveMessageToDb } = require('./controller/saveMsgToDb');
const uploadRouter = require('./routes/index'); // Import upload route
const Modelchatuser = require('./model/model');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io); // Set io instance for access in routes

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use(express.json());
app.use(morgan('dev'));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('requestMessages', async () => {
    try {
      const messages = await Modelchatuser.find();
      // console.log('messages =>', messages);
      const result = messages?.map((v) => {
        return {
          _id: v._id.toString(),
          sender: v?.sender ?? '',
          message: v?.message ?? '',
          reciever: v?.reciever ?? '',
          type: v?.type ?? '',
          status_read: v?.status_read ?? '',
          status_connect: v?.status_connect ?? '',
          role: v?.role ?? '',
          id_card: v?.id_card ?? '',
          image:
            v?.image?.length > 0
              ? v?.image?.map(
                  (v) => `http://18.140.121.108:4000/upload/img/${v}`
                )
              : [],
        };
      });
      socket.emit('initialMessages', result);
    } catch (error) {
      console.error('Error getting messages:', error);
    }
  });

  socket.on('sendMessage', async (data) => {
    // console.log('data sendMessage =>', data);
    try {
      const messageData = JSON.parse(data);
      const savedMessage = await saveMessageToDb(messageData);
      // console.log('savedMessage', savedMessage);
      if (savedMessage?.image && savedMessage?.image?.length > 0) {
        savedMessage.image = savedMessage.image?.map(
          (v) => `http://18.140.121.108:4000/upload/img/${v}`
        );
      }

      // console.log('savedMessage =>', savedMessage);
      io.emit('receiveMessage', JSON.stringify(savedMessage));
    } catch (error) {
      console.error('Error saving message via socket:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Use upload route
app.use(uploadRouter); // Ensure the route is prefixed with /api

// Load routes dynamically
readdirSync('./routes').map((file) => {
  if (file !== 'index.js') {
    // Skip the upload route file
    app.use(require(`./routes/${file}`));
  }
});

// console.log('env URL', process.env.URL);
// console.log('env NODE_ENV', process.env.NODE_ENV);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
