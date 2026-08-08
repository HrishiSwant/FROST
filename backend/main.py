# ================= IMPORTS =================

import os
import pickle
import logging
import asyncio

from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from slowapi import Limiter
from slowapi.util import get_remote_address

from deepfake_detector import analyze_image
from pymongo import MongoClient



from app.api.phone import router as phone_router
from app.api.news import router as news_router


# ================= ENV =================

load_dotenv()

# ================= LOGGING =================

logging.basicConfig(level=logging.INFO)


# ================= APP =================

app = FastAPI(
    title="FROST Cyber Security API"
)


# ================= API ROUTERS =================

app.include_router(phone_router)
app.include_router(news_router)


# ================= CORS =================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= RATE LIMIT =================

limiter = Limiter(
    key_func=get_remote_address
)

app.state.limiter = limiter


# ================= ASYNC EXECUTOR =================

executor = ThreadPoolExecutor()


# ================= LOAD ML MODELS =================

# Safe loading to prevent startup crash

try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)

    with open("vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)

    print("ML models loaded successfully")

except FileNotFoundError:
    print("ERROR: model.pkl or vectorizer.pkl not found!")

    model = None
    vectorizer = None

except Exception as e:
    print(f"ERROR loading ML models: {e}")

    model = None
    vectorizer = None


# ================= MONGO DB =================

mongo_uri = os.getenv("MONGO_URI")

if mongo_uri:
    try:
        client = MongoClient(mongo_uri)

        db = client["frost_db"]

        print("MongoDB connected")

    except Exception as e:
        print("MongoDB connection failed:", e)

        db = None

else:
    print("No MONGO_URI found")

    db = None


# ================= ROOT =================

@app.get("/")
def root():
    return {
        "status": "FROST backend running"
    }


# ================= HEALTH =================

@app.get("/health")
def health():
    return {
        "status": "ok"
    }


# ================= DEEPFAKE API =================

@app.post("/api/deepfake/check")
@limiter.limit("5/minute")
async def deepfake_check(
    request: Request,
    file: UploadFile = File(...)
):
    try:

        # ---------------- FILE VALIDATION ----------------

        if (
            not file.content_type
            or not file.content_type.startswith("image/")
        ):
            return {
                "success": False,
                "error": "Upload image only"
            }

        # ---------------- READ IMAGE ----------------

        image_bytes = await file.read()

        if not image_bytes:
            return {
                "success": False,
                "error": "Empty file"
            }

        # ---------------- IMAGE ANALYSIS ----------------

        loop = asyncio.get_event_loop()

        result = await loop.run_in_executor(
            executor,
            analyze_image,
            image_bytes
        )

        # ---------------- RESULT ----------------

        ai_analysis = result.get(
            "ai_analysis",
            "Analysis not available"
        )

        confidence = result.get(
            "confidence",
            0
        )

        faces = result.get(
            "facesDetected",
            0
        )

        verdict = result.get(
            "verdict",
            "ERROR"
        )

        blur_score = result.get(
            "blurScore"
        )

        # ---------------- BUILD RESPONSE ----------------

        answer = f"{ai_analysis}\n\n"

        answer += f"Verdict: {verdict}\n"

        answer += f"Confidence: {confidence}%\n"

        answer += f"Faces Detected: {faces}\n"

        if blur_score is not None:
            answer += f"Blur Score: {blur_score}\n"

        return {
            "success": True,
            "data": {
                "answer": answer,
                "verdict": verdict,
                "confidence": confidence,
                "facesDetected": faces,
                "blurScore": blur_score
            }
        }

    except Exception as e:

        logging.error(
            f"Deepfake error: {e}"
        )

        return {
            "success": False,
            "error": "Internal error"
        }


# ================= GLOBAL ERROR =================

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):

    logging.error(
        f"Unhandled error: {exc}"
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Something went wrong"
        }
    )
