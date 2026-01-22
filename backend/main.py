import os
import pickle
import bcrypt
import requests
from supabase import create_client
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

# ✅ Deepfake detector
from deepfake_detector import analyze_image

# ------------------- ENV -------------------

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
NYT_API_KEY = os.getenv("NYT_API_KEY")
NUMVERIFY_KEY = os.getenv("NUMVERIFY_KEY")
ABSTRACT_KEY = os.getenv("ABSTRACT_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase environment variables not set")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ------------------- APP -------------------

app = FastAPI(title="FROST Cyber Security API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- LOAD ML MODELS -------------------

try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)

    with open("vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)
except Exception:
    raise RuntimeError("ML model or vectorizer missing")

# ------------------- SCHEMAS -------------------

class SignupInput(BaseModel):
    name: str
    email: str
    password: str

class LoginInput(BaseModel):
    email: str
    password: str

class NewsInput(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

class PhoneInput(BaseModel):
    phone: str

# ------------------- AUTH -------------------

@app.post("/api/signup")
def signup(data: SignupInput):
    existing = supabase.table("user").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()

    result = supabase.table("user").insert({
        "name": data.name,
        "email": data.email,
        "password": hashed
    }).execute()

    user = result.data[0]

    return {
        "message": "Signup successful",
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    }

@app.post("/api/login")
def login(data: LoginInput):
    res = supabase.table("user").select("*").eq("email", data.email).execute()
    if not res.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = res.data[0]

    if not bcrypt.checkpw(data.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login successful",
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    }

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
            params={"q": keywords, "api-key": NYT_API_KEY},
            timeout=6
        )
        docs = res.json().get("response", {}).get("docs", [])
        return docs[0]["abstract"] if docs else ""
    except:
        return ""

# ------------------- FAKE NEWS -------------------

@app.post("/api/fake-news/check")
def check_news(data: NewsInput):
    if not data.text and not data.url:
        raise HTTPException(status_code=400, detail="Text or URL required")

    content = (
        fetch_from_nytimes(data.url)
        if data.url and "nytimes.com" in data.url
        else scrape_article(data.url) if data.url else data.text
    )

    if not content or len(content.strip()) < 50:
        return {"verdict": "UNKNOWN", "confidence": 0}

    vec = vectorizer.transform([content])
    prediction = model.predict(vec)[0]
    probability = model.predict_proba(vec)[0].max()

    return {
        "verdict": "REAL" if prediction == 1 else "FAKE",
        "confidence": round(probability * 100, 2)
    }

# ------------------- PHONE CHECK -------------------

@app.post("/api/phone/check")
def phone_check(data: PhoneInput):
    try:
        numverify = requests.get(
            "https://apilayer.net/api/validate",
            params={"access_key": NUMVERIFY_KEY, "number": data.phone},
            timeout=6
        ).json()

        abstract = requests.get(
            "https://phonevalidation.abstractapi.com/v1/",
            params={"api_key": ABSTRACT_KEY, "phone": data.phone},
            timeout=6
        ).json()

        score = 0
        if not numverify.get("valid"):
            score += 40
        if numverify.get("line_type") == "voip":
            score += 30
        if abstract.get("is_disposable"):
            score += 30

        return {
            "phone": data.phone,
            "country": numverify.get("country_name"),
            "carrier": numverify.get("carrier"),
            "lineType": numverify.get("line_type"),
            "location": abstract.get("location"),
            "fraudScore": min(score, 100),
            "verdict": "HIGH RISK" if score >= 60 else "SAFE"
        }

    except:
        raise HTTPException(status_code=500, detail="Phone lookup failed")

# ------------------- DEEPFAKE (WORKING) -------------------

@app.post("/api/deepfake/check")
async def deepfake_check(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Image file required")

    image_bytes = await file.read()
    result = analyze_image(image_bytes)

    return {
        "filename": file.filename,
        **result
    }
