import os
import pickle
import requests
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client

# -----------------------
# Load ENV
# -----------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
NYT_API_KEY = os.getenv("NYT_API_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

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
# AUTH: SIGNUP
# -----------------------
@app.post("/api/signup")
def signup(data: SignupInput):
    try:
        auth = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password
        })

        if not auth.user:
            raise HTTPException(status_code=400, detail="Signup failed")

        # store profile
        supabase.table("user").insert({
            "id": auth.user.id,
            "name": data.name,
            "email": data.email
        }).execute()

        return {
            "token": auth.session.access_token,
            "user": {
                "id": auth.user.id,
                "name": data.name,
                "email": data.email
            }
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# -----------------------
# AUTH: LOGIN
# -----------------------
@app.post("/api/login")
def login(data: LoginInput):
    try:
        auth = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })

        if not auth.user:
            raise HTTPException(status_code=401, detail="Invalid login")

        profile = supabase.table("user").select("*").eq("id", auth.user.id).execute()

        return {
            "token": auth.session.access_token,
            "user": profile.data[0]
        }

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password")

# -----------------------
# Scraping
# -----------------------
def scrape_article(url: str) -> str:
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=8)
        soup = BeautifulSoup(res.text, "html.parser")
        return " ".join(p.text for p in soup.find_all("p"))
    except:
        return ""

# -----------------------
# NYTimes
# -----------------------
def fetch_from_nytimes(url: str) -> str:
    try:
        keywords = url.split("/")[-1].replace("-", " ")
        api_url = "https://api.nytimes.com/svc/search/v2/articlesearch.json"
        res = requests.get(api_url, params={"q": keywords, "api-key": NYT_API_KEY})
        docs = res.json().get("response", {}).get("docs", [])
        if not docs:
            return ""
        a = docs[0]
        return f"{a['headline']['main']} {a['abstract']} {a['lead_paragraph']}"
    except:
        return ""

# -----------------------
# FAKE NEWS
# -----------------------
@app.post("/api/fake-news/check")
def check_fake_news(data: NewsInput):
    content = ""

    if data.url:
        content = fetch_from_nytimes(data.url) if "nytimes.com" in data.url else scrape_article(data.url)
    else:
        content = data.text or ""

    if not content.strip():
        return {"verdict": "UNKNOWN", "confidence": 0}

    vec = vectorizer.transform([content])
    prediction = model.predict(vec)[0]
    prob = model.predict_proba(vec)[0].max()

    return {
        "verdict": "REAL" if prediction == 1 else "FAKE",
        "confidence": round(prob * 100, 2)
    }
