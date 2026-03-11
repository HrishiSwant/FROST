import cv2
import numpy as np
from PIL import Image
import io

# Load face detection model

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

def analyze_image(image_bytes: bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = np.array(image)
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.2,
        minNeighbors=5,
        minSize=(50, 50)
    )
    if len(faces) == 0:
        return {
            "verdict": "UNKNOWN",
            "confidence": 25,
            "facesDetected": 0,
            "message": "No face detected"
        }
        scores = []
        for (x, y, w, h) in faces:
            face_region = gray[y:y+h, x:x+w]
            blur = cv2.Laplacian(face_region, cv2.CV_64F).var()
            noise = np.std(face_region)
            artifact_score = (noise + (1000 / (blur + 1))) / 20
            scores.append(artifact_score)
            confidence = min(100, int(np.mean(scores)))
            verdict = "FAKE" if confidence > 60 else "REAL"
            return {
                "verdict": verdict,
        "confidence": confidence,
        "facesDetected": len(faces),
        "method": "Face forensic analysis"
                }
