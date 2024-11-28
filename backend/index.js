const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const compareImages = require('./imageCompare');  // Import the image comparison function

dotenv.config();  // Load environment variables from .env

const app = express();

// Enable CORS for the frontend origin
app.use(cors());

// Middleware to parse JSON data
app.use(express.json());

// Serve static files (optional, depending on your use case)
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Multer configuration for uploading multiple images
const uploadMultiple = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const username = req.body.username;

      if (!username) {
        return cb(new Error('Username is required'), false);
      }

      const userFolder = path.join(__dirname, 'USER', username);

      // Create the folder if it doesn't exist
      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
      }

      cb(null, userFolder);  // Set the folder as the destination
    },
    filename: function (req, file, cb) {
      // Name the file with a timestamp and original extension
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
}).array('faceData', 4);  // Expecting up to 4 images with field name 'faceData'

// POST route to add user and handle image uploads
app.post('/add-user', async (req, res) => {
  console.log('Request body:', req.body);  // Log to see form data
  console.log('Uploaded files:', req.files);  // Log to see uploaded files
  
  // Handle file upload and validation
  uploadMultiple(req, res, async (uploadErr) => {
    if (uploadErr) {
      console.error('Error uploading images:', uploadErr);
      return res.status(500).json({ message: 'Error uploading images', error: uploadErr.message });
    }

    const { username, email, phoneNumber, password } = req.body;

    // Ensure all required fields are provided
    if (!username || !email || !phoneNumber || !password || !req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please fill in all fields and upload at least one image.' });
    }

    try {
      // Check if user already exists in MongoDB
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Check for duplicate images by comparing the first uploaded image with others
      const firstImagePath = req.files[0].path;
      let isDuplicate = false;

      // Loop through the rest of the uploaded files
      for (let i = 1; i < req.files.length; i++) {
        const imagePath = req.files[i].path;
        isDuplicate = await compareImages(firstImagePath, imagePath);

        if (isDuplicate) {
          return res.status(400).json({ message: 'Duplicate image detected. Please upload a unique image.' });
        }
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user to the database
      const newUser = new User({
        username,
        email,
        phoneNumber,
        password: hashedPassword,
        faceData: req.files.map(file => file.path),
      });

      await newUser.save();

      res.status(201).json({ message: 'User added successfully' });
    } catch (error) {
      console.error('Error adding user:', error);
      res.status(500).json({ message: 'Error adding user', error: error.message });
    }
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
