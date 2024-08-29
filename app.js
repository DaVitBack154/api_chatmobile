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
const moment = require('moment-timezone');
require('dotenv').config();

const urlHost = '18.140.121.108';
// const urlHost = 'localhost';

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

const getUser = async () => {
  const getUser = await Modelchatuser.aggregate([
    {
      $group: {
        _id: '$id_card',
      },
    },
  ]);

  const results = await Promise.all(
    getUser?.map(async (item) => {
      const _getDetailUser = await Modelchatuser.findOne({
        id_card: item._id,
      });
      const _getDetailUserCreateDate = await Modelchatuser.findOne({
        id_card: item._id,
      }).sort({ createdAt: -1 });
      const _countReadSA = await Modelchatuser.countDocuments({
        id_card: item._id,
        status_read: 'SA',
      });
      const _countReadSU = await Modelchatuser.countDocuments({
        id_card: item._id,
        status_read: 'SU',
      });

      return {
        _id: item._id,
        sender: _getDetailUser?.sender,
        readSA: _countReadSA,
        readSU: _countReadSU,
        createdAt: +new Date(_getDetailUserCreateDate.createdAt),
      };
    })
  );
  return results?.sort((a, b) => b.createdAt - a.createdAt);
};

// Socket.io connection
io.on('connection', (socket) => {
  // console.log('New user connected');

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
          status_end: v?.status_end ?? '',
          image:
            v?.image?.length > 0
              ? v?.image?.map((v) => `http://${urlHost}:4000/upload/img/${v}`)
              : [],
          createdAt: v.createdAt ?? '',
        };
      });
      socket.emit('initialMessages', result);
    } catch (error) {
      console.error('Error getting messages:', error);
    }
  });

  socket.on('getUsers', async () => {
    try {
      const results = await getUser();
      socket.emit('initialUsers', results);
    } catch (error) {
      console.error('Error getting messages:', error);
    }
  });

  socket.on('getStatusRead', async (data) => {
    try {
      const { id_card } = JSON.parse(data);

      const _countReadSA = await Modelchatuser.countDocuments({
        id_card: id_card,
        status_read: 'SA',
      });

      const results = {
        countSA: _countReadSA,
      };

      socket.emit('initialRead', results); // ส่งผลลัพธ์กลับไปยัง client ผ่าน event 'initialRead'
    } catch (error) {
      socket.emit('error', 'Error retrieving messages'); // ส่งข้อความ error กลับไปยัง client
    }
  });

  socket.on('sendMessage', async (data) => {
    try {
      const messageData = JSON.parse(data);

      const savedMessage = await saveMessageToDb(messageData);
      // console.log('savedMessage', savedMessage);
      if (savedMessage?.image && savedMessage?.image?.length > 0) {
        savedMessage.image = savedMessage.image?.map(
          (v) => `http://${urlHost}:4000/upload/img/${v}`
        );
      }
      io.emit('receiveMessage', JSON.stringify(savedMessage));
      io.emit('initialUsers', await getUser());
    } catch (error) {
      console.error('Error saving message via socket:', error);
    }
  });

  socket.on('read-admin', async (data) => {
    if (!data || data === '') return;
    const _data = JSON.parse(data);
    try {
      await Modelchatuser.updateMany(
        { id_card: _data?.CardID, status_read: 'SU' },
        { $set: { status_read: 'RA' } }
      );
      io.emit('initialUsers', await getUser());
    } catch (err) {
      console.log(err);
    }
  });

  socket.on('read-user', async (data) => {
    if (!data || data === '') return;
    const _data = JSON.parse(data);
    try {
      await Modelchatuser.updateMany(
        { id_card: _data?.CardID, status_read: 'SA' },
        { $set: { status_read: 'RU' } }
      );
    } catch (err) {
      console.log(err);
    }
  });

  socket.on('viewsMessageV2', async (data) => {
    if (!data || data === '') return;
    const _data = JSON.parse(data);
    let _listMessage = [];
    //CardID

    try {
      const messageUser = await Modelchatuser.find({
        id_card: _data?.CardID,
      });

      _listMessage = messageUser?.map((v) => {
        // console.log(v);
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
          status_end: v?.status_end ?? '',
          image:
            v?.image?.length > 0
              ? v?.image?.map((v) => `http://${urlHost}:4000/upload/img/${v}`)
              : [],
          createdAt: v.createdAt ?? '',
        };
      });

      socket.emit('initialMessages', _listMessage);
    } catch (error) {
      console.error('Error saving message via socket:', error);
    }
  });

  socket.on('Timeout', () => {
    try {
      // รับเวลาปัจจุบันในเขตเวลาของประเทศไทย
      const now = moment().tz('Asia/Bangkok');
      const currentHour = now.hour(); // รับชั่วโมงในวันปัจจุบัน
      const currentMinute = now.minute(); // รับนาทีในวันปัจจุบัน
      const dayOfWeek = now.day(); // รับวันในสัปดาห์

      // console.log(`Current time: ${now.format()}`);
      // console.log(`Current hour: ${currentHour}`);
      // console.log(`Current minute: ${currentMinute}`);
      // console.log(`Day of the week: ${dayOfWeek}`);

      let cutoffHour;

      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        cutoffHour = 20; // วันจันทร์ - ศุกร์
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        cutoffHour = 18; // วันเสาร์ - อาทิตย์
      }

      console.log(`Cutoff hour: ${cutoffHour}`);

      let result;

      // ตรวจสอบว่าชั่วโมงปัจจุบันเกินเวลาที่กำหนดหรือไม่
      if (
        currentHour > cutoffHour ||
        (currentHour === cutoffHour && currentMinute > 0)
      ) {
        result = 'หมดเวลาทำการ';
        console.log('Sending outOfWorkingHours signal');
      }

      // ส่งสัญญาณพร้อมกับตัวแปร result
      socket.emit('outOfWorkingHours', result);
    } catch (error) {
      console.error('Error in Timeout event:', error);
      socket.emit('error', 'Error during time check');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Use upload route
app.use(uploadRouter);

// Load routes dynamically
readdirSync('./routes').map((file) => {
  if (file !== 'index.js') {
    // Skip the upload route file
    app.use(require(`./routes/${file}`));
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
