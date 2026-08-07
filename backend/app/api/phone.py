from fastapi import APIRouter, Request

from app.schemas.phone import PhoneInput
from app.services.phone.phone_service import analyze_phone

router = APIRouter(
    prefix="/api/phone",
    tags=["Phone Intelligence"]
)


@router.post("/check")
async def phone_check(request: Request, data: PhoneInput):
    return analyze_phone(data.phone)
