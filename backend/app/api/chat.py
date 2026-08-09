from fastapi import APIRouter
from pydantic import BaseModel
from google.genai import types

from app.core.chat_dependencies import ai_client


router = APIRouter(
    prefix="/api/chat",
    tags=["FROST AI"],
)


# ================= REQUEST MODEL =================

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


# ================= SYSTEM INSTRUCTION =================

SYSTEM_INSTRUCTION = """
You are FROST AI, the official AI assistant of FROST
(Fake Resistance & Online Security Tech).

Your purpose is to help users understand cybersecurity,
digital safety, misinformation, deepfakes, online scams,
privacy, technology, and general questions.

Be helpful, clear, concise, and conversational.

Do not claim that you performed an action when you did not.

Do not pretend to have access to private user information,
devices, accounts, or systems.

When discussing cybersecurity, prioritize safe and defensive
guidance.

You are an assistant inside the FROST security platform.
"""


# ================= CHAT =================

@router.post("")
async def chat(request: ChatRequest):

    if not request.messages:
        return {
            "success": False,
            "error": "No messages provided",
        }

    if ai_client is None:
        return {
            "success": False,
            "error": "FROST AI is currently unavailable",
        }

    try:

        contents = []

        for message in request.messages:

            role = (
                "model"
                if message.role == "assistant"
                else "user"
            )

            contents.append(
                types.Content(
                    role=role,
                    parts=[
                        types.Part(
                            text=message.content
                        )
                    ],
                )
            )

        response = await ai_client.aio.models.generate_content(
            model="gemini-3.6-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
            ),
        )

        return {
            "success": True,
            "data": {
                "answer": response.text,
            },
        }

    except Exception as e:

        print(
            f"FROST AI error: {e}"
        )

        return {
            "success": False,
            "error": "FROST AI could not process your request",
        }
