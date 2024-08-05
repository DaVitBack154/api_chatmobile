const Modelchatuser = require('../model/model');
const { saveMessageToDb } = require('./saveMsgToDb');
const UserModel = require('../model/user.model');
const ConversationsModel = require('../model/conversations.model');
const fs = require('fs');
const path = require('path');

module.exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Modelchatuser.find();
    res.json(messages);
  } catch (error) {
    res.status(500).send('Error retrieving messages');
  }
};

module.exports.saveMessage = async (req, res) => {
  try {
    const data = req.body;
    const result = await saveMessageToDb(data);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving message', error });
  }
};

module.exports.createUser = async (req, res) => {
  const { UserID, name, surname, idCard, role } = req.body;

  if (!UserID || UserID === '')
    return res
      .status(400)
      .json({ status: false, code: 400, message: 'UserID is required' });

  if (!name || name === '')
    return res
      .status(400)
      .json({ status: false, code: 400, message: 'Name is required' });

  if (!surname || surname === '')
    return res
      .status(400)
      .json({ status: false, code: 400, message: 'Role is required' });

  if (!idCard || idCard === '')
    return res
      .status(400)
      .json({ status: false, code: 400, message: 'Role is required' });

  if (!role || role === '')
    return res
      .status(400)
      .json({ status: false, code: 400, message: 'Role is required' });

  const user = new UserModel({
    _id: UserID,
    name: name,
    surname: surname,
    idCard: idCard,
    role: role,
  });

  try {
    const getUser = await UserModel.findOne({
      _id: UserID,
    });

    if (getUser) {
      console.log('duplicate');
      return res.status(500).json({
        status: false,
        code: 500,
        message: 'duplicate user ' + getUser._id,
      });
    }

    const result = await user.save();

    if (!result)
      return res
        .status(500)
        .json({ status: false, code: 500, message: 'Internal server error' });

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'User added successfully',
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      code: 500,
      message: err?.message || 'Internal server error',
    });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const result = await UserModel.find({
      role: 'user',
    });

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'User added successfully',
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      code: 500,
      message: err?.message || 'Internal server error',
    });
  }
};

module.exports.getConversations = async (req, res) => {
  try {
    const result = await ConversationsModel.find();

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Conversations successfully',
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: false,
      code: 500,
      message: err?.message || 'Internal server error',
    });
  }
};

// module.exports.UploadImage = async (files, messageId, io) => {
//   try {
//     // สร้าง paths สำหรับภาพที่อัพโหลด
//     const imagePaths = files.map((file) => file.path);

//     // หาเอกสารข้อความตาม _id
//     const message = await Modelchatuser.findById(messageId);
//     if (message) {
//       message.image.push(...imagePaths); // เพิ่มภาพใหม่ไปยังรายการที่มีอยู่
//       await message.save();

//       // แจ้งเตือนให้ลูกค้าทุกคนทราบถึงข้อความที่อัพเดต
//       io.emit('updateMessage', JSON.stringify(message));
//     } else {
//       console.error('Message not found');
//     }
//   } catch (error) {
//     console.error('Error updating message with images:', error);
//   }
// };

// module.exports.UploadImage = async (req, res) => {
//   const io = req.app.get('io'); // Access the Socket.io instance

//   if (req.files && req.files.length > 0) {
//     const filenames = req.files.map((file) => file.filename);
//     const _id = req.body._id || null;
//     if (_id !== '' && _id !== null && !_id) {
//       const _ObjCreateSaleHome = await Modelchatuser.findOne({ _id: _id });
//       if (_ObjCreateSaleHome && _ObjCreateSaleHome.image.length > 0) {
//         for (const _ItemImg of _ObjCreateSaleHome.image) {
//           const _path = path.join(__dirname, '..', 'upload', 'img', _ItemImg);
//           try {
//             fs.unlinkSync(_path);
//             console.log(`File ${_path} has been deleted.`);
//           } catch (err) {
//             console.log(err);
//           }
//         }
//       }
//     }

//     // Emit the uploaded images to connected clients
//     io.emit('newImages', filenames.toString());

//     return res.status(200).json({
//       status: true,
//       message: 'อัพโหลดรูปภาพสำเร็จ',
//       data: { selectedImages: filenames },
//     });
//   } else {
//     return res.status(400).json({
//       status: false,
//       message: 'ไม่พบรูปภาพที่อัพโหลด',
//     });
//   }
// };

module.exports.UploadImage = async (req, res) => {
  const io = req.app.get('io'); // Access the Socket.io instance

  if (req.files && req.files.length > 0) {
    const filenames = req.files.map((file) => file.filename);
    const _id = req.body._id || null;
    if (_id !== '' && _id !== null && !_id) {
      const _ObjCreateSaleHome = await Modelchatuser.findOne({ _id: _id });
      if (_ObjCreateSaleHome && _ObjCreateSaleHome.image.length > 0) {
        for (const _ItemImg of _ObjCreateSaleHome.image) {
          const _path = path.join(__dirname, '..', 'upload', 'img', _ItemImg);
          try {
            fs.unlinkSync(_path);
            console.log(`File ${_path} has been deleted.`);
          } catch (err) {
            console.log(err);
          }
        }
      }
    }

    // Emit the uploaded images to connected clients
    io.emit('newImages', {
      status: true,
      message: 'อัพโหลดรูปภาพสำเร็จ',
      data: { selectedImages: filenames },
    });

    return res.status(200).json({
      status: true,
      message: 'อัพโหลดรูปภาพสำเร็จ',
      data: { selectedImages: filenames },
    });
  } else {
    return res.status(400).json({
      status: false,
      message: 'ไม่พบรูปภาพที่อัพโหลด',
    });
  }
};
