const Modelchatuser = require('../model/model');
const { saveMessageToDb } = require('./saveMsgToDb');

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

module.exports.UploadImage = async (files, messageId, io) => {
  try {
    const imagePaths = files.map((file) => file.path);

    // Update message in MongoDB with image paths
    const message = await Modelchatuser.findById(messageId);
    if (message) {
      message.image.push(...imagePaths);
      await message.save();

      // Emit the updated message to all clients
      io.emit('updateMessage', JSON.stringify(message));
    }
  } catch (error) {
    console.error('Error updating message with images:', error);
  }
};
