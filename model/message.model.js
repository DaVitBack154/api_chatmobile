const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const Schema = mongoose.Schema;
const MessageSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    conversationID: {
      type: String,
      required: true,
    },
    userSenderID: {
      type: String,
      required: true,
    },
    userSenderName: {
      type: String,
      require: true,
    },
    messageContent: {
      type: String,
    },
    type: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
    },
    active: {
      type: Boolean,
      default: true,
    },
    endMessage: {
      type: Boolean,
      default: false,
    },
    createDate: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const MessageModel = mongoose.model('Messages', MessageSchema);

module.exports = MessageModel;
