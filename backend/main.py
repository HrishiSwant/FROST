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

# ---------------- ENV ----------------
load_dotenv()

# ---------------- LOGGING ----------------
logging.basicConfig(level=logging.INFO)

# ---------------- APP ----------------
app = FastAPI(title="FROST Cyber Security API")

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

# ---------------- LOAD ML ----------------
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# ---------------- RESPONSE FORMAT ----------------
def success(data):
    return {"success": True, "data": data}

def error(msg):
    return {"success": False, "error": msg}

# ---------------- SCHEMAS ----------------
class NewsInput(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

class PhoneInput(BaseModel):
    phone: str

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

# ================= NEWS API =================
@app.post("/api/news/check")
@limiter.limit("10/minute")
async def news_check(request: Request, data: NewsInput):
    try:
        if not data.text and not data.url:
            return error("Provide text or URL")

        loop = asyncio.get_event_loop()
        text = data.text

        if not text and data.url:
            if suspicious_domain(data.url):
                return success({
                    "verdict": "SUSPICIOUS",
                    "confidence": 85,
                    "signals": ["Suspicious domain detected"],
                    "explanation": "The source domain appears commonly associated with misleading or low-trust content."
                })

            title, article = await loop.run_in_executor(
                executor, scrape, data.url
            )
            text = f"{title} {article}"

        if not text or len(text) < 10:
            return error("Content too short")

        clean = preprocess(text)

        vec = await loop.run_in_executor(
            executor, vectorizer.transform, [clean]
        )

        probs = model.predict_proba(vec)[0]
        confidence = max(probs) * 100

        if confidence < 60:
            confidence += 10
        elif confidence > 90:
            confidence -= 5

        extra, reasons = fake_signals(clean)

        final = min(confidence + extra, 100)
        verdict = "FAKE" if probs[0] > probs[1] else "REAL"

        explanation = (
            "This content appears misleading. It contains patterns often found in sensational or unverified news."
            if verdict == "FAKE"
            else "This content appears reliable. The language and structure match credible news patterns."
        )

        return success({
            "verdict": verdict,
            "confidence": round(final, 2),
            "signals": reasons,
            "explanation": explanation
        })

    except Exception as e:
        logging.error(f"News error: {e}")
        return error("Internal error")
