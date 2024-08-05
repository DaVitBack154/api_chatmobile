const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const Schema = mongoose.Schema;
const ConversationSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    userSenderID: {
      type: String,
      required: true,
    },
    userReceiverID: {
      type: String,
      required: true,
    },
    createDate: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const ConversationsModel = mongoose.model('Conversations', ConversationSchema);

module.exports = ConversationsModel;
