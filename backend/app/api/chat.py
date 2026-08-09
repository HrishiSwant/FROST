from fastapi import APIRouter
from pydantic import BaseModel

from app.core.chat_dependencies import ai_client


router = APIRouter(
    prefix="/api/chat",
    tags=["AI Chat"]
)


# ================= REQUEST MODEL =================

class ChatRequest(BaseModel):
    message: str


# ================= CHAT =================

@router.post("")
async def chat(request: ChatRequest):

    if not request.message.strip():
        return {
            "success": False,
            "error": "Message cannot be empty"
        }

    if ai_client is None:
        return {
            "success": False,
            "error": "FROST AI is currently unavailable"
        }

    try:

        response = ai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=request.message
        )

        return {
            "success": True,
            "data": {
                "answer": response.text
            }
        }

    except Exception as e:

        print(
            f"FROST AI error: {e}"
        )

        return {
            "success": False,
            "error": "FROST AI could not process your request"
        }
