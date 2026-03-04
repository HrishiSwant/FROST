import os
import pickle
import requests
import phonenumbers
from phonenumbers import carrier, geocoder
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from deepfake_detector import analyze_image

# ------------------- ENV -------------------

load_dotenv()

NYT_API_KEY = os.getenv("NYT_API_KEY")
NUMVERIFY_KEY = os.getenv("NUMVERIFY_KEY")
ABSTRACT_KEY = os.getenv("ABSTRACT_KEY")

# ------------------- APP -------------------

app = FastAPI(title="FROST Cyber Security API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://frost1-ruddy.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- LOAD ML MODELS -------------------

try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)

    with open("vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)

except Exception as e:
    raise RuntimeError(f"ML model or vectorizer missing: {e}")

# ------------------- SCHEMAS -------------------

class NewsInput(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

class PhoneInput(BaseModel):
    phone: str

# ------------------- ROOT -------------------

@app.get("/")
def root():
    return {
        "message": "FROST Cyber Security API running",
        "features": [
            "Fake News Detection",
            "Deepfake Detection",
            "Phone Scam Risk Detection"
        ]
    }

# ------------------- HEALTH CHECK -------------------

@app.get("/health")
def health():
    return {"status": "running"}

# ------------------- NEWS UTILITIES -------------------

def scrape_article(url: str) -> str:
    try:
        res = requests.get(url, timeout=6)
        soup = BeautifulSoup(res.text, "html.parser")
        return " ".join(p.text for p in soup.find_all("p"))[:10000]
    except:
        return ""

def fetch_from_nytimes(url: str) -> str:
    if not NYT_API_KEY:
        return ""

    try:
        keywords = url.split("/")[-1].replace("-", " ")

        res = requests.get(
            "https://api.nytimes.com/svc/search/v2/articlesearch.json",
            params={
                "q": keywords,
                "api-key": NYT_API_KEY
            },
            timeout=6
        )

        docs = res.json().get("response", {}).get("docs", [])

        return docs[0]["abstract"] if docs else ""

    except:
        return ""

# ------------------- NEWS CHECK -------------------

@app.post("/api/news/check")
def news_check(data: NewsInput):

    text = data.text

    if not text and data.url:
        text = scrape_article(data.url)

        if not text:
            text = fetch_from_nytimes(data.url)

    if not text:
        raise HTTPException(
            status_code=400,
            detail="No news text provided"
        )

    vec = vectorizer.transform([text])

    prediction = model.predict(vec)[0]

    verdict = "FAKE" if prediction == 1 else "REAL"

    return {
        "verdict": verdict,
        "confidence": 85
    }

# ------------------- DEEPFAKE CHECK -------------------

@app.post("/api/deepfake/check")
async def deepfake_check(file: UploadFile = File(...)):

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Image file required"
        )

    image_bytes = await file.read()

    result = analyze_image(image_bytes)

    return {
        "filename": file.filename,
        "verdict": result["verdict"],
        "confidence": result["confidence"]
    }

# ------------------- PHONE SCAM CHECK -------------------

@app.post("/api/phone/check")
def phone_check(data: PhoneInput):

    try:

        phone = data.phone
        score = 0
        reasons = []

        # ---------------- LOCAL PHONE ANALYSIS ----------------

        try:
            parsed = phonenumbers.parse(phone)

            carrier_name = carrier.name_for_number(parsed, "en")
            location = geocoder.description_for_number(parsed, "en")

        except:
            carrier_name = "Unknown"
            location = "Unknown"
            score += 20
            reasons.append("Invalid number format")

        # ---------------- NUMVERIFY API ----------------

        numverify = {}
        if NUMVERIFY_KEY:
            try:
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

        # ---------------- ABSTRACT API ----------------

        abstract = {}
        if ABSTRACT_KEY:
            try:
                abstract = requests.get(
                    "https://phonevalidation.abstractapi.com/v1/",
                    params={
                        "api_key": ABSTRACT_KEY,
                        "phone": phone
                    },
                    timeout=6
                ).json()

                if abstract.get("is_disposable"):
                    score += 30
                    reasons.append("Disposable number")

            except:
                pass

        # ---------------- PATTERN ANALYSIS ----------------

        if phone.endswith("0000"):
            score += 10
            reasons.append("Suspicious number pattern")

        # ---------------- FINAL RESULT ----------------

        fraud_score = min(score, 100)

        verdict = "HIGH RISK" if fraud_score >= 60 else "SAFE"

        return {

            "phone": phone,

            "carrier": carrier_name,

            "location": location,

            "lineType": numverify.get("line_type"),

            "fraudScore": fraud_score,

            "verdict": verdict,

            "reasons": reasons
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Phone lookup failed: {e}"
        )
