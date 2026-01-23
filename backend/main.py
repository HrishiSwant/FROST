import os
import pickle
import requests
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header, Request
from pydantic import BaseModel, EmailStr, validator
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from supabase import create_client
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ------------------- ENV -------------------

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
NYT_API_KEY = os.getenv("NYT_API_KEY")
NUMVERIFY_KEY = os.getenv("NUMVERIFY_KEY")
ABSTRACT_KEY = os.getenv("ABSTRACT_KEY")

# Get allowed origins from env or use defaults
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:3000,https://yourfrontend.netlify.app"
).split(",")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Missing Supabase credentials")
    raise RuntimeError("Supabase environment variables not set")

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("✅ Supabase client initialized")
except Exception as e:
    logger.error(f"Failed to initialize Supabase: {str(e)}")
    raise

# ------------------- AUTH HELPER -------------------

def get_current_user(authorization: str = Header(...)):
    """Validate JWT token and return authenticated user"""
    if not authorization.startswith("Bearer "):
        logger.warning("Invalid authorization header format")
        raise HTTPException(
            status_code=401, 
            detail="Invalid authorization header"
        )

    token = authorization.replace("Bearer ", "")
    
    try:
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=401, 
                detail="Invalid or expired token"
            )
        
        return user_response.user
        
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=401, 
            detail="Authentication failed"
        )

# ------------------- APP -------------------

app = FastAPI(
    title="FROST Cyber Security API",
    version="1.0.0",
    description="AI-powered cybersecurity detection platform"
)

# ✅ Improved CORS with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# ------------------- LOAD ML MODELS -------------------

try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)
    with open("vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)
    logger.info("✅ ML models loaded successfully")
except FileNotFoundError:
    logger.error("ML model files not found")
    raise RuntimeError("ML model or vectorizer files missing")
except Exception as e:
    logger.error(f"Error loading models: {str(e)}")
    raise

# ------------------- VALIDATION SCHEMAS -------------------

class SignupInput(BaseModel):
    name: str
    email: EmailStr
    password: str
    
    @validator('name')
    def name_not_empty(cls, v):
        if not v or len(v.strip()) < 1:
            raise ValueError('Name cannot be empty')
        if len(v) > 100:
            raise ValueError('Name too long')
        return v.strip()
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if len(v) > 128:
            raise ValueError('Password too long')
        return v

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class NewsInput(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None
    
    @validator('text')
    def validate_text(cls, v):
        if v and len(v) > 50000:
            raise ValueError('Text too long (max 50,000 characters)')
        return v
    
    @validator('url')
    def validate_url(cls, v):
        if v and not v.startswith(('http://', 'https://')):
            raise ValueError('Invalid URL format')
        return v

class PhoneInput(BaseModel):
    phone: str
    
    @validator('phone')
    def validate_phone(cls, v):
        # Remove common formatting characters
        cleaned = ''.join(c for c in v if c.isdigit() or c == '+')
        if len(cleaned) < 10 or len(cleaned) > 15:
            raise ValueError('Invalid phone number length')
        return cleaned

# ------------------- CONSTANTS -------------------

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg"}

# ------------------- HEALTH CHECK -------------------

@app.get("/")
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "FROST API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# ------------------- AUTH ENDPOINTS -------------------

@app.post("/api/signup")
def signup(data: SignupInput):
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
            logger.warning(f"Signup failed for email: {data.email}")
            raise HTTPException(
                status_code=400, 
                detail="Signup failed. Email may already be registered."
            )

        logger.info(f"New user registered: {data.email}")
        return {
            "message": "Verification email sent. Please check your inbox.",
            "email": data.email
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Registration failed. Please try again."
        )

@app.post("/api/login")
def login(data: LoginInput):
    """User login endpoint"""
    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
        
        if not response.session:
            raise HTTPException(
                status_code=401, 
                detail="Invalid email or password"
            )
        
        logger.info(f"User logged in: {data.email}")
        
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "name": response.user.user_metadata.get("name")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=401, 
            detail="Login failed"
        )

# ------------------- DEEPFAKE DETECTION -------------------

@app.post("/api/deepfake/check")
async def deepfake_check(
    file: UploadFile = File(...),
    user = Depends(get_current_user)
):
    """Detect deepfakes in uploaded images - PROTECTED ENDPOINT"""
    
    # Validate file type
    if not file.content_type or file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400, 
            detail="Only JPEG/PNG images are allowed"
        )

    # Read file
    try:
        image_bytes = await file.read()
    except Exception as e:
        logger.error(f"Error reading file: {str(e)}")
        raise HTTPException(
            status_code=400, 
            detail="Failed to read image file"
        )
    
    # Validate file size
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail=f"Image too large (max {MAX_IMAGE_SIZE // 1024 // 1024}MB)"
        )
    
    if len(image_bytes) < 100:
        raise HTTPException(
            status_code=400, 
            detail="Invalid or corrupted image file"
        )

    try:
        from deepfake_detector import analyze_image
        result = analyze_image(image_bytes)

        # Store scan in history
        try:
            supabase.table("scan_history").insert({
                "user_id": user.id,
                "type": "deepfake",
                "input": file.filename[:255] if file.filename else "unknown",
                "verdict": result["verdict"],
                "confidence": result["confidence"]
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to save scan history: {str(e)}")

        logger.info(f"Deepfake scan by {user.email}: {result['verdict']}")
        
        return {
            "filename": file.filename,
            "verdict": result["verdict"],
            "confidence": result["confidence"],
            "method": result.get("method", "Image forensic analysis")
        }
    
    except Exception as e:
        logger.error(f"Deepfake detection error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Image analysis failed"
        )

# ------------------- FAKE NEWS DETECTION -------------------

@app.post("/api/fake-news/check")
def fake_news_check(
    data: NewsInput,
    user = Depends(get_current_user)
):
    """Analyze news for authenticity - PROTECTED ENDPOINT"""
    
    if not data.text and not data.url:
        raise HTTPException(
            status_code=400, 
            detail="Please provide either text or URL"
        )
    
    try:
        text = data.text
        
        # If URL provided, scrape content
        if data.url and not text:
            logger.info(f"Scraping URL: {data.url}")
            text = scrape_article(data.url)
            
            if not text:
                text = fetch_from_nytimes(data.url)
                
            if not text:
                raise HTTPException(
                    status_code=400, 
                    detail="Could not extract article content from URL"
                )
        
        # Validate text length
        if len(text) < 50:
            raise HTTPException(
                status_code=400, 
                detail="Text too short for reliable analysis (min 50 characters)"
            )
        
        # Perform ML prediction
        vec = vectorizer.transform([text[:10000]])  # Limit to 10k chars
        prediction = model.predict(vec)[0]
        probability = model.predict_proba(vec)[0].max()
        
        verdict = "REAL" if prediction == 1 else "FAKE"
        confidence = round(probability * 100, 2)
        
        result = {
            "verdict": verdict,
            "confidence": confidence,
            "explanation": (
                "Language patterns match verified news sources"
                if prediction == 1
                else "Sensational or misleading language patterns detected"
            )
        }
        
        # Store scan history
        try:
            supabase.table("scan_history").insert({
                "user_id": user.id,
                "type": "fake_news",
                "input": (data.url or text)[:255],
                "verdict": verdict,
                "confidence": confidence
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to save scan history: {str(e)}")
        
        logger.info(f"Fake news check by {user.email}: {verdict}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fake news check error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Analysis failed"
        )

# ------------------- PHONE INTELLIGENCE -------------------

@app.post("/api/phone/check")
def phone_check(
    data: PhoneInput,
    user = Depends(get_current_user)  # ✅ NOW PROTECTED
):
    """Validate phone number and assess fraud risk - PROTECTED ENDPOINT"""
    
    if not NUMVERIFY_KEY or not ABSTRACT_KEY:
        raise HTTPException(
            status_code=503, 
            detail="Phone validation service temporarily unavailable"
        )
    
    try:
        # Call NumVerify API
        numverify_response = requests.get(
            "https://apilayer.net/api/validate",
            params={"access_key": NUMVERIFY_KEY, "number": data.phone},
            timeout=6
        )
        numverify = numverify_response.json()

        # Call Abstract API
        abstract_response = requests.get(
            "https://phonevalidation.abstractapi.com/v1/",
            params={"api_key": ABSTRACT_KEY, "phone": data.phone},
            timeout=6
        )
        abstract = abstract_response.json()

        # Calculate fraud score
        score = 0
        if not numverify.get("valid"):
            score += 40
        if numverify.get("line_type") == "voip":
            score += 30
        if abstract.get("is_disposable"):
            score += 30

        verdict = "HIGH RISK" if score >= 60 else "SAFE"
        
        result = {
            "phone": data.phone,
            "country": numverify.get("country_name"),
            "carrier": numverify.get("carrier"),
            "lineType": numverify.get("line_type"),
            "location": abstract.get("location"),
            "fraudScore": min(score, 100),
            "verdict": verdict
        }

        # Store scan history
        try:
            supabase.table("scan_history").insert({
                "user_id": user.id,
                "type": "phone",
                "input": data.phone,
                "verdict": verdict,
                "confidence": result["fraudScore"]
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to save scan history: {str(e)}")

        logger.info(f"Phone check by {user.email}: {verdict}")
        return result

    except requests.RequestException as e:
        logger.error(f"Phone API request error: {str(e)}")
        raise HTTPException(
            status_code=503, 
            detail="External phone validation service unavailable"
        )
    except Exception as e:
        logger.error(f"Phone check error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Phone validation failed"
        )

# ------------------- SCAN HISTORY -------------------

@app.get("/api/scans/history")
def get_scan_history(
    user = Depends(get_current_user),
    limit: int = 50
):
    """Get user's scan history"""
    try:
        response = supabase.table("scan_history")\
            .select("*")\
            .eq("user_id", user.id)\
            .order("created_at", desc=True)\
            .limit(min(limit, 100))\
            .execute()
        
        return {
            "scans": response.data,
            "count": len(response.data)
        }
    except Exception as e:
        logger.error(f"Error fetching scan history: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to fetch scan history"
        )

# ------------------- UTILITY FUNCTIONS -------------------

def scrape_article(url: str) -> str:
    """Scrape article text from URL"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        res = requests.get(url, timeout=6, headers=headers)
        res.raise_for_status()
        
        soup = BeautifulSoup(res.text, "html.parser")
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
            
        paragraphs = soup.find_all("p")
        text = " ".join(p.get_text().strip() for p in paragraphs if p.get_text().strip())
        
        return text[:10000]
        
    except Exception as e:
        logger.error(f"Scraping error for {url}: {str(e)}")
        return ""

def fetch_from_nytimes(url: str) -> str:
    """Fetch article abstract from NYT API"""
    if not NYT_API_KEY:
        return ""
    
    try:
        # Extract keywords from URL
        keywords = url.split("/")[-1].replace("-", " ").replace(".html", "")
        
        res = requests.get(
            "https://api.nytimes.com/svc/search/v2/articlesearch.json",
            params={"q": keywords, "api-key": NYT_API_KEY},
            timeout=6
        )
        res.raise_for_status()
        
        docs = res.json().get("response", {}).get("docs", [])
        return docs[0]["abstract"] if docs else ""
        
    except Exception as e:
        logger.error(f"NYT API error: {str(e)}")
        return ""

# ------------------- ERROR HANDLERS -------------------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return HTTPException(
        status_code=500,
        detail="An unexpected error occurred"
    )
