import cv2
import numpy as np
from PIL import Image
import io

def detect_deepfake(image_bytes: bytes):
    # Load image
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = np.array(image)

    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    # Laplacian variance (blur / artifact detection)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

    # Noise estimation
    noise = np.std(gray)

    # Simple heuristic scoring
    score = 0
    if laplacian_var < 60:
        score += 40
    if noise < 15:
        score += 30
    if img.shape[0] < 256 or img.shape[1] < 256:
        score += 30

    confidence = min(score, 100)

    verdict = "DEEPFAKE" if confidence >= 60 else "REAL"

    return verdict, confidence

