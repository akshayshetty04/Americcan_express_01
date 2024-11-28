// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  faceDataPath: { type: String }, // Store the path to the user's face data file
});

module.exports = mongoose.model('User', userSchema);
