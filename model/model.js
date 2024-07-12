const mongoose = require('mongoose');
const CreateChatappSchema = mongoose.Schema(
  {
    username: String,
    message: String,
    image: {
      type: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('create_chat', CreateChatappSchema);
