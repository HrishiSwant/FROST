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

    logging.info("Fake news ML model loaded successfully")
    
except Exception as e:
    logging.error("Failed to load ML model")
    raise RuntimeError(f"ML model or vectorizer missing: {e}")
    

# ---------------- SCHEMAS ----------------

class NewsInput(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

class PhoneInput(BaseModel):
    phone: str

# ---------------- ROOT ----------------

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

# ---------------- TEXT CLEANING ----------------

def preprocess(text):

```
text = text.lower()
text = re.sub(r"http\S+", "", text)
text = re.sub(r"[^a-zA-Z ]", "", text)
text = re.sub(r"\s+", " ", text)

return text.strip()
```

# ---------------- FAKE NEWS SIGNALS ----------------

def fake_news_signals(text):

```
score = 0
signals = []

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
        signals.append(f"Clickbait keyword detected: {k}")

if text.count("!") > 3:
    score += 10
    signals.append("Excessive exclamation marks")

if text.isupper():
    score += 20
    signals.append("All caps headline")

return score, signals
```

# ---------------- SCRAPE ARTICLE ----------------

def scrape_article(url: str):

```
try:

    headers = {"User-Agent": "Mozilla/5.0"}

    res = requests.get(url, headers=headers, timeout=8)

    soup = BeautifulSoup(res.text, "html.parser")

    headline = ""
    if soup.title:
        headline = soup.title.get_text().strip()

    paragraphs = soup.find_all("p")

    text = " ".join(p.get_text() for p in paragraphs)

    return headline, text[:10000]

except Exception as e:

    logging.error(f"Article scraping failed: {e}")
    return "", ""
```

# ---------------- DOMAIN CHECK ----------------

def check_domain(url):

```
domain = urlparse(url).netloc.lower()

suspicious = [
    "clickbait",
    "viralnews",
    "fakeupdate",
    "rumor",
    "gossip"
]

for s in suspicious:
    if s in domain:
        return True

return False
```

# ---------------- GOOGLE FACT CHECK ----------------

def google_fact_check(query):

```
if not FACTCHECK_API_KEY:
    return None

try:

    res = requests.get(
        "https://factchecktools.googleapis.com/v1alpha1/claims:search",
        params={
            "query": query[:200],
            "key": FACTCHECK_API_KEY
        },
        timeout=6
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

return None
```

# ---------------- BUILD REPORT ----------------

def build_report(verdict, confidence, signals, headline="", source=None, rating=None):

```
return {
    "verdict": verdict,
    "confidence": round(confidence, 2),
    "headline": headline,
    "signals": signals,
    "source": source,
    "originalRating": rating
}
```

# ---------------- NEWS CHECK ----------------

@app.post("/api/news/check")
def news_check(data: NewsInput):

```
text = data.text
headline = ""

if not text and data.url:

    if check_domain(data.url):

        return build_report(
            "SUSPICIOUS",
            85,
            ["Domain flagged as suspicious source"],
            headline=""
        )

    headline, article = scrape_article(data.url)

    text = headline + " " + article

if not text:
    raise HTTPException(
        status_code=400,
        detail="No news text provided"
    )

# -------- FACT CHECK DATABASE --------

fact = google_fact_check(text)

if fact:

    rating = fact["rating"].lower()

    if "true" in rating and "mostly" not in rating:
        verdict = "REAL"

    elif "mostly true" in rating:
        verdict = "REAL"

    elif "half" in rating:
        verdict = "SUSPICIOUS"

    else:
        verdict = "FAKE"

    return build_report(
        verdict,
        95,
        ["Matched verified fact-check database"],
        headline,
        fact["publisher"],
        fact["rating"]
    )

# -------- ML MODEL --------

cleaned = preprocess(text)

vec = vectorizer.transform([cleaned])

prediction = model.predict(vec)[0]

probability = model.predict_proba(vec)[0].max() * 100

signal_score, signals = fake_news_signals(cleaned)

total = min(probability + signal_score, 100)

if total >= 60:
    verdict = "FAKE"

elif total >= 30:
    verdict = "SUSPICIOUS"

else:
    verdict = "UNKNOWN"
    signals.append("Low confidence classification")

return build_report(
    verdict,
    total,
    signals,
    headline
)
```

# ---------------- DEEPFAKE CHECK ----------------

@app.post("/api/deepfake/check")
async def deepfake_check(file: UploadFile = File(...)):

```
if not file.content_type.startswith("image/"):

    raise HTTPException(
        status_code=400,
        detail="Image required"
    )

image_bytes = await file.read()

result = analyze_image(image_bytes)

return result
```

# ---------------- PHONE SCAM CHECK ----------------

@app.post("/api/phone/check")
def phone_check(data: PhoneInput):

```
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

except Exception as e:
    logging.error(f"Numverify API failed: {e}")

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
```



