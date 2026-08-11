import logging
import os
import secrets
from datetime import datetime, timedelta, timezone

import requests


logger = logging.getLogger(__name__)

VERIFICATION_COLLECTION = "truecaller_verifications"

VERIFICATION_TTL_MINUTES = 10


def _now():
    return datetime.now(timezone.utc)


def _expires_at():
    return _now() + timedelta(
        minutes=VERIFICATION_TTL_MINUTES
    )


def generate_request_nonce():
    """
    Generate a URL-safe request ID.

    Truecaller requires the request ID to be:
    - URL safe
    - minimum 8 characters
    - maximum 64 characters
    """

    return secrets.token_urlsafe(24)


def create_verification_request(db):
    """
    Create a new pending Truecaller verification.

    The request ID is stored so that the callback from
    Truecaller can be correlated with the browser session.
    """

    if db is None:
        raise RuntimeError(
            "Database is unavailable"
        )

    request_id = generate_request_nonce()

    document = {
        "request_id": request_id,
        "status": "initiated",
        "created_at": _now(),
        "expires_at": _expires_at(),
    }

    db[VERIFICATION_COLLECTION].insert_one(
        document
    )

    return request_id


def ensure_indexes(db):
    """
    Create the MongoDB TTL index used to automatically
    remove temporary Truecaller verification records.
    """

    if db is None:
        return

    db[VERIFICATION_COLLECTION].create_index(
        "request_id",
        unique=True,
    )

    db[VERIFICATION_COLLECTION].create_index(
        "expires_at",
        expireAfterSeconds=0,
    )


def update_flow_invoked(
    db,
    request_id: str,
):
    """
    Record that Truecaller successfully invoked
    the verification flow.
    """

    db[VERIFICATION_COLLECTION].update_one(
        {
            "request_id": request_id,
        },
        {
            "$set": {
                "status": "flow_invoked",
                "updated_at": _now(),
            }
        },
    )


def mark_rejected(
    db,
    request_id: str,
):
    """
    Mark the verification as rejected by the user.
    """

    db[VERIFICATION_COLLECTION].update_one(
        {
            "request_id": request_id,
        },
        {
            "$set": {
                "status": "user_rejected",
                "updated_at": _now(),
            }
        },
    )


def fetch_user_profile(
    access_token: str,
    endpoint: str,
):
    """
    Fetch the verified Truecaller profile.

    The access token is used only for this request and is
    never stored permanently in MongoDB.
    """

    if not access_token:
        raise ValueError(
            "Truecaller access token is missing"
        )

    if not endpoint:
        raise ValueError(
            "Truecaller profile endpoint is missing"
        )

    response = requests.get(
        endpoint,
        headers={
            "Authorization": (
                f"Bearer {access_token}"
            ),
            "Cache-Control": "no-cache",
        },
        timeout=8,
    )

    if response.status_code == 401:
        raise RuntimeError(
            "Truecaller access token is invalid or expired"
        )

    if not response.ok:
        raise RuntimeError(
            "Truecaller profile request failed"
        )

    try:
        return response.json()

    except ValueError as exc:
        raise RuntimeError(
            "Invalid profile response from Truecaller"
        ) from exc


def store_profile(
    db,
    request_id: str,
    profile: dict,
):
    """
    Store only the useful profile information required
    by FROST.

    The record automatically expires through MongoDB TTL.
    """

    if db is None:
        return

    name = profile.get("name") or {}

    safe_profile = {
        "phone_numbers": profile.get(
            "phoneNumbers",
            [],
        ),
        "name": {
            "first": name.get("first"),
            "last": name.get("last"),
        },
        "email": (
            profile.get("onlineIdentities", {})
            .get("email")
        ),
        "city": (
            profile.get("addresses", [{}])[0]
            .get("city")
            if profile.get("addresses")
            else None
        ),
        "country_code": (
            profile.get("addresses", [{}])[0]
            .get("countryCode")
            if profile.get("addresses")
            else None
        ),
    }

    db[VERIFICATION_COLLECTION].update_one(
        {
            "request_id": request_id,
        },
        {
            "$set": {
                "status": "completed",
                "profile": safe_profile,
                "updated_at": _now(),
            }
        },
    )


def mark_failed(
    db,
    request_id: str,
    message: str,
):
    """
    Mark a verification request as failed without
    exposing internal provider details to the frontend.
    """

    if db is None:
        return

    db[VERIFICATION_COLLECTION].update_one(
        {
            "request_id": request_id,
        },
        {
            "$set": {
                "status": "failed",
                "error": message,
                "updated_at": _now(),
            }
        },
    )


def get_verification_status(
    db,
    request_id: str,
):
    """
    Retrieve the current verification state.
    """

    if db is None:
        raise RuntimeError(
            "Database is unavailable"
        )

    record = db[
        VERIFICATION_COLLECTION
    ].find_one(
        {
            "request_id": request_id,
        },
        {
            "_id": 0,
            "request_id": 1,
            "status": 1,
            "profile": 1,
            "error": 1,
        },
    )

    if not record:
        return None

    return record
