const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    name: {
      type: String,
      required: true,
    },
    role: {
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

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
