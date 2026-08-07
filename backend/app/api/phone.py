from fastapi import APIRouter, Request

from app.schemas.phone import PhoneInput
from app.services.phone.phone_service import analyze_phone
from app.core.responses import success_response, error_response

router = APIRouter(
    prefix="/api/phone",
    tags=["Phone Intelligence"]
)


@router.post("/check")
async def phone_check(request: Request, data: PhoneInput):
    try:
        result = analyze_phone(data.phone)
        return success_response(result)

    except ValueError as e:
        return error_response(
            message=str(e),
            status_code=400
        )

    except Exception:
        return error_response(
            message="Internal server error",
            status_code=500
        )
