const mongoose = require('mongoose');

const CreateChatuserSchema = mongoose.Schema(
  {
    username: String,
    message: String,
    image: {
      type: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('create_chatuser', CreateChatuserSchema);
