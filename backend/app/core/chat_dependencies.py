import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()


# ================= GROQ =================

groq_api_key = os.getenv("GROQ_API_KEY")

if not groq_api_key:

    print("WARNING: GROQ_API_KEY not found")

    groq_client = None

else:

    try:

        groq_client = Groq(
            api_key=groq_api_key
        )

        print("Groq client initialized for FROST AI")

    except Exception as e:

        print(
            f"Groq initialization failed: {e}"
        )

        groq_client = None
