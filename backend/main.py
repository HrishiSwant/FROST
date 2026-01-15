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

load_dotenv()

SUPABASE_URL = os.getenv("https://tgwkyckfhsegcssgqlup.supabase.co")
SUPABASE_KEY = os.getenv("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnd2t5Y2tmaHNlZ2Nzc2dxbHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ1NjIyMywiZXhwIjoyMDg0MDMyMjIzfQ.oXyNqr86jLNi3iiLLkIyoUPKTF-5L484dMafD2GewFg")
NYT_API_KEY = os.getenv("KP4T4XjrcKJTtIDXJbIZa9YdGAVjF4a1Pf7XFRFBzBUPZBZE")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# ------------------- Schemas -------------------

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

# ------------------- AUTH -------------------

@app.post("/api/signup")
def signup(data: SignupInput):

    existing = supabase.table("user").select("*").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()

    user = supabase.table("user").insert({
        "name": data.name,
        "email": data.email,
        "password": hashed
    }).execute()

    return {
        "user": {
            "name": data.name,
            "email": data.email
        }
    }

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

# ------------------- Fake News -------------------

def scrape_article(url):
    try:
        res = requests.get(url, timeout=8)
        soup = BeautifulSoup(res.text, "html.parser")
        return " ".join(p.text for p in soup.find_all("p"))
    except:
        return ""

def fetch_from_nytimes(url):
    if not NYT_API_KEY:
        return ""
    try:
        keywords = url.split("/")[-1].replace("-", " ")
        res = requests.get("https://api.nytimes.com/svc/search/v2/articlesearch.json",
            params={"q": keywords, "api-key": NYT_API_KEY})
        docs = res.json()["response"]["docs"]
        if not docs:
            return ""
        return docs[0]["abstract"]
    except:
        return ""

@app.post("/api/fake-news/check")
def check(data: NewsInput):

    if data.url:
        content = fetch_from_nytimes(data.url) if "nytimes.com" in data.url else scrape_article(data.url)
    else:
        content = data.text

    if not content:
        return {"verdict":"UNKNOWN","confidence":0}

    vec = vectorizer.transform([content])
    pred = model.predict(vec)[0]
    prob = model.predict_proba(vec)[0].max()

    return {
        "verdict": "REAL" if pred == 1 else "FAKE",
        "confidence": round(prob * 100, 2)
    }
