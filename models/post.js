const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 50
  },
  body: {
    type: String,
    maxLength: 500,
  },
  author: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Post', PostSchema);
