const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const compareImages = require('./imageCompare');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const uploadMultiple = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const username = req.body.username;
      if (!username) return cb(new Error('Username is required'), false);
      
      const userFolder = path.join(__dirname, 'USER', username);
      if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });
      cb(null, userFolder);
    },
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'), false);
    cb(null, true);
  },
}).array('faceData', 4);

app.post('/add-user', (req, res) => {
  uploadMultiple(req, res, async (uploadErr) => {
    if (uploadErr) {
      console.error('Error uploading images:', uploadErr);
      return res.status(500).json({
        message: 'Error uploading images',
        error: uploadErr.message,
      });
    }

    const { username, email, phoneNumber, password } = req.body;
    if (!username || !email || !phoneNumber || !password || !req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'Please fill in all fields and upload at least one image.',
      });
    }

    try {
      const userFolder = path.join(__dirname, 'USER', username);
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const uploadedImages = req.files.map((file) => file.path);

      // Compare uploaded images against all existing users' images
      const otherUsers = await User.find({});
      for (const user of otherUsers) {
        for (const storedImage of user.faceData) {
          for (const uploadedImage of uploadedImages) {
            const isDuplicate = await compareImages(uploadedImage, storedImage);
            if (isDuplicate) {
              return res.status(400).json({
                message: 'Duplicate image detected. Please upload unique images.',
              });
            }
          }
        }
      }

      // Save user data if no duplicates found
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        email,
        phoneNumber,
        password: hashedPassword,
        faceData: uploadedImages,
      });

      await newUser.save();
      res.status(201).json({
        message: 'User added successfully',
        userId: newUser._id,
      });
    } catch (error) {
      console.error('Error adding user:', error);
      res.status(500).json({
        message: 'Error adding user',
        error: error.message,
      });
    }
  });
});
app.delete('/delete-all', async (req, res) => {
  try {
    // Delete all users from MongoDB
    await User.deleteMany({});
    console.log('All users deleted from MongoDB');

    // Path to the USER directory where user folders and images are stored
    const userDir = path.join(__dirname, 'USER');

    // Read all subdirectories in the USER folder
    fs.readdir(userDir, (err, directories) => {
      if (err) {
        console.error('Error reading USER directory:', err);
        return res.status(500).json({ message: 'Error deleting files' });
      }

      // Loop through each directory and delete it along with all files
      directories.forEach((directory) => {
        const dirPath = path.join(userDir, directory);

        // Check if the directory exists and delete it recursively
        fs.rm(dirPath, { recursive: true, force: true }, (err) => {
          if (err) {
            console.error(`Error deleting directory ${dirPath}:`, err);
            return;
          }

          console.log(`Directory ${dirPath} and its contents deleted`);
        });
      });

      res.status(200).json({
        message: 'All user data and images have been deleted.',
      });
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({
      message: 'Error deleting data',
      error: error.message,
    });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
