import os
import pickle
import requests
import logging
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from typing import Optional

from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
    Depends,
    Header,
    Request,
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, EmailStr, constr, validator
from supabase import create_client

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# ------------------- LOGGING -------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ------------------- ENV -------------------

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

NYT_API_KEY = os.getenv("NYT_API_KEY")
NUMVERIFY_KEY = os.getenv("NUMVERIFY_KEY")
ABSTRACT_KEY = os.getenv("ABSTRACT_KEY")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000"
).split(",")

if not SUPABASE_URL or not SUPABASE_ANON_KEY or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Missing Supabase environment variables")

# 🔓 Public client → signup / login / OTP
supabase_public = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# 🔐 Admin client → JWT verify / DB writes
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# ------------------- RATE LIMITER -------------------

limiter = Limiter(key_func=get_remote_address)

# ------------------- AUTH HELPER -------------------

def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        res = supabase_admin.auth.get_user(token)
        if not res or not res.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return res.user
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

# ------------------- APP -------------------

app = FastAPI(
    title="FROST Cyber Security API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "*.vercel.app", "*.onrender.com"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ------------------- LOAD ML MODELS -------------------

try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)
    with open("vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)
    logger.info("✅ ML models loaded")
except Exception as e:
    raise RuntimeError("ML model files missing") from e

# ------------------- SCHEMAS -------------------

class SignupInput(BaseModel):
    name: constr(min_length=1, max_length=100)
    email: EmailStr
    password: constr(min_length=8, max_length=128)

    @validator("password")
    def strong_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain digit")
        return v

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class PhoneInput(BaseModel):
    phone: constr(min_length=10, max_length=15)

class NewsInput(BaseModel):
    text: Optional[constr(max_length=50000)] = None
    url: Optional[str] = None

# ------------------- CONSTANTS -------------------

MAX_IMAGE_SIZE = 10 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg"}

# ------------------- AUTH -------------------

@app.post("/api/signup")
@limiter.limit("5/minute")
def signup(data: SignupInput, request: Request):
    try:
        res = supabase_public.auth.sign_up({
            "email": data.email,
            "password": data.password,
            "options": {"data": {"name": data.name}},
        })

        if not res.user:
            raise HTTPException(status_code=400, detail="Signup failed")

        return {
            "message": "Verification email sent. Please verify before login."
        }

    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(status_code=500, detail="Signup failed")

@app.post("/api/login")
@limiter.limit("10/minute")
def login(data: LoginInput, request: Request):
    try:
        res = supabase_public.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password,
        })

        if not res.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return {
            "access_token": res.session.access_token,
            "user": {
                "id": res.user.id,
                "email": res.user.email,
            },
        }

    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Login failed")

# ------------------- DEEPFAKE -------------------

@app.post("/api/deepfake/check")
@limiter.limit("20/hour")
async def deepfake_check(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid image type")

    image_bytes = await file.read()

    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image too large")

    from deepfake_detector import analyze_image
    result = analyze_image(image_bytes)

    supabase_admin.table("scan_history").insert({
        "user_id": user.id,
        "type": "deepfake",
        "input": file.filename[:255],
        "verdict": result["verdict"],
        "confidence": result["confidence"],
    }).execute()

    return {"filename": file.filename, **result}

# ------------------- PHONE CHECK -------------------

@app.post("/api/phone/check")
@limiter.limit("30/hour")
def phone_check(
    data: PhoneInput,
    user=Depends(get_current_user),
):
    numverify = requests.get(
        "https://apilayer.net/api/validate",
        params={"access_key": NUMVERIFY_KEY, "number": data.phone},
        timeout=5,
    ).json()

    abstract = requests.get(
        "https://phonevalidation.abstractapi.com/v1/",
        params={"api_key": ABSTRACT_KEY, "phone": data.phone},
        timeout=5,
    ).json()

    score = 0
    if not numverify.get("valid"):
        score += 40
    if numverify.get("line_type") == "voip":
        score += 30
    if abstract.get("is_disposable"):
        score += 30

    result = {
        "phone": data.phone,
        "fraudScore": min(score, 100),
        "verdict": "HIGH RISK" if score >= 60 else "SAFE",
    }

    supabase_admin.table("scan_history").insert({
        "user_id": user.id,
        "type": "phone",
        "input": data.phone,
        "verdict": result["verdict"],
        "confidence": result["fraudScore"],
    }).execute()

    return result

# ------------------- FAKE NEWS -------------------

@app.post("/api/fake-news/check")
@limiter.limit("30/hour")
def fake_news_check(
    data: NewsInput,
    user=Depends(get_current_user),
):
    if not data.text and not data.url:
        raise HTTPException(status_code=400, detail="Provide text or URL")

    text = data.text or scrape_article(data.url)

    from model import predict_news
    result = predict_news(text[:10000])

    supabase_admin.table("scan_history").insert({
        "user_id": user.id,
        "type": "fake_news",
        "input": (data.url or text)[:255],
        "verdict": result["verdict"],
        "confidence": result["confidence"],
    }).execute()

    return result

# ------------------- HEALTH -------------------

@app.get("/health")
def health():
    return {"status": "ok"}

# ------------------- HELPERS -------------------

def scrape_article(url: str) -> str:
    try:
        res = requests.get(url, timeout=6)
        soup = BeautifulSoup(res.text, "html.parser")
        return " ".join(p.text for p in soup.find_all("p"))[:10000]
    except:
        return ""
