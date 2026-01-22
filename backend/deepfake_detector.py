import cv2
import numpy as np
from PIL import Image
import io

def analyze_image(image_bytes: bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = np.array(image)

    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    noise_score = np.std(gray)

    confidence = 0
    if blur_score < 100:
        confidence += 50
    if noise_score < 10:
        confidence += 30

    confidence = min(confidence, 100)

    verdict = "DEEPFAKE" if confidence >= 50 else "REAL"

    return {
        "verdict": verdict,
        "confidence": confidence,
        "blur": round(blur_score, 2),
        "noise": round(noise_score, 2)
    }
