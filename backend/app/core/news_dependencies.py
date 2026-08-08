import os
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
from google import genai
from pymongo import MongoClient


load_dotenv()


# ================= EXECUTOR =================

executor = ThreadPoolExecutor()


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

        print("Gemini client initialized")

    except Exception as e:
        print(f"Gemini initialization failed: {e}")

        ai_client = None


# ================= MONGODB =================

mongo_uri = os.getenv("MONGO_URI")

db = None

if mongo_uri:

    try:
        client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000
        )

        # Force connection check
        client.admin.command("ping")

        db = client["frost_db"]

        print("MongoDB connected")

    except Exception as e:

        print(
            f"MongoDB connection failed: {e}"
        )

else:

    print("No MONGO_URI found")
