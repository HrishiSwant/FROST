import os
import pickle
import requests
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, EmailStr, constr, validator
from typing import Optional
from supabase import create_client
import logging
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
NYT_API_KEY = os.getenv("NYT_API_KEY")
NUMVERIFY_KEY = os.getenv("NUMVERIFY_KEY")
ABSTRACT_KEY = os.getenv("ABSTRACT_KEY")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing required environment variables")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ✅ Rate limiter
limiter = Limiter(key_func=get_remote_address)

# ------------------- AUTH HELPER -------------------

def get_current_user(authorization: str = Header(...)):
    """Validate JWT token and return user"""
    if not authorization.startswith("Bearer "):
        logger.warning("Invalid authorization header format")
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")
    
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user_response.user
    except Exception as e:
        logger.error(f"Auth error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")

# ------------------- APP -------------------

app = FastAPI(
    title="FROST Cyber Security API",
    version="1.0.0",
    docs_url="/api/docs",  # Protected in production
    redoc_url=None
)

# ✅ Secure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # ✅ Specific origins only
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ✅ Trust host middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*.yourdomain.com", "localhost"])

# ✅ Rate limit handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ------------------- LOAD ML MODELS -------------------

try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)
    with open("vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)
    logger.info("✅ ML models loaded successfully")
except FileNotFoundError as e:
    logger.error("ML model files not found")
    raise RuntimeError("Required ML model files missing")
except Exception as e:
    logger.error(f"Error loading models: {str(e)}")
    raise RuntimeError("Failed to initialize ML models")

# ------------------- SCHEMAS WITH VALIDATION -------------------

class SignupInput(BaseModel):
    name: constr(min_length=1, max_length=100)
    email: EmailStr
    password: constr(min_length=8, max_length=128)
    
    @validator('password')
    def password_strength(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain digit')
        return v

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class NewsInput(BaseModel):
    text: Optional[constr(max_length=50000)] = None
    url: Optional[str] = None
    
    @validator('url')
    def validate_url(cls, v):
        if v and not v.startswith(('http://', 'https://')):
            raise ValueError('Invalid URL format')
        return v

class PhoneInput(BaseModel):
    phone: constr(min_length=10, max_length=15)

# ------------------- CONSTANTS -------------------

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg"}

# ------------------- AUTH ENDPOINTS -------------------

@app.post("/api/signup")
@limiter.limit("5/minute")  # ✅ Rate limit
def signup(data: SignupInput, request: Request):
    """Register new user with email verification"""
    try:
        response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password,
            "options": {
                "data": {"name": data.name}
            }
        })

        if not response.user:
            raise HTTPException(status_code=400, detail="Registration failed")

        logger.info(f"New user registered: {data.email}")
        return {"message": "Verification email sent. Please check your inbox."}
    
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/login")
@limiter.limit("10/minute")  # ✅ Rate limit
def login(data: LoginInput, request: Request):
    """User login endpoint"""
    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
        
        if not response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        return {
            "access_token": response.session.access_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email
            }
        }
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=401, detail="Login failed")

# ------------------- DEEPFAKE DETECTION (PROTECTED) -------------------

@app.post("/api/deepfake/check")
@limiter.limit("20/hour")  # ✅ Rate limit expensive operations
async def deepfake_check(
    file: UploadFile = File(...),
    user = Depends(get_current_user),
    request: Request = None
):
    """Detect deepfakes in uploaded images"""
    
    # ✅ Validate file type
    if not file.content_type or file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG images allowed")

    # ✅ Read and validate file size
    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image too large (max 10MB)")
    
    if len(image_bytes) < 1000:
        raise HTTPException(status_code=400, detail="Invalid image file")

    try:
        from deepfake_detector import analyze_image
        result = analyze_image(image_bytes)

        # ✅ Store scan history
        supabase.table("scan_history").insert({
            "user_id": user.id,
            "type": "deepfake",
            "input": file.filename[:255],  # Limit filename length
            "verdict": result["verdict"],
            "confidence": result["confidence"]
        }).execute()

        logger.info(f"Deepfake scan by user {user.id}: {result['verdict']}")
        
        return {
            "filename": file.filename,
            **result
        }
    
    except Exception as e:
        logger.error(f"Deepfake detection error: {str(e)}")
        raise HTTPException(status_code=500, detail="Image analysis failed")

# ------------------- PHONE CHECK (NOW PROTECTED) -------------------

@app.post("/api/phone/check")
@limiter.limit("30/hour")  # ✅ Rate limit
def phone_check(
    data: PhoneInput,
    user = Depends(get_current_user),  # ✅ Now requires auth
    request: Request = None
):
    """Validate phone number and check fraud risk"""
    
    if not NUMVERIFY_KEY or not ABSTRACT_KEY:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")
    
    try:
        # Call external APIs with timeout
        numverify = requests.get(
            "https://apilayer.net/api/validate",
            params={"access_key": NUMVERIFY_KEY, "number": data.phone},
            timeout=5
        ).json()

        abstract = requests.get(
            "https://phonevalidation.abstractapi.com/v1/",
            params={"api_key": ABSTRACT_KEY, "phone": data.phone},
            timeout=5
        ).json()

        # Calculate fraud score
        score = 0
        if not numverify.get("valid"):
            score += 40
        if numverify.get("line_type") == "voip":
            score += 30
        if abstract.get("is_disposable"):
            score += 30

        result = {
            "phone": data.phone,
            "country": numverify.get("country_name"),
            "carrier": numverify.get("carrier"),
            "lineType": numverify.get("line_type"),
            "location": abstract.get("location"),
            "fraudScore": min(score, 100),
            "verdict": "HIGH RISK" if score >= 60 else "SAFE"
        }

        # ✅ Store scan history
        supabase.table("scan_history").insert({
            "user_id": user.id,
            "type": "phone",
            "input": data.phone,
            "verdict": result["verdict"],
            "confidence": result["fraudScore"]
        }).execute()

        logger.info(f"Phone check by user {user.id}: {result['verdict']}")
        return result

    except requests.RequestException as e:
        logger.error(f"Phone API error: {str(e)}")
        raise HTTPException(status_code=503, detail="External service unavailable")
    except Exception as e:
        logger.error(f"Phone check error: {str(e)}")
        raise HTTPException(status_code=500, detail="Phone validation failed")

# ------------------- HEALTH CHECK -------------------

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

# ------------------- FAKE NEWS ENDPOINT -------------------

@app.post("/api/fake-news/check")
@limiter.limit("30/hour")
def fake_news_check(
    data: NewsInput,
    user = Depends(get_current_user),
    request: Request = None
):
    """Analyze news text or URL for fake news"""
    
    if not data.text and not data.url:
        raise HTTPException(status_code=400, detail="Provide text or URL")
    
    try:
        text = data.text
        
        # If URL provided, scrape content
        if data.url and not text:
            text = scrape_article(data.url)
            if not text:
                text = fetch_from_nytimes(data.url)
            if not text:
                raise HTTPException(status_code=400, detail="Could not extract article content")
        
        if len(text) < 50:
            raise HTTPException(status_code=400, detail="Text too short for analysis")
        
        # ML prediction
        from model import predict_news
        result = predict_news(text[:10000])  # Limit text length
        
        # Store history
        supabase.table("scan_history").insert({
            "user_id": user.id,
            "type": "fake_news",
            "input": (data.url or text)[:255],
            "verdict": result["verdict"],
            "confidence": result["confidence"]
        }).execute()
        
        logger.info(f"Fake news check by user {user.id}: {result['verdict']}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fake news check error: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed")

# ------------------- UTILITY FUNCTIONS -------------------

def scrape_article(url: str) -> str:
    """Scrape article text from URL"""
    try:
        res = requests.get(url, timeout=6, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        soup = BeautifulSoup(res.text, "html.parser")
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
            
        text = " ".join(p.text for p in soup.find_all("p"))
        return text[:10000]
    except Exception as e:
        logger.error(f"Scraping error: {str(e)}")
        return ""

def fetch_from_nytimes(url: str) -> str:
    """Fetch article from NYT API"""
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
    except Exception as e:
        logger.error(f"NYT API error: {str(e)}")
        return ""
