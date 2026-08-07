# ================= IMPORTS =================
import os
import pickle
import requests
import phonenumbers
import re
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse
from phonenumbers import carrier, geocoder
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from deepfake_detector import analyze_image
from pymongo import MongoClient
from app.api.phone import router as phone_router

#  GEMINI
import google.generativeai as genai

# ---------------- ENV ----------------
load_dotenv()

#  INIT GEMINI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model_ai = genai.GenerativeModel("gemini-pro")

# ---------------- LOGGING ----------------
logging.basicConfig(level=logging.INFO)

# ---------------- APP ----------------
app = FastAPI(title="FROST Cyber Security API")
app.include_router(phone_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- RATE LIMIT ----------------
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# ---------------- ASYNC EXECUTOR ----------------
executor = ThreadPoolExecutor()

# ---------------- LOAD ML MODELS ----------------
#  Safe loading to prevent startup crash
try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)
    with open("vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)
    print(" ML models loaded successfully")
except FileNotFoundError:
    print(" ERROR: model.pkl or vectorizer.pkl not found!")
    model = None
    vectorizer = None
except Exception as e:
    print(f" ERROR loading ML models: {e}")
    model = None
    vectorizer = None

# ---------------- RESPONSE FORMAT ----------------
def success(data):
    return {"success": True, "data": data}


def error(msg):
    return {"success": False, "error": msg}


# ---------------- SCHEMAS ----------------
class NewsInput(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None





# ---------------- ROOT ----------------
@app.get("/")
def root():
    return {"status": "FROST backend running"}


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------- HELPERS ----------------
def preprocess(text):
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z ]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def fake_signals(text):
    score = 0
    reasons = []
    keywords = ["breaking", "shocking", "viral", "exposed"]

    for k in keywords:
        if k in text:
            score += 10
            reasons.append(f"Clickbait keyword: {k}")

    if text.count("!") > 2:
        score += 10
        reasons.append("Excessive punctuation")

    return score, reasons


def scrape(url):
    try:
        res = requests.get(url, timeout=5)
        soup = BeautifulSoup(res.text, "html.parser")
        title = soup.title.get_text() if soup.title else ""
        text = " ".join([p.get_text() for p in soup.find_all("p")])
        return title, text[:3000]
    except Exception as e:
        logging.error(f"Scrape error: {e}")
        return "", ""


def suspicious_domain(url):
    bad = ["clickbait", "fake", "viral", "rumor"]
    domain = urlparse(url).netloc.lower()
    return any(x in domain for x in bad)


# ---------------- MONGO DB ----------------
mongo_uri = os.getenv("MONGO_URI")
if mongo_uri:
    try:
        client = MongoClient(mongo_uri)
        db = client["frost_db"]
        print(" MongoDB connected")
    except Exception as e:
        print(" MongoDB connection failed:", e)
        db = None
else:
    print("⚠️ No MONGO_URI found")
    db = None


# ================= NEWS API =================
@app.post("/api/news/check")
@limiter.limit("10/minute")
async def news_check(request: Request, data: NewsInput):
    try:
        if not data.text and not data.url:
            return error("Provide text or URL")

        loop = asyncio.get_event_loop()
        text = data.text

        # ---------------- URL HANDLING ----------------
        if not text and data.url:
            if suspicious_domain(data.url):
                return success({
                    "answer": "This source appears suspicious.\n\nThe domain is commonly associated with misleading content."
                })

            title, article = await loop.run_in_executor(executor, scrape, data.url)
            text = f"{title} {article}"

        if not text:
            return error("No content")

        #  Mongo log - Request
        if db:
            db.logs.insert_one({
                "type": "news_check",
                "input": text
            })

        # ================= 🔥 FROST AI (GEMINI PRIMARY) =================
        try:
            response = model_ai.generate_content(
                f"""
                You are FROST AI (Fake Resistance & Online Security Tech assistant).
                Analyze the following news and:
                1. Verdict: REAL or FAKE
                2. Explain why
                3. Give confidence score (0-100%)
                News:
                {text}
                """
            )

            #  Mongo log - Response
            if db:
                db.logs.insert_one({
                    "type": "news_check",
                    "input": text,
                    "response": response.text
                })

            return success({"answer": response.text})

        except Exception as ai_error:
            logging.error(f"Gemini failed, using ML fallback: {ai_error}")

        # ================= ML FALLBACK =================
        try:
            response = model_ai.generate_content(
                f"""
                You are FROST AI, a smart and conversational assistant.
                Talk naturally like ChatGPT.
                If the statement is factual, confirm it clearly.
                If it's false or misleading, explain politely.
                Keep answers simple and human-like.
                User input:
                {text}
                """
            )
            return success({"answer": response.text})
        except Exception as ai_error:
            logging.error(f"Gemini failed: {ai_error}")
            return error("AI service temporarily unavailable")

    except Exception as e:
        logging.error(f"News error: {e}")
        return error("Internal error")


# ================= PHONE API =================
#  @app.post("/api/phone/check")
# # @limiter.limit("15/minute")
# def phone_check(request: Request, data: PhoneInput):
#     try:
#         phone = data.phone.strip()

#         if not re.match(r"^\+?[0-9]{10,15}$", phone):
#             return error("Invalid phone number")

#         reasons = []
#         score = 0
#         carrier_name = "Unknown"
#         location = "Unknown"

#         try:
#             # Parse with India as default region (better for Indian numbers)
#             parsed = phonenumbers.parse(phone, "IN")
#             is_valid = phonenumbers.is_valid_number(parsed)
#             is_possible = phonenumbers.is_possible_number(parsed)

#             carrier_name = carrier.name_for_number(parsed, "en") or "Indian Mobile Network"
#             location = geocoder.description_for_number(parsed, "en") or "India"

#             if not is_valid:
#                 score += 40
#                 reasons.append("Invalid number")

#             if not is_possible:
#                 score += 30
#                 reasons.append("Unusual number format")

#         except Exception:
#             score += 30
#             reasons.append("Parsing failed")

#         if phone.endswith(("0000", "9999", "1234")):
#             score += 20
#             reasons.append("Suspicious pattern")

#         if len(phone.replace("+", "")) < 10:
#             score += 20
#             reasons.append("Too short")

#         fraud_score = min(score, 100)

#         if fraud_score > 60:
#             answer = "This phone number appears risky.\n\n"
#         elif fraud_score > 30:
#             answer = "This phone number looks suspicious.\n\n"
#         else:
#             answer = "This phone number appears safe.\n\n"

#         answer += f"Carrier: {carrier_name}\nLocation: {location}\n"

#         if reasons:
#             answer += "\nObservations:\n"
#             for r in reasons:
#                 answer += f"• {r}\n"

#         answer += f"\nRisk Score: {fraud_score}%"

#         return success({
#             "answer": answer,
#             "carrier": carrier_name,
#             "location": location,
#             "fraud_score": fraud_score,
#             "reasons": reasons
#         })

#     except Exception as e:
#         logging.error(f"Phone error: {e}")
#         return error("Internal error") 


# ================= DEEPFAKE API =================
@app.post("/api/deepfake/check")
@limiter.limit("5/minute")
async def deepfake_check(request: Request, file: UploadFile = File(...)):
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            return error("Upload image only")

        image_bytes = await file.read()
        if not image_bytes:
            return error("Empty file")

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            executor, analyze_image, image_bytes
        )

        # Build clean response
        ai_analysis = result.get("ai_analysis", "Analysis not available")
        confidence = result.get("confidence", 0)
        faces = result.get("facesDetected", 0)
        verdict = result.get("verdict", "ERROR")
        blur_score = result.get("blurScore")

        answer = f"{ai_analysis}\n\n"
        answer += f"Verdict: {verdict}\n"
        answer += f"Confidence: {confidence}%\n"
        answer += f"Faces Detected: {faces}\n"
        if blur_score is not None:
            answer += f"Blur Score: {blur_score}\n"

        return success({
            "answer": answer,
            "verdict": verdict,
            "confidence": confidence,
            "facesDetected": faces,
            "blurScore": blur_score
        })

    except Exception as e:
        logging.error(f"Deepfake error: {e}")
        return error("Internal error")


# ================= GLOBAL ERROR =================
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content=error("Something went wrong"),
    )
