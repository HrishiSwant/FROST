import os
import pickle
import requests
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from supabase import create_client

# ✅ Deepfake detector
from deepfake_detector import analyze_image

# ------------------- ENV -------------------

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # backend only
NYT_API_KEY = os.getenv("NYT_API_KEY")
NUMVERIFY_KEY = os.getenv("NUMVERIFY_KEY")
ABSTRACT_KEY = os.getenv("ABSTRACT_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase environment variables not set")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ------------------- AUTH HELPER -------------------

def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")
    user_response = supabase.auth.get_user(token)

    if not user_response or not user_response.user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user_response.user

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

# ------------------- AUTH (SUPABASE) -------------------

@app.post("/api/signup")
def signup(data: SignupInput):
    response = supabase.auth.sign_up({
        "email": data.email,
        "password": data.password,
        "options": {
            "data": {"name": data.name}
        }
    })

    if not response.user:
        raise HTTPException(status_code=400, detail="Signup failed")

    return {"message": "Verification email sent. Please verify your email."}


@app.post("/api/login")
def login(data: LoginInput):
    response = supabase.auth.sign_in_with_password({
        "email": data.email,
        "password": data.password
    })

    if not response.user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not response.user.email_confirmed_at:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in"
        )

    return {
        "message": "Login successful",
        "user": {
            "id": response.user.id,
            "email": response.user.email
        },
        "access_token": response.session.access_token
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

# ------------------- DEEPFAKE (PROTECTED) -------------------

@app.post("/api/deepfake/check")
async def deepfake_check(
    file: UploadFile = File(...),
    user = Depends(get_current_user)
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Image file required")

    image_bytes = await file.read()
    result = analyze_image(image_bytes)

    # 🔐 User-owned scan history
    supabase.table("scan_history").insert({
        "user_id": user.id,
        "type": "deepfake",
        "input": file.filename,
        "verdict": result["verdict"],
        "confidence": result["confidence"]
    }).execute()

    return {
        "filename": file.filename,
        **result
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
