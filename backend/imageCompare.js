const { exec } = require('child_process');
const path = require('path');

// Function to compare two images using the utils.py script
const compareImages = (imagePath1, imagePath2) => {
  return new Promise((resolve, reject) => {
    // Path to the Python script (utils.py)
    const pythonScriptPath = path.join(__dirname, 'machine_learning', 'utils.py');

    // Execute the Python script to compare the images
    exec(`python "${pythonScriptPath}" "${imagePath1}" "${imagePath2}"`, (err, stdout, stderr) => {
      if (err) {
        return reject(`Error executing Python script: ${stderr || err.message}`);
      }

      // If the output contains "Duplicate Image Present", resolve with true
      if (stdout.includes("Duplicate Image Present")) {
        resolve(true);
      } else if (stdout.includes("Unique Image")) {
        resolve(false);
      } else {
        reject("Unexpected output from Python script.");
      }
    });
  });
};

module.exports = compareImages;
