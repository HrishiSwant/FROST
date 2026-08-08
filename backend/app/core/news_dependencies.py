import os
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
import google.generativeai as genai
from pymongo import MongoClient


load_dotenv()


executor = ThreadPoolExecutor()


# ---------------- GEMINI ----------------

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model_ai = genai.GenerativeModel("gemini-pro")


# ---------------- MONGODB ----------------

mongo_uri = os.getenv("MONGO_URI")

db = None

if mongo_uri:
    try:
        client = MongoClient(mongo_uri)
        db = client["frost_db"]
        print("MongoDB connected")

    except Exception as e:
        print("MongoDB connection failed:", e)
else:
    print("No MONGO_URI found")
