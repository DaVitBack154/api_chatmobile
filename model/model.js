const mongoose = require('mongoose');

const CreateChatuserSchema = mongoose.Schema(
  {
    sender: String,
    message: String,
    reciever: String,
    type: String,
    status_read: String,
    status_connect: String,
    image: {
      type: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('create_chatuser', CreateChatuserSchema);
