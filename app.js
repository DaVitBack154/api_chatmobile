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

const UserModel = require('./model/user.model');
const ConversationsModel = require('./model/conversations.model');
const MessageModel = require('./model/message.model');

// const urlHost = '18.140.121.108'
const urlHost = 'localhost';
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
              ? v?.image?.map((v) => `http://${urlHost}:4000/upload/img/${v}`)
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
          (v) => `http://${urlHost}:4000/upload/img/${v}`
        );
      }

      // console.log('savedMessage =>', savedMessage);
      io.emit('receiveMessage', JSON.stringify(savedMessage));
    } catch (error) {
      console.error('Error saving message via socket:', error);
    }
  });

  socket.on('requestMessagesV2', async (data) => {
    if (!data || data === '') return;
    const _data = JSON.parse(data);
    let _listMessage = [];
    //ConversationID

    try {
      const getMessages = await MessageModel.find({
        conversationID: _data?.ConversationID,
        active: true,
        endMessage: false,
      });

      // console.log('messages =>', messages);
      _listMessage = getMessages?.map((v) => {
        return {
          _id: v._id.toString(),
          conversationID: v?.conversationID,
          messageContent: v?.messageContent,
          userSenderID: v?.userSenderID,
          userSenderName: v?.userSenderName,
          type: v?.type,
          createDate: v?.createDate,
          image:
            v?.images?.length > 0
              ? v?.images?.map((v) => `http://${urlHost}:4000/upload/img/${v}`)
              : [],
        };
      });

      // socket.to(_data?.ConversationID).emit('initialMessages', _listMessage);
      socket.emit('initialMessagesV2', _listMessage);
    } catch (error) {
      console.error('Error getting messages:', error);
    }
  });

  socket.on('sendMessageV2', async (data) => {
    console.log('data sendMessage =>', data);
    if (!data || data === '') return;
    const _data = JSON.parse(data);
    //UserSenderID
    //UserSenderName
    //UserReceiverID
    //Message
    //Type
    //Images
    const conversationModel = new ConversationsModel({
      userSenderID: _data?.UserSenderID,
      userReceiverID: _data?.UserReceiverID,
    });

    try {
      const conversationExists = await ConversationsModel.findOne({
        $or: [
          {
            userSenderID: _data?.UserSenderID,
            userReceiverID: _data?.UserReceiverID,
          },
          {
            userSenderID: _data?.UserReceiverID,
            userReceiverID: _data?.UserSenderID,
          },
        ],
      });

      const conversation = !conversationExists
        ? await conversationModel.save()
        : conversationExists;

      const getUser = await UserModel.findOne({
        _id: _data?.UserSenderID,
      });

      const message = new MessageModel({
        conversationID: conversation._id,
        messageContent: _data?.Message ?? '',
        type: _data?.Type,
        userSenderID: _data?.UserSenderID,
        // userSenderName: _data?.UserSenderName?.trim(),
        userSenderName: getUser?.name?.trim(),
        images: _data?.Images ?? [],
      });

      const savedMessage = await message.save();
      // console.log('savedMessage', savedMessage);
      if (savedMessage?.images && savedMessage?.images?.length > 0) {
        savedMessage.images = savedMessage.images?.map(
          (v) => `http://${urlHost}:4000/upload/img/${v}`
        );
      }
      // console.log('savedMessage =>', savedMessage);
      // io.to(conversation._id).emit(
      //   'receiveMessageV2',
      //   JSON.stringify(savedMessage)
      // );
      io.emit('receiveMessageV2', JSON.stringify(savedMessage));
    } catch (error) {
      console.error('Error saving message via socket:', error);
    }
  });

  socket.on('viewsMessageV2', async (data) => {
    if (!data || data === '') return;
    const _data = JSON.parse(data);
    let _listMessage = [];
    //UserSenderID
    //UserReceiverID

    try {
      const conversationExists = await ConversationsModel.findOne({
        $or: [
          {
            userSenderID: _data?.UserSenderID,
            userReceiverID: _data?.UserReceiverID,
          },
          {
            userSenderID: _data?.UserReceiverID,
            userReceiverID: _data?.UserSenderID,
          },
        ],
      });

      if (conversationExists) {
        const getMessages = await MessageModel.find({
          conversationID: conversationExists?._id,
          active: true,
          endMessage: false,
        });

        // console.log('messages =>', messages);
        _listMessage = getMessages?.map((v) => {
          return {
            _id: v._id.toString(),
            conversationID: v?.conversationID,
            messageContent: v?.messageContent,
            userSenderID: v?.userSenderID,
            userSenderName: v?.userSenderName,
            type: v?.type,
            createDate: v?.createDate,
            images:
              v?.images?.length > 0
                ? v?.images?.map(
                    // (v) => `http://18.140.121.108:4000/upload/img/${v}`
                    (v) => `http://${urlHost}:4000/upload/img/${v}`
                  )
                : [],
          };
        });
      }

      socket.emit('initialMessagesV2', _listMessage);
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
