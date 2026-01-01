import os
import pickle
import requests
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

# -------------------------------------------------
# ENV
# -------------------------------------------------
load_dotenv()
NYT_API_KEY = os.getenv("NYT_API_KEY")
GUARDIAN_API_KEY = os.getenv("GUARDIAN_API_KEY")

app = FastAPI()

# -------------------------------------------------
# CORS
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Load ML Model (supporting signal)
# -------------------------------------------------
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    ml_vectorizer = pickle.load(f)

similarity_vectorizer = TfidfVectorizer(stop_words="english")

# -------------------------------------------------
# Input Schema
# -------------------------------------------------
class NewsInput(BaseModel):
    text: str | None = None
    url: str | None = None

# -------------------------------------------------
# Scraping (Tier-2)
# -------------------------------------------------
def scrape_article(url: str) -> str:
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        html = requests.get(url, headers=headers, timeout=8).text
        soup = BeautifulSoup(html, "html.parser")
        return " ".join(p.text for p in soup.find_all("p"))
    except:
        return ""

# -------------------------------------------------
# NYTimes API (Tier-1)
# -------------------------------------------------
def fetch_nytimes(query: str):
    if not NYT_API_KEY:
        return []

    url = "https://api.nytimes.com/svc/search/v2/articlesearch.json"
    params = {"q": query, "api-key": NYT_API_KEY}
    res = requests.get(url, params=params).json()

    results = []
    for d in res.get("response", {}).get("docs", [])[:3]:
        results.append({
            "source": "NYTimes",
            "weight": 0.45,
            "title": d["headline"]["main"],
            "url": d["web_url"]
        })
    return results

# -------------------------------------------------
# Guardian API (Tier-1)
# -------------------------------------------------
def fetch_guardian(query: str):
    if not GUARDIAN_API_KEY:
        return []

    url = "https://content.guardianapis.com/search"
    params = {
        "q": query,
        "api-key": GUARDIAN_API_KEY,
        "page-size": 3
    }
    res = requests.get(url, params=params).json()

    results = []
    for r in res.get("response", {}).get("results", []):
        results.append({
            "source": "Guardian",
            "weight": 0.35,
            "title": r["webTitle"],
            "url": r["webUrl"]
        })
    return results

# -------------------------------------------------
# Headline Similarity
# -------------------------------------------------
def similarity_score(text, headlines):
    if not headlines:
        return 0

    vectors = similarity_vectorizer.fit_transform(
        [text] + [h["title"] for h in headlines]
    )
    scores = cosine_similarity(vectors[0:1], vectors[1:])[0]
    return max(scores)

# -------------------------------------------------
# MAIN ENDPOINT
# -------------------------------------------------
@app.post("/api/fake-news/check")
def check_fake_news(data: NewsInput):

    content = data.text or ""
    if data.url:
        content = scrape_article(data.url)

    if not content.strip():
        return {"verdict": "UNKNOWN", "confidence": 0}

    query = content[:120]

    # ML probability
    vec = ml_vectorizer.transform([content])
    ml_prob = model.predict_proba(vec)[0].max()

    # Tier-1 evidence
    evidence = fetch_nytimes(query) + fetch_guardian(query)

    sim = similarity_score(content, evidence)
    weight_score = sum(e["weight"] for e in evidence if sim > 0.25)

    final_score = weight_score + (0.2 if ml_prob > 0.7 else 0)

    # Verdict logic
    if final_score >= 0.6:
        verdict = "REAL"
    elif final_score >= 0.35:
        verdict = "UNCERTAIN"
    else:
        verdict = "FAKE"

    return {
        "verdict": verdict,
        "confidence": round(final_score * 100, 2),
        "headline_similarity": round(sim * 100, 2),
        "evidence": evidence,
        "explanation": "Verdict based on trusted sources + similarity + ML support"
    }
