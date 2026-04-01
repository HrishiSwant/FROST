import os
import pickle
import requests
import phonenumbers
import re
import logging
from urllib.parse import urlparse

from analytics import analytics, log_request
from phonenumbers import carrier, geocoder
from dotenv import load_dotenv
from bs4 import BeautifulSoup

from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from deepfake_detector import analyze_image

# 🔥 MongoDB + IP
from db import logs
from utils import get_ip_info

# ---------------- ENV ----------------
load_dotenv()
NUMVERIFY_KEY = os.getenv("NUMVERIFY_KEY")

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

# ---------------- LOAD ML MODEL ----------------
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

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


# ---------------- VALIDATION ----------------
def validate_text(text):
    if not text or len(text) < 5:
        raise HTTPException(status_code=400, detail="Invalid text input")
    if len(text) > 1000:
        raise HTTPException(status_code=400, detail="Text too long")


def validate_phone(phone):
    if not re.match(r"^\+?[0-9]{10,15}$", phone):
        raise HTTPException(status_code=400, detail="Invalid phone number")


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

        return title, text[:5000]
    except:
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

    if score > 70:
        risk = "LOW"
    elif score > 40:
        risk = "MEDIUM"
    else:
        risk = "HIGH"

    return {
        "score": score,
        "risk": risk,
        "reasons": reasons
    }


# ---------------- NEWS ----------------
@app.post("/api/news/check")
def news_check(data: NewsInput, request: Request):
    ip = request.client.host
    geo = get_ip_info(ip)

    if data.url and suspicious_domain(data.url):
        result = {"verdict": "SUSPICIOUS", "confidence": 85}
        return result

    text = data.text

    if not text and data.url:
        title, article = scrape(data.url)
        text = title + " " + article

    validate_text(text)

    clean = preprocess(text)
    vec = vectorizer.transform([clean])

    prob = model.predict_proba(vec)[0].max() * 100
    extra_score, reasons = fake_signals(clean)

    final = min(prob + extra_score, 100)
    verdict = "FAKE" if final > 65 else "REAL"

    return {
        "verdict": verdict,
        "confidence": round(final, 2),
        "signals": reasons
    }


# ---------------- PHONE ----------------
@app.post("/api/phone/check")
def phone_check(data: PhoneInput):
    phone = data.phone.strip()
    validate_phone(phone)

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
        score += 30
        carrier_name = "Unknown"
        location = "Unknown"

    if phone.endswith(("0000", "9999")):
        score += 15
        reasons.append("Suspicious pattern")

    fraud_score = min(score, 100)

    return {
        "carrier": carrier_name,
        "location": location,
        "fraudScore": fraud_score,
        "verdict": "HIGH RISK" if fraud_score > 50 else "SAFE",
        "reasons": reasons
    }


# ---------------- DEEPFAKE ----------------
@app.post("/api/deepfake/check")
async def deepfake_check(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload image only")

    image = await file.read()
    return analyze_image(image)


# ---------------- COMBINED ANALYSIS ----------------
@app.post("/api/analyze-all")
async def analyze_all(
    text: Optional[str] = None,
    phone: Optional[str] = None,
    file: UploadFile = File(None)
):
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
        try:
            parsed = phonenumbers.parse(phone)
            fraud_score = 20
            if not phonenumbers.is_valid_number(parsed):
                fraud_score += 50

            phone_result = {
                "fraudScore": fraud_score,
                "verdict": "HIGH RISK" if fraud_score > 50 else "SAFE"
            }
        except:
            phone_result = {
                "fraudScore": 70,
                "verdict": "HIGH RISK"
            }

    trust = calculate_trust_score(
        deepfake=deepfake_result,
        news=news_result,
        phone=phone_result
    )

    return {
        "deepfake": deepfake_result,
        "news": news_result,
        "phone": phone_result,
        "trust": trust
    }
