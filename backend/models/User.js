const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  faceData: { type: [String], required: true },  // Ensure this is an array
});

module.exports = mongoose.model('User', userSchema);
