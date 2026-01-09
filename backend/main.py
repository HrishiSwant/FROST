import os
import pickle
import requests
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# -----------------------
# Load ENV
# -----------------------
load_dotenv()
NYT_API_KEY = os.getenv("NYT_API_KEY")

app = FastAPI()

# -----------------------
# CORS
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# Load ML Model
# -----------------------
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# -----------------------
# TEMP USER STORE (DEMO)
# -----------------------
users_db = []

# -----------------------
# Schemas
# -----------------------
class NewsInput(BaseModel):
    text: str | None = None
    url: str | None = None

class SignupInput(BaseModel):
    name: str
    email: str
    password: str

class LoginInput(BaseModel):
    email: str
    password: str

# -----------------------
# AUTH APIs
# -----------------------
@app.post("/api/signup")
def signup(data: SignupInput):
    for user in users_db:
        if user["email"] == data.email:
            raise HTTPException(status_code=400, detail="User already exists")

    user = {
        "name": data.name,
        "email": data.email,
        "password": data.password  # demo only (no hashing)
    }
    users_db.append(user)

    return {
        "token": "demo-token",
        "user": {
            "name": data.name,
            "email": data.email
        }
    }

@app.post("/api/login")
def login(data: LoginInput):
    for user in users_db:
        if user["email"] == data.email and user["password"] == data.password:
            return {
                "token": "demo-token",
                "user": {
                    "name": user["name"],
                    "email": user["email"]
                }
            }

    raise HTTPException(status_code=401, detail="Invalid email or password")

# -----------------------
# Scraping (Non-NYTimes)
# -----------------------
def scrape_article(url: str) -> str:
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=8)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        paragraphs = soup.find_all("p")
        return " ".join(p.get_text() for p in paragraphs).strip()
    except:
        return ""

# -----------------------
# NYTimes API
# -----------------------
def fetch_from_nytimes(url: str) -> str:
    if not NYT_API_KEY:
        return ""

    try:
        keywords = url.split("/")[-1].replace("-", " ")

        api_url = "https://api.nytimes.com/svc/search/v2/articlesearch.json"
        params = {"q": keywords, "api-key": NYT_API_KEY}

        res = requests.get(api_url, params=params, timeout=8)
        data = res.json()

        docs = data.get("response", {}).get("docs", [])
        if not docs:
            return ""

        article = docs[0]
        parts = [
            article.get("headline", {}).get("main", ""),
            article.get("abstract", ""),
            article.get("lead_paragraph", "")
        ]

        return " ".join(p for p in parts if p).strip()
    except:
        return ""

# -----------------------
# FAKE NEWS API
# -----------------------
@app.post("/api/fake-news/check")
def check_fake_news(data: NewsInput):

    content = ""

    if data.url:
        if "nytimes.com" in data.url:
            content = fetch_from_nytimes(data.url)
        else:
            content = scrape_article(data.url)

        if not content:
            return {
                "verdict": "UNKNOWN",
                "confidence": 0,
                "source_credibility": "UNKNOWN",
                "explanation": "Unable to extract article content"
            }
    else:
        content = data.text or ""

    if not content.strip():
        return {
            "verdict": "UNKNOWN",
            "confidence": 0,
            "source_credibility": "UNKNOWN",
            "explanation": "No text provided"
        }

    vec = vectorizer.transform([content])
    prediction = model.predict(vec)[0]
    probability = model.predict_proba(vec)[0].max()

    trusted_sources = ["bbc.com", "cnn.com", "ndtv.com", "reuters.com", "nytimes.com"]
    source_score = "HIGH" if data.url and any(s in data.url for s in trusted_sources) else "LOW"

    explanation = (
        "Language patterns resemble known fake news styles"
        if prediction == 0
        else "Language patterns align with verified journalism"
    )

    return {
        "verdict": "REAL" if prediction == 1 else "FAKE",
        "confidence": round(probability * 100, 2),
        "source_credibility": source_score,
        "explanation": explanation
    }
