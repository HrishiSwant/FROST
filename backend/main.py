# ================= IMPORTS =================

import pickle
import logging

from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.api.phone import router as phone_router
from app.api.news import router as news_router
from app.api.deepfake import router as deepfake_router


# ================= ENV =================

load_dotenv()


# ================= LOGGING =================

logging.basicConfig(level=logging.INFO)


# ================= APP =================

app = FastAPI(
    title="FROST Cyber Security API"
)


# ================= API ROUTERS =================

app.include_router(phone_router)
app.include_router(news_router)
app.include_router(deepfake_router)


# ================= CORS =================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= RATE LIMIT =================

limiter = Limiter(
    key_func=get_remote_address
)

app.state.limiter = limiter


# ================= LOAD ML MODELS =================

try:

    with open("model.pkl", "rb") as f:
        model = pickle.load(f)

    with open("vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)

    print("ML models loaded successfully")

except FileNotFoundError:

    print(
        "ERROR: model.pkl or vectorizer.pkl not found!"
    )

    model = None
    vectorizer = None

except Exception as e:

    print(
        f"ERROR loading ML models: {e}"
    )

    model = None
    vectorizer = None


# ================= ROOT =================

@app.get("/")
def root():

    return {
        "status": "FROST backend running"
    }


# ================= HEALTH =================

@app.get("/health")
def health():

    return {
        "status": "ok"
    }


# ================= GLOBAL ERROR =================

@app.exception_handler(Exception)
async def global_exception_handler(
    request,
    exc: Exception
):

    logging.error(
        f"Unhandled error: {exc}"
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Something went wrong"
        }
    )
