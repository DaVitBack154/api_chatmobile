const Modelchatuser = require('../model/model');

module.exports.saveMessageToDb = async (data) => {
  try {
    const newMessage = new Modelchatuser(data);
    await newMessage.save();
    return { message: newMessage.message, username: newMessage.username };
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};
