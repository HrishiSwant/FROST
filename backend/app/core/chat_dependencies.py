import os

from dotenv import load_dotenv
from google import genai

load_dotenv()


# ================= GEMINI =================

gemini_api_key = os.getenv("GEMINI_API_KEY")

if not gemini_api_key:
    print("WARNING: GEMINI_API_KEY not found")

    ai_client = None

else:
    try:
        ai_client = genai.Client(
            api_key=gemini_api_key
        )

        print("Gemini client initialized for FROST AI")

    except Exception as e:
        print(
            f"Gemini initialization failed: {e}"
        )

        ai_client = None
