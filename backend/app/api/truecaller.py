import logging

from fastapi import APIRouter, BackgroundTasks, Request

from app.core.news_dependencies import db

from app.core.responses import (
    success_response,
    error_response,
)

from app.services.truecaller.truecaller_service import (
    create_verification_request,
    ensure_indexes,
    update_flow_invoked,
    mark_rejected,
    fetch_user_profile,
    store_profile,
    mark_failed,
    get_verification_status,
)

import os


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/api/truecaller",
    tags=["Truecaller"],
)


def process_truecaller_profile(
    request_id: str,
    access_token: str,
    endpoint: str,
):
    """
    Background task.

    The Truecaller callback must acknowledge quickly,
    so profile fetching happens after the callback response.
    """

    try:
        profile = fetch_user_profile(
            access_token=access_token,
            endpoint=endpoint,
        )

        store_profile(
            db=db,
            request_id=request_id,
            profile=profile,
        )

        logger.info(
            "Truecaller profile fetched successfully: %s",
            request_id,
        )

    except Exception as exc:
        logger.exception(
            "Truecaller profile fetch failed: %s",
            request_id,
        )

        mark_failed(
            db=db,
            request_id=request_id,
            message="Truecaller profile verification failed.",
        )


@router.post("/start")
async def start_truecaller_verification():
    """
    Create a new Truecaller verification request.

    The frontend uses the returned request_nonce
    to construct the Truecaller deep link.
    """

    try:
        if db is None:
            return error_response(
                message="Database is unavailable.",
                status_code=503,
            )

        ensure_indexes(db)

        request_nonce = (
            create_verification_request(db)
        )

        app_key = os.getenv(
            "TRUECALLER_APP_KEY"
        )

        app_name = os.getenv(
            "TRUECALLER_APP_NAME",
            "FROST",
        )

        if not app_key:
            return error_response(
                message=(
                    "Truecaller application is not configured."
                ),
                status_code=503,
            )

        return success_response(
            {
                "request_nonce": request_nonce,
                "partner_key": app_key,
                "partner_name": app_name,
            }
        )

    except RuntimeError as exc:
        return error_response(
            message=str(exc),
            status_code=503,
        )

    except Exception:
        logger.exception(
            "Failed to start Truecaller verification"
        )

        return error_response(
            message="Unable to start Truecaller verification.",
            status_code=500,
        )


@router.post("/callback")
async def truecaller_callback(
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    Receive Truecaller verification callbacks.

    Truecaller may send:
    1. flow_invoked
    2. accessToken + endpoint
    3. user_rejected
    """

    try:
        if db is None:
            return error_response(
                message="Database is unavailable.",
                status_code=503,
            )

        content_type = (
            request.headers.get(
                "content-type",
                "",
            )
            .lower()
        )

        if (
            "application/json"
            in content_type
        ):
            payload = await request.json()

        else:
            form = await request.form()

            payload = dict(form)

        request_id = payload.get(
            "requestId"
        )

        status = payload.get(
            "status"
        )

        if not request_id:
            return error_response(
                message="Truecaller request ID is missing.",
                status_code=400,
            )

        # ---------------------------------
        # Flow invoked
        # ---------------------------------

        if status == "flow_invoked":
            update_flow_invoked(
                db=db,
                request_id=request_id,
            )

            return success_response(
                {
                    "request_id": request_id,
                    "status": "flow_invoked",
                }
            )

        # ---------------------------------
        # User rejected verification
        # ---------------------------------

        if status == "user_rejected":
            mark_rejected(
                db=db,
                request_id=request_id,
            )

            return success_response(
                {
                    "request_id": request_id,
                    "status": "user_rejected",
                }
            )

        # ---------------------------------
        # Successful verification
        # ---------------------------------

        access_token = payload.get(
            "accessToken"
        )

        endpoint = payload.get(
            "endpoint"
        )

        if access_token and endpoint:

            background_tasks.add_task(
                process_truecaller_profile,
                request_id,
                access_token,
                endpoint,
            )

            return success_response(
                {
                    "request_id": request_id,
                    "status": "processing",
                }
            )

        return error_response(
            message=(
                "Invalid Truecaller callback payload."
            ),
            status_code=400,
        )

    except Exception:
        logger.exception(
            "Truecaller callback failed"
        )

        return error_response(
            message="Truecaller callback processing failed.",
            status_code=500,
        )


@router.get("/status/{request_id}")
async def truecaller_status(
    request_id: str,
):
    """
    Frontend polls this endpoint to determine
    whether verification has completed.
    """

    try:
        result = get_verification_status(
            db=db,
            request_id=request_id,
        )

        if result is None:
            return error_response(
                message="Verification request not found.",
                status_code=404,
            )

        return success_response(result)

    except RuntimeError as exc:
        return error_response(
            message=str(exc),
            status_code=503,
        )

    except Exception:
        logger.exception(
            "Truecaller status lookup failed"
        )

        return error_response(
            message="Unable to retrieve verification status.",
            status_code=500,
        )
