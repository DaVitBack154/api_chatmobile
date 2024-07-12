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
