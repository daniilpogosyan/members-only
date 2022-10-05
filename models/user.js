const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    minLength: 3,
    maxLength: 100,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    maxLength: 50,
    required: true
  },
  lastName: {
    type: String,
    maxLength: 50,
    required: true
  },
  status: {
    type: String,
    default: 'guest',

    // Use enum to make it possible to add new types of status
    enum: ['guest', 'member', 'admin'],
    required: true,
  },
});

module.exports = mongoose.model('User', UserSchema);
