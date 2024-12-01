document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addUserForm');
    const imageSourceSelect = document.getElementById('imageSource');
    const uploadSection = document.getElementById('uploadSection');
    const cameraSection = document.getElementById('cameraSection');
    const webcamElement = document.getElementById('webcam');
    const captureButton = document.getElementById('capture-button');
    const snapshotCanvas = document.getElementById('snapshot');
    let webcamStream = null;
    let capturedImages = [];

    // Toggle between upload and camera sections based on selection
    imageSourceSelect.addEventListener('change', () => {
        if (imageSourceSelect.value === 'upload') {
            uploadSection.style.display = 'block';
            cameraSection.style.display = 'none';
            stopWebcam();
        } else {
            uploadSection.style.display = 'none';
            cameraSection.style.display = 'block';
            startWebcam();
        }
    });

    // Start webcam streaming
    async function startWebcam() {
        try {
            webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
            webcamElement.srcObject = webcamStream;
            console.log('Webcam started successfully');
        } catch (error) {
            console.error('Error accessing webcam:', error);
            alert('Could not access the webcam.');
        }
    }

    // Stop webcam streaming
    function stopWebcam() {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
            console.log('Webcam stopped');
        }
    }

    // Capture image from webcam when capture button is clicked
    captureButton.addEventListener('click', () => {
        if (capturedImages.length < 4) {
            const context = snapshotCanvas.getContext('2d');
            snapshotCanvas.width = webcamElement.videoWidth;
            snapshotCanvas.height = webcamElement.videoHeight;
            context.drawImage(webcamElement, 0, 0, snapshotCanvas.width, snapshotCanvas.height);

            // Convert canvas to a blob and push it to the capturedImages array
            snapshotCanvas.toBlob(blob => {
                capturedImages.push(blob);
                alert(`Captured image ${capturedImages.length} of 4`);
                console.log(`Captured ${capturedImages.length} image(s).`);
            }, 'image/jpeg');
        } else {
            alert('You have already captured 4 images.');
        }
    });

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const password = document.getElementById('password').value.trim();
        const useCamera = imageSourceSelect.value === 'camera';
        const faceData = document.getElementById('faceData').files;

        // Validate form fields
        if (!username || !email || !phoneNumber || !password ||
            (useCamera && capturedImages.length < 4) ||
            (!useCamera && faceData.length < 4)) {
            alert('Please fill in all fields and upload/capture 4 images!');
            return;
        }

        // Prepare form data for submission
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('phoneNumber', phoneNumber);
        formData.append('password', password);

        // Add images (either captured via webcam or uploaded from files)
        if (useCamera) {
            capturedImages.forEach((blob, index) => {
                formData.append('faceData', blob, `captured_face_${index + 1}.jpg`);
            });
        } else {
            Array.from(faceData).forEach(file => formData.append('faceData', file));
        }

        // Log the formData to check if the images are being appended correctly
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        try {
            const response = await fetch('http://localhost:3000/add-user', {
                method: 'POST',
                body: formData,
            });

            // Handle response based on status code
            if (response.ok) {
                alert('User and images added successfully!');
            } else if (response.status === 409) {
                const errorData = await response.json();
                if (errorData.message.includes('Duplicate Image')) {
                    alert('Duplicate image is not accepted.'); // Display duplicate image message
                } else {
                    alert(`Error: ${errorData.message}`); // Display other duplicate user message
                }
            } else {
                const errorData = await response.json();
                alert('Error adding user: ' + errorData.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting the form');
        }
    });

    // Stop the webcam when the user leaves the page
    window.addEventListener('beforeunload', stopWebcam);
});