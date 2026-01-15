import os
import pickle
import bcrypt
import requests
from supabase import create_client
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# ----------------------------
# Load Environment Variables
# ----------------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
NYT_API_KEY = os.getenv("NYT_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase environment variables not set")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ----------------------------
# FastAPI
# ----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later lock to Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Load ML Models
# ----------------------------
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# ----------------------------
# Schemas
# ----------------------------
class SignupInput(BaseModel):
    name: str
    email: str
    password: str

class LoginInput(BaseModel):
    email: str
    password: str

class NewsInput(BaseModel):
    text: str | None = None
    url: str | None = None

# ----------------------------
# AUTH – SIGNUP
# ----------------------------
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
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    }

# ----------------------------
# AUTH – LOGIN
# ----------------------------
@app.post("/api/login")
def login(data: LoginInput):

    res = supabase.table("user").select("*").eq("email", data.email).execute()

    if not res.data:
        raise HTTPException(status_code=401, detail="Invalid email")

    user = res.data[0]

    if not bcrypt.checkpw(data.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid password")

    return {
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    }

# ----------------------------
# Scraping
# ----------------------------
def scrape_article(url):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=8)
        soup = BeautifulSoup(res.text, "html.parser")
        return " ".join(p.text for p in soup.find_all("p"))
    except:
        return ""

# ----------------------------
# NYTimes API
# ----------------------------
def fetch_from_nytimes(url):
    if not NYT_API_KEY:
        return ""

    try:
        keywords = url.split("/")[-1].replace("-", " ")

        res = requests.get(
            "https://api.nytimes.com/svc/search/v2/articlesearch.json",
            params={"q": keywords, "api-key": NYT_API_KEY},
            timeout=8
        )

        docs = res.json().get("response", {}).get("docs", [])
        if not docs:
            return ""

        article = docs[0]
        parts = [
            article.get("headline", {}).get("main", ""),
            article.get("abstract", ""),
            article.get("lead_paragraph", "")
        ]

        return " ".join(p for p in parts if p)

    except:
        return ""

# ----------------------------
# Fake News Detection
# ----------------------------
@app.post("/api/fake-news/check")
def check_fake_news(data: NewsInput):

    content = ""

    if data.url:
        if "nytimes.com" in data.url:
            content = fetch_from_nytimes(data.url)
        else:
            content = scrape_article(data.url)
    else:
        content = data.text or ""

    if not content.strip():
        return {
            "verdict": "UNKNOWN",
            "confidence": 0
        }

    vec = vectorizer.transform([content])
    prediction = model.predict(vec)[0]
    probability = model.predict_proba(vec)[0].max()

    return {
        "verdict": "REAL" if prediction == 1 else "FAKE",
        "confidence": round(probability * 100, 2)
    }
