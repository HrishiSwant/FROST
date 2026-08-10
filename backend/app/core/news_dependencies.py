from concurrent.futures import ThreadPoolExecutor

import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

# ================= EXECUTOR =================

executor = ThreadPoolExecutor()

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
