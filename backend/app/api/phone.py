from fastapi import APIRouter, Request
from app.schemas.phone import PhoneInput

router = APIRouter(
    prefix="/api/phone",
    tags=["Phone Intelligence"]
)

@router.post("/check")
async def phone_check(request: Request, data: PhoneInput):
    return {
        "message": "Phone API migrated successfully.",
        "received": data.phone
    }
