import os
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

# ================= EXECUTOR =================

executor = ThreadPoolExecutor()

# ================= GOOGLE FACT CHECK =================

factcheck_api_key = os.getenv("FACTCHECK_API_KEY")

if not factcheck_api_key:
    print("WARNING: FACTCHECK_API_KEY not found")
else:
    print("Google Fact Check API configured")

# ================= MONGODB =================

mongo_uri = os.getenv("MONGO_URI")

db = None

if mongo_uri:
    try:
        client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000
        )

        client.admin.command("ping")

        db = client["frost_db"]

        print("MongoDB connected")

    except Exception as e:
        print(
            f"MongoDB connection failed: {e}"
        )

else:
    print("No MONGO_URI found")
