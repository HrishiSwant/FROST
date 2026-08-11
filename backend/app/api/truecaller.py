from fastapi import APIRouter, Request

from app.core.responses import (
    success_response,
    error_response,
)

from app.services.truecaller.truecaller_service import (
    fetch_truecaller_profile,
)


router = APIRouter(
    prefix="/api/truecaller",
    tags=["Truecaller"],
)


@router.post("/callback")
async def truecaller_callback(
    request: Request,
):
    try:
        payload = await request.json()

        request_id = payload.get(
            "requestId"
        )

        access_token = payload.get(
            "accessToken"
        )

        endpoint = payload.get(
            "endpoint"
        )

        # User rejected the verification request.
        if payload.get("status") == "user_rejected":
            return success_response(
                {
                    "request_id": request_id,
                    "status": "user_rejected",
                }
            )

        if not request_id:
            return error_response(
                message="Truecaller request ID is missing",
                status_code=400,
            )

        if not access_token:
            return error_response(
                message="Truecaller access token is missing",
                status_code=400,
            )

        if not endpoint:
            return error_response(
                message="Truecaller profile endpoint is missing",
                status_code=400,
            )

        profile = await fetch_truecaller_profile(
            access_token=access_token,
            endpoint=endpoint,
        )

        return success_response(
            {
                "request_id": request_id,
                "profile": profile,
            }
        )

    except ValueError as e:
        return error_response(
            message=str(e),
            status_code=400,
        )

    except RuntimeError as e:
        return error_response(
            message=str(e),
            status_code=503,
        )

    except Exception:
        return error_response(
            message="Truecaller callback processing failed",
            status_code=500,
        )
