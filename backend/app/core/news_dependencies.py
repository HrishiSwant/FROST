import os
from concurrent.futures import ThreadPoolExecutor

import google.generativeai as genai
from pymongo import MongoClient


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
