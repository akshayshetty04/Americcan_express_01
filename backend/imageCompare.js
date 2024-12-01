const { exec } = require('child_process');
const path = require('path');

const compareImages = (imagePath1, imagePath2) => {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, 'machine_learning', 'utils.py');

    console.log(`Comparing images: ${imagePath1} and ${imagePath2}`);
    exec(
      `python "${pythonScriptPath}" "${imagePath1}" "${imagePath2}"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error('Error executing Python script:', stderr || err.message);
          return reject(new Error('Error in Python script execution'));
        }

        const output = stdout.trim();
        console.log('Python script output:', output);

        if (output.includes('Duplicate Image Present')) {
          resolve(true); // Duplicate found
        } else if (output.includes('Unique Image')) {
          resolve(false); // Unique image
        } else {
          reject(new Error(`Unexpected Python script output: ${output}`));
        }
      }
    );
  });
};

module.exports = compareImages;
