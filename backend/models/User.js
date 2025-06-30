const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  login: { type: String, required: true },
  name: { type: String },
  avatarUrl: { type: String },
  email: { type: String },
  raw: { type: Object },
});

module.exports = mongoose.model('User', UserSchema); 