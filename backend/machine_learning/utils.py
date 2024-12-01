import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim
import sys

def load_image(image_path):
    """Loads an image from the specified path and converts it to grayscale."""
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise ValueError(f"Image at {image_path} could not be loaded.")
    return image

def preprocess_image(image, size=(100, 100)):
    """Resizes the image to a consistent size for easier comparison."""
    return cv2.resize(image, size)

def is_duplicate(image1_path, image2_path, mse_threshold=1000, ssim_threshold=0.8):
    """Determines if two images are duplicates based on MSE and SSIM thresholds."""
    image1 = preprocess_image(load_image(image1_path))
    image2 = preprocess_image(load_image(image2_path))
    mse = np.mean((image1 - image2) ** 2)
    ssim_score, _ = ssim(image1, image2, full=True)
    return mse < mse_threshold and ssim_score > ssim_threshold

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python utils.py <image1_path> <image2_path>")
        sys.exit(1)

    image1_path = sys.argv[1]
    image2_path = sys.argv[2]
    try:
        if is_duplicate(image1_path, image2_path):
            print("Duplicate Image Present")
        else:
            print("Unique Image")
    except Exception as e:
        print(f"Error: {e}")
