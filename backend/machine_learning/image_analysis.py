import cv2
import numpy as np
from sklearn.metrics import mean_squared_error
from skimage.metrics import structural_similarity as ssim
import sys

def load_image(image_path, grayscale=True):
    """Loads an image from the specified path and converts it to grayscale if needed."""
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE if grayscale else cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError(f"Image at path {image_path} could not be loaded.")
    return image

def preprocess_image(image, size=(100, 100)):
    """Resizes the image to a consistent size for easier comparison."""
    try:
        return cv2.resize(image, size)
    except Exception as e:
        raise ValueError(f"Image resizing failed: {e}")

def calculate_mse(image1, image2):
    """Calculates the Mean Squared Error (MSE) between two images."""
    if image1.shape != image2.shape:
        raise ValueError("Images must have the same dimensions for MSE calculation.")
    return mean_squared_error(image1.flatten(), image2.flatten())

def calculate_ssim(image1, image2):
    """Calculates the Structural Similarity Index (SSIM) between two images."""
    if image1.shape != image2.shape:
        raise ValueError("Images must have the same dimensions for SSIM calculation.")
    score, _ = ssim(image1, image2, full=True)
    return score

def is_duplicate(image1_path, image2_path, mse_threshold=1000, ssim_threshold=0.8):
    """Determines if two images are duplicates based on MSE and SSIM thresholds."""
    image1 = preprocess_image(load_image(image1_path))
    image2 = preprocess_image(load_image(image2_path))
    mse = calculate_mse(image1, image2)
    ssim_score = calculate_ssim(image1, image2)
    return mse < mse_threshold and ssim_score > ssim_threshold

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python image_analysis.py <image1_path> <image2_path>")
    else:
        image1_path = sys.argv[1]
        image2_path = sys.argv[2]
        try:
            if is_duplicate(image1_path, image2_path):
                print("Duplicate Image Present")
            else:
                print("Unique Image")
        except Exception as e:
            print(f"Error: {e}")
