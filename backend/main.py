import os
import pickle
import requests
import phonenumbers
import re
from phonenumbers import carrier, geocoder
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from deepfake_detector import analyze_image

load_dotenv()

NYT_API_KEY = os.getenv("NYT_API_KEY")
NUMVERIFY_KEY = os.getenv("NUMVERIFY_KEY")
ABSTRACT_KEY = os.getenv("ABSTRACT_KEY")

app = FastAPI(title="FROST Cyber Security API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)

    with open("vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)

except Exception as e:
    raise RuntimeError(f"ML model or vectorizer missing: {e}")

class NewsInput(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

class PhoneInput(BaseModel):
    phone: str

@app.get("/")
def root():
    return {"message": "FROST API running"}

@app.get("/health")
def health():
    return {"status": "ok"}

def preprocess(text):

    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z ]", "", text)
    text = re.sub(r"\s+", " ", text)

    return text


def fake_news_signals(text):

    score = 0

    keywords = [
        "breaking",
        "shocking",
        "unbelievable",
        "you wont believe",
        "viral",
        "secret",
        "exposed"
    ]

    for k in keywords:
        if k in text:
            score += 5

    if text.count("!") > 3:
        score += 10

    if text.isupper():
        score += 20

    return score


def scrape_article(url: str):

    try:
        res = requests.get(url, timeout=6)
        soup = BeautifulSoup(res.text, "html.parser")
        return " ".join(p.text for p in soup.find_all("p"))[:10000]

    except:
        return ""


@app.post("/api/news/check")
def news_check(data: NewsInput):

    text = data.text

    if not text and data.url:

        text = scrape_article(data.url)

    if not text:

        raise HTTPException(
            status_code=400,
            detail="No news text provided"
        )

    cleaned = preprocess(text)

    vec = vectorizer.transform([cleaned])

    prediction = model.predict(vec)[0]

    ai_score = 70 if prediction == 1 else 20

    signal_score = fake_news_signals(cleaned)

    total = min(ai_score + signal_score, 100)

    verdict = "FAKE" if total >= 60 else "REAL"

    return {
        "verdict": verdict,
        "confidence": total
    }


@app.post("/api/deepfake/check")
async def deepfake_check(file: UploadFile = File(...)):

    if not file.content_type.startswith("image/"):

        raise HTTPException(
            status_code=400,
            detail="Image required"
        )

    image_bytes = await file.read()

    result = analyze_image(image_bytes)

    return result


@app.post("/api/phone/check")
def phone_check(data: PhoneInput):

    phone = data.phone
    score = 0
    reasons = []

    try:

        parsed = phonenumbers.parse(phone)

        carrier_name = carrier.name_for_number(parsed, "en")

        location = geocoder.description_for_number(parsed, "en")

    except:

        carrier_name = "Unknown"

        location = "Unknown"

        score += 20

        reasons.append("Invalid number format")

    try:

        if NUMVERIFY_KEY:

            numverify = requests.get(
                "https://apilayer.net/api/validate",
                params={
                    "access_key": NUMVERIFY_KEY,
                    "number": phone
                },
                timeout=6
            ).json()

            if not numverify.get("valid"):
                score += 40
                reasons.append("Invalid number")

            if numverify.get("line_type") == "voip":
                score += 30
                reasons.append("VOIP number")

    except:
        pass

    if phone.endswith("0000"):

        score += 10
        reasons.append("Suspicious number pattern")

    fraud_score = min(score, 100)

    verdict = "HIGH RISK" if fraud_score >= 60 else "SAFE"

    return {

        "phone": phone,
        "carrier": carrier_name,
        "location": location,
        "fraudScore": fraud_score,
        "verdict": verdict,
        "reasons": reasons
    }
