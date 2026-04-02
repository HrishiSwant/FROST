import cv2
import numpy as np
from PIL import Image
import io
import google.generativeai as genai

# Load face detector (Haar Cascade)
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Initialize Gemini model (same as main API)
model = genai.GenerativeModel("gemini-pro")


def analyze_image(image_bytes: bytes):
    try:
        # Convert bytes to image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = np.array(image)
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

        # Detect faces
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.2,
            minNeighbors=5,
            minSize=(50, 50)
        )

        # Basic forensic checks
        blur = cv2.Laplacian(gray, cv2.CV_64F).var()
        noise = np.std(gray)

        # ---------------- GEMINI ANALYSIS ----------------
        try:
            response = model.generate_content([
                "Analyze this image and determine if it looks AI-generated, manipulated, or real. "
                "Give a short explanation and confidence (0-100).",
                image
            ])
            ai_text = response.text

        except Exception as e:
            ai_text = f"AI analysis failed: {str(e)}"

        # ---------------- FINAL VERDICT ----------------
        if blur < 50:
            verdict = "LOW_QUALITY"
            confidence = 30
            message = "Image is too blurry for reliable analysis."

        elif len(faces) == 0:
            verdict = "UNKNOWN"
            confidence = 40
            message = "No clear human face detected."

        else:
            verdict = "ANALYZED"
            confidence = 75
            message = "AI-based analysis completed."

        return {
            "verdict": verdict,
            "confidence": confidence,
            "facesDetected": len(faces),
            "blurScore": round(blur, 2),
            "noiseScore": round(noise, 2),
            "ai_analysis": ai_text,
            "method": "AI + forensic hybrid analysis"
        }

    except Exception as e:
        return {
            "verdict": "ERROR",
            "confidence": 0,
            "error": str(e)
        }
