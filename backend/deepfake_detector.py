import cv2
import numpy as np
from PIL import Image
import io

def analyze_image(image_bytes: bytes):
    """
    Lightweight deepfake detector (for academic use)
    Works on image artifacts, blur, noise, edges
    """

    # Load image
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = np.array(image)

    # Convert to gray
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    # Laplacian variance (blur detection)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()

    # Noise estimation
    noise = np.std(gray)

    # Simple heuristic
    confidence = min(100, int((noise + (1000 / (blur_score + 1))) / 20))

    verdict = "FAKE" if confidence > 60 else "REAL"

    return {
        "verdict": verdict,
        "confidence": confidence,
        "method": "Image forensic analysis"
    }
