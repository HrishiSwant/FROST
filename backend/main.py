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

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from deepfake_detector import analyze_image

# ---------------- ENV ----------------
load_dotenv()

NYT_API_KEY = os.getenv("NYT_API_KEY")
NUMVERIFY_KEY = os.getenv("NUMVERIFY_KEY")
FACTCHECK_API_KEY = os.getenv("FACTCHECK_API_KEY")

# ---------------- LOGGING ----------------
logging.basicConfig(level=logging.INFO)

# ---------------- APP ----------------
app = FastAPI(title="FROST Cyber Security API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- LOAD ML MODEL ----------------
try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)
    with open("vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)
    logging.info("✅ Fake news ML model loaded successfully")
except Exception as e:
    logging.error(f"Failed to load ML model: {e}")
    raise RuntimeError(f"ML model or vectorizer missing: {e}")

# ---------------- SCHEMAS ----------------
class NewsInput(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

class PhoneInput(BaseModel):
    phone: str

class ThreatInput(BaseModel):
    text: Optional[str] = None
    phone: Optional[str] = None

# ---------------- ROOT & HEALTH ----------------
@app.get("/")
def root():
    return {
        "message": "FROST Cyber Security API running",
        "features": [
            "Fake News Detection",
            "Deepfake Detection",
            "Phone Scam Detection"
        ]
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/system/status")
def system_status():
    return {
        "api": "running",
        "fake_news_model": "loaded",
        "deepfake_detector": "ready",
        "phone_detection": "active"
    }

# ---------------- HELPER FUNCTIONS ----------------
def preprocess(text: str):
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z ]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def fake_news_signals(text: str):
    score = 0
    signals = []

    keywords = ["breaking", "shocking", "unbelievable", "you wont believe", "viral", "secret", "exposed"]

    for k in keywords:
        if k in text:
            score += 5
            signals.append(f"Clickbait keyword detected: {k}")

    if text.count("!") > 3:
        score += 10
        signals.append("Excessive exclamation marks")

    if text.isupper():
        score += 20
        signals.append("All caps headline")

    return score, signals

def scrape_article(url: str):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")

        headline = soup.title.get_text().strip() if soup.title else ""
        paragraphs = soup.find_all("p")
        text = " ".join(p.get_text() for p in paragraphs)

        return headline, text[:10000]
    except Exception as e:
        logging.error(f"Article scraping failed: {e}")
        return "", ""

def check_domain(url: str):
    domain = urlparse(url).netloc.lower()
    suspicious = ["clickbait", "viralnews", "fakeupdate", "rumor", "gossip"]
    return any(s in domain for s in suspicious)

def google_fact_check(query: str):
    if not FACTCHECK_API_KEY:
        return None
    try:
        res = requests.get(
            "https://factchecktools.googleapis.com/v1alpha1/claims:search",
            params={"query": query[:200], "key": FACTCHECK_API_KEY},
            timeout=8
        )
        data = res.json()
        claims = data.get("claims")
        if claims:
            review = claims[0]["claimReview"][0]
            return {
                "publisher": review["publisher"]["name"],
                "rating": review["textualRating"],
                "url": review["url"]
            }
    except Exception as e:
        logging.error(f"Fact check API error: {e}")
    return None

def build_report(verdict, confidence, signals, headline="", source=None, rating=None):
    return {
        "verdict": verdict,
        "confidence": round(confidence, 1),
        "headline": headline,
        "signals": signals,
        "source": source,
        "originalRating": rating
    }

# ---------------- NEWS CHECK ----------------
@app.post("/api/news/check")
def news_check(data: NewsInput):
    text = data.text
    headline = ""

    if not text and data.url:
        if check_domain(data.url):
            verdict = "SUSPICIOUS"
            log_request("fake_news", verdict)
            return build_report(
                verdict, 85, ["Domain flagged as suspicious source"]
            )

        headline, article = scrape_article(data.url)
        text = headline + " " + article

    if not text:
        raise HTTPException(status_code=400, detail="No news text or URL provided")

    # Google Fact Check (if available)
    fact = google_fact_check(text)
    if fact:
        rating = fact["rating"].lower()
        if "true" in rating and "mostly" not in rating:
            verdict = "REAL"
        elif "mostly true" in rating:
            verdict = "REAL"
        elif "half" in rating or "mixed" in rating:
            verdict = "SUSPICIOUS"
        else:
            verdict = "FAKE"

        log_request("fake_news", verdict)
        return build_report(
            verdict, 95,
            ["Matched verified fact-check database"],
            headline, fact["publisher"], fact["rating"]
        )

    # ML Model Prediction
    cleaned = preprocess(text)
    vec = vectorizer.transform([cleaned])
    prediction = model.predict(vec)[0]
    probability = model.predict_proba(vec)[0].max() * 100

    signal_score, signals = fake_news_signals(cleaned)
    total = min(probability + signal_score, 100)

    if total >= 65:
        verdict = "FAKE"
    elif total >= 35:
        verdict = "SUSPICIOUS"
    else:
        verdict = "REAL"

    log_request("fake_news", verdict)

    return build_report(verdict, total, signals, headline)

# ---------------- DEEPFAKE CHECK ----------------
@app.post("/api/deepfake/check")
async def deepfake_check(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Image file required")

    image_bytes = await file.read()
    result = analyze_image(image_bytes)

    log_request("deepfake", result.get("verdict", "UNKNOWN"))
    return result

# ---------------- PHONE SCAM CHECK ----------------
@app.post("/api/phone/check")
def phone_check(data: PhoneInput):
    phone = data.phone.strip()
    score = 0
    reasons = []

    try:
        parsed = phonenumbers.parse(phone)
        carrier_name = carrier.name_for_number(parsed, "en") or "Unknown"
        location = geocoder.description_for_number(parsed, "en") or "Unknown"
    except:
        carrier_name = "Unknown"
        location = "Unknown"
        score += 25
        reasons.append("Invalid number format")

    # NumVerify API
    try:
        if NUMVERIFY_KEY:
            numverify = requests.get(
                "https://apilayer.net/api/validate",
                params={"access_key": NUMVERIFY_KEY, "number": phone},
                timeout=8
            ).json()

            if not numverify.get("valid"):
                score += 40
                reasons.append("Invalid number")
            if numverify.get("line_type") == "voip":
                score += 35
                reasons.append("VOIP / Virtual number detected")
    except Exception as e:
        logging.error(f"Numverify API failed: {e}")

    if phone.endswith("0000") or phone.endswith("1111"):
        score += 15
        reasons.append("Suspicious repeating pattern")

    fraud_score = min(score, 100)
    verdict = "HIGH RISK" if fraud_score >= 60 else "SAFE"

    log_request("phone", verdict)

    return {
        "carrier": carrier_name,
        "location": location,
        "fraudScore": fraud_score,
        "verdict": verdict,
        "reasons": reasons
    }

# ---------------- DASHBOARD ----------------
@app.get("/api/dashboard")
def frost_dashboard():
    total_checks = (
        analytics["fakeNewsChecks"] +
        analytics["deepfakeChecks"] +
        analytics["phoneChecks"]
    )

    threat_score = min(
        analytics["fakeDetected"] * 5 +
        analytics["deepfakeDetected"] * 10 +
        analytics["scamPhonesDetected"] * 4,
        100
    )

    return {
        "system": "FROST Intelligence Dashboard",
        "fakeNews": {
            "checks": analytics["fakeNewsChecks"],
            "fakeDetected": analytics["fakeDetected"]
        },
        "deepfake": {
            "checks": analytics["deepfakeChecks"],
            "deepfakesDetected": analytics["deepfakeDetected"]
        },
        "phoneScams": {
            "checks": analytics["phoneChecks"],
            "scamsDetected": analytics["scamPhonesDetected"]
        },
        "globalThreatScore": threat_score,
        "totalAnalyses": total_checks
    }
