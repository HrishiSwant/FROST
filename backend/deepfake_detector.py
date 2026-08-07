import cv2
import numpy as np
from PIL import Image
import io

# Load face detector (Haar Cascade)
face_cascade = None

def get_face_cascade():
    global face_cascade

    if face_cascade is None:
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

    return face_cascade

def analyze_image(image_bytes: bytes):
    try:
        # Convert bytes to image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = np.array(image)
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

        # Detect faces
        cascade = get_face_cascade()
        faces = cascade.detectMultiScale(
            gray,
            scaleFactor=1.2,
            minNeighbors=5,
            minSize=(50, 50)
        )

        # Basic forensic checks
        blur = cv2.Laplacian(gray, cv2.CV_64F).var()
        noise = np.std(gray)

        # ---------------- DECISION LOGIC ----------------

        # Case 1: No face detected
        if len(faces) == 0:
            verdict = "SUSPICIOUS"
            confidence = 40

        else:
            # Case 2: Very blurry image
            if blur < 40:
                verdict = "SUSPICIOUS"
                confidence = 45

            # Case 3: High noise → possible manipulation
            elif noise > 60:
                verdict = "FAKE"
                confidence = 70

            # Case 4: Normal image
            else:
                verdict = "REAL"
                confidence = 75

        return {
            "verdict": verdict,
            "confidence": confidence,
            "facesDetected": len(faces),
            "blurScore": round(blur, 2),
            "noiseScore": round(noise, 2),
            "method": "Forensic image analysis (OpenCV)"
        }

    except Exception as e:
        return {
            "verdict": "ERROR",
            "confidence": 0,
            "error": str(e)
        }
