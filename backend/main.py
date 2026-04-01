# ================= IMPORTS =================
import os
import pickle
import requests
import phonenumbers
import re
import logging
from urllib.parse import urlparse

from phonenumbers import carrier, geocoder
from dotenv import load_dotenv
from bs4 import BeautifulSoup

from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

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
    text = re.sub(r"[^a-zA-Z ]", "", text)
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

# ---------------- TRUST SCORE ----------------
def calculate_trust_score(deepfake=None, news=None, phone=None):
    score = 100
    reasons = []

    if deepfake and deepfake.get("verdict") == "FAKE":
        score -= 40
        reasons.append("Deepfake detected")

    if news and news.get("verdict") == "FAKE":
        score -= 30
        reasons.append("Fake news detected")

    if phone and phone.get("fraudScore", 0) > 50:
        score -= 30
        reasons.append("Suspicious phone number")

    risk = "LOW" if score > 70 else "MEDIUM" if score > 40 else "HIGH"

    return {"score": score, "risk": risk, "reasons": reasons}

# ================= APIs =================

# ---------- NEWS ----------
@app.post("/api/news/check")
def news_check(data: NewsInput):
    try:
        if not data.text and not data.url:
            return error("Provide text or URL")

        text = data.text

        if not text and data.url:
            if suspicious_domain(data.url):
                return success({
                    "verdict": "SUSPICIOUS",
                    "confidence": 85
                })

            title, article = scrape(data.url)
            text = f"{title} {article}"

        if not text or len(text) < 10:
            return error("Content too short")

        clean = preprocess(text)
        vec = vectorizer.transform([clean])

        prob = model.predict_proba(vec)[0].max() * 100
        extra, reasons = fake_signals(clean)

        final = min(prob + extra, 100)
        verdict = "FAKE" if final > 65 else "REAL"

        return success({
            "verdict": verdict,
            "confidence": round(final, 2),
            "signals": reasons
        })

    except Exception as e:
        logging.error(f"News error: {e}")
        return error("Internal error")

# ---------- PHONE ----------
@app.post("/api/phone/check")
def phone_check(data: PhoneInput):
    try:
        phone = data.phone.strip()

        if not re.match(r"^\+?[0-9]{10,15}$", phone):
            return error("Invalid phone number")

        score = 0
        reasons = []

        try:
            parsed = phonenumbers.parse(phone)

            carrier_name = carrier.name_for_number(parsed, "en") or "Unknown"
            location = geocoder.description_for_number(parsed, "en") or "Unknown"

            if not phonenumbers.is_valid_number(parsed):
                score += 40
                reasons.append("Invalid number")

        except:
            carrier_name = "Unknown"
            location = "Unknown"
            score += 30
            reasons.append("Parsing failed")

        if phone.endswith(("0000", "9999")):
            score += 15
            reasons.append("Suspicious pattern")

        fraud_score = min(score, 100)

        return success({
            "carrier": carrier_name,
            "location": location,
            "fraudScore": fraud_score,
            "verdict": "HIGH RISK" if fraud_score > 50 else "SAFE",
            "reasons": reasons
        })

    except Exception as e:
        logging.error(f"Phone error: {e}")
        return error("Internal error")

# ---------- DEEPFAKE ----------
@app.post("/api/deepfake/check")
async def deepfake_check(file: UploadFile = File(...)):
    try:
        if not file.content_type.startswith("image/"):
            return error("Upload image only")

        image = await file.read()

        if not image:
            return error("Empty file")

        result = analyze_image(image)

        return success(result)

    except Exception as e:
        logging.error(f"Deepfake error: {e}")
        return error("Internal error")

# ---------- COMBINED ----------
@app.post("/api/analyze-all")
async def analyze_all(
    text: Optional[str] = None,
    phone: Optional[str] = None,
    file: UploadFile = File(None)
):
    try:
        deepfake_result = None
        news_result = None
        phone_result = None

        if file:
            image = await file.read()
            deepfake_result = analyze_image(image)

        if text:
            clean = preprocess(text)
            vec = vectorizer.transform([clean])
            prob = model.predict_proba(vec)[0].max() * 100
            verdict = "FAKE" if prob > 65 else "REAL"

            news_result = {
                "verdict": verdict,
                "confidence": round(prob, 2)
            }

        if phone:
            phone_result = {
                "fraudScore": 70 if len(phone) < 10 else 20,
                "verdict": "HIGH RISK" if len(phone) < 10 else "SAFE"
            }

        trust = calculate_trust_score(
            deepfake=deepfake_result,
            news=news_result,
            phone=phone_result
        )

        return success({
            "deepfake": deepfake_result,
            "news": news_result,
            "phone": phone_result,
            "trust": trust
        })

    except Exception as e:
        logging.error(f"Analyze-all error: {e}")
        return error("Internal error")

# ---------- GLOBAL ERROR ----------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content=error("Something went wrong"),
    )
