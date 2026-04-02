import cv2
import numpy as np
from PIL import Image
import io
import google.generativeai as genai

# Load face detector (Haar Cascade)
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Initialize Gemini model
model = genai.GenerativeModel("gemini-pro")


def analyze_image(image_bytes: bytes):
    try:
        # Convert bytes to image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = np.array(image)
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

        # Detect faces (OPTIONAL now)
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.2,
            minNeighbors=5,
            minSize=(50, 50)
        )

        # Basic forensic checks
        blur = cv2.Laplacian(gray, cv2.CV_64F).var()
        noise = np.std(gray)

        # ---------------- GEMINI ANALYSIS (MAIN) ----------------
        try:
            response = model.generate_content([
                "Analyze this image. Determine if it is real, AI-generated, or manipulated. "
                "Give a clear verdict (REAL, FAKE, or SUSPICIOUS) and a short explanation.",
                image
            ])

            ai_text = response.text.lower()

            # ---------------- VERDICT FROM AI ----------------
            if "fake" in ai_text or "ai-generated" in ai_text:
                verdict = "FAKE"
                confidence = 75
            elif "suspicious" in ai_text or "uncertain" in ai_text:
                verdict = "SUSPICIOUS"
                confidence = 55
            else:
                verdict = "REAL"
                confidence = 70

        except Exception as e:
            ai_text = f"AI analysis failed: {str(e)}"
            verdict = "UNKNOWN"
            confidence = 0

        # ---------------- QUALITY ADJUSTMENT ----------------
        if blur < 40:
            confidence = max(30, confidence - 20)

        return {
            "verdict": verdict,
            "confidence": confidence,
            "facesDetected": len(faces),
            "blurScore": round(blur, 2),
            "noiseScore": round(noise, 2),
            "ai_analysis": ai_text,
            "method": "AI primary + forensic support"
        }

    except Exception as e:
        return {
            "verdict": "ERROR",
            "confidence": 0,
            "error": str(e)
        }
