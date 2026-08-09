from fastapi import APIRouter
from pydantic import BaseModel

from app.core.chat_dependencies import groq_client


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

You are a helpful conversational AI assistant.

Be clear, concise, friendly, and useful.

Do not claim that you performed an action when you did not.

Do not pretend to have access to private user information,
devices, accounts, cameras, microphones, or systems.

When discussing cybersecurity, prioritize safe and defensive
guidance.

You are an AI assistant inside the FROST security platform.
"""


# ================= CHAT =================

@router.post("")
async def chat(request: ChatRequest):

    if not request.messages:

        return {
            "success": False,
            "error": "No messages provided",
        }

    if groq_client is None:

        return {
            "success": False,
            "error": "FROST AI is currently unavailable",
        }

    try:

        messages = [
            {
                "role": "system",
                "content": SYSTEM_INSTRUCTION,
            }
        ]

        for message in request.messages:

            role = message.role

            if role not in ["user", "assistant"]:

                role = "user"

            messages.append(
                {
                    "role": role,
                    "content": message.content,
                }
            )

        response = groq_client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=messages,

            temperature=0.5,

            max_completion_tokens=1024,
        )

        answer = response.choices[0].message.content

        return {
            "success": True,
            "data": {
                "answer": answer,
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