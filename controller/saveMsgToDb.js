const Modelchatuser = require('../model/model');

module.exports.saveMessageToDb = async (data) => {
  try {
    const newMessage = new Modelchatuser(data);
    console.log(newMessage, 'newmess');
    await newMessage.save();
    return {
      message: newMessage.message,
      sender: newMessage.sender,
      reciever: newMessage.reciever,
      role: newMessage.role,
    };
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};
