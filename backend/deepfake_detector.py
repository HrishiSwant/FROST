import cv2
import numpy as np
from PIL import Image
import io
import logging


# ================= FACE DETECTOR =================

face_cascade = None


def get_face_cascade():

    global face_cascade

    if face_cascade is None:

        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades
            + "haarcascade_frontalface_default.xml"
        )

        if face_cascade.empty():
            raise RuntimeError(
                "Failed to load Haar Cascade face detector"
            )

    return face_cascade


# ================= IMAGE ANALYSIS =================

def analyze_image(image_bytes: bytes):

    try:

        # ---------------- VALIDATE INPUT ----------------

        if not image_bytes:
            raise ValueError("Image data is empty")


        # ---------------- CONVERT IMAGE ----------------

        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

        img = np.array(image)


        # ---------------- GRAYSCALE ----------------

        gray = cv2.cvtColor(
            img,
            cv2.COLOR_RGB2GRAY
        )


        # ---------------- FACE DETECTION ----------------

        cascade = get_face_cascade()

        faces = cascade.detectMultiScale(
            gray,
            scaleFactor=1.2,
            minNeighbors=5,
            minSize=(50, 50)
        )


        # ---------------- FORENSIC CHECKS ----------------

        blur = cv2.Laplacian(
            gray,
            cv2.CV_64F
        ).var()

        noise = np.std(gray)


        # ---------------- DECISION LOGIC ----------------

        # No face detected
        if len(faces) == 0:

            verdict = "SUSPICIOUS"
            confidence = 40


        # Very blurry image
        elif blur < 40:

            verdict = "SUSPICIOUS"
            confidence = 45


        # High noise
        elif noise > 60:

            verdict = "FAKE"
            confidence = 70


        # Normal image
        else:

            verdict = "REAL"
            confidence = 75


        # ---------------- RETURN RESULT ----------------

        return {
            "verdict": verdict,
            "confidence": confidence,
            "facesDetected": len(faces),
            "blurScore": round(blur, 2),
            "noiseScore": round(noise, 2),
            "method": "Forensic image analysis (OpenCV)"
        }


    except Exception as e:

        logging.exception(
            "Deepfake image analysis failed"
        )

        return {
            "verdict": "ERROR",
            "confidence": 0,
            "facesDetected": 0,
            "blurScore": None,
            "noiseScore": None,
            "method": "Forensic image analysis (OpenCV)",
            "error": str(e)
        }
