const Modelchatuser = require('../model/model');
const { saveMessageToDb } = require('./saveMsgToDb');
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
