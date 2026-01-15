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

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
NYT_API_KEY = os.getenv("NYT_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase env variables not set")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
