import hashlib
import logging

from firebase_admin import auth

from app.core.firebase_admin import firebase_admin_app


logger = logging.getLogger(__name__)


def _generate_uid(phone: str) -> str:
    """
    Generate a stable Firebase UID from the verified
    Truecaller phone number.

    The actual phone number is never used directly
    as the Firebase UID.
    """

    normalized_phone = phone.strip()

    digest = hashlib.sha256(
        normalized_phone.encode("utf-8")
    ).hexdigest()

    return f"tc_{digest[:40]}"


def create_or_get_firebase_user(
    profile: dict,
):
    """
    Find an existing Firebase user or create a new
    Firebase user from a verified Truecaller profile.
    """

    if not firebase_admin_app:
        raise RuntimeError(
            "Firebase Admin is not initialized."
        )

    phone_numbers = profile.get(
        "phone_numbers",
        [],
    )

    if not phone_numbers:
        raise ValueError(
            "Truecaller did not provide a verified phone number."
        )

    phone = None

    first_phone = phone_numbers[0]

    if isinstance(first_phone, str):
        phone = first_phone

    elif isinstance(first_phone, dict):
        phone = (
            first_phone.get("number")
            or first_phone.get("phoneNumber")
        )

    if not phone:
        raise ValueError(
            "Unable to determine verified phone number."
        )

    phone = phone.strip()

    email = profile.get("email")

    first_name = (
        profile.get("name", {}).get("first")
        or ""
    )

    last_name = (
        profile.get("name", {}).get("last")
        or ""
    )

    display_name = " ".join(
        part.strip()
        for part in [first_name, last_name]
        if part and part.strip()
    ).strip()

    # -------------------------------------------------
    # 1. Prefer an existing Firebase account by email
    # -------------------------------------------------

    if email:
        try:
            existing_user = auth.get_user_by_email(
                email
            )

            return existing_user

        except auth.UserNotFoundError:
            pass

    # -------------------------------------------------
    # 2. Use a deterministic UID based on phone
    # -------------------------------------------------

    uid = _generate_uid(phone)

    try:
        existing_user = auth.get_user(uid)

        return existing_user

    except auth.UserNotFoundError:
        pass

    # -------------------------------------------------
    # 3. Create Firebase user
    # -------------------------------------------------

    user_kwargs = {
        "uid": uid,
        "phone_number": phone,
    }

    if email:
        user_kwargs["email"] = email

    if display_name:
        user_kwargs["display_name"] = display_name

    try:
        return auth.create_user(
            **user_kwargs
        )

    except auth.EmailAlreadyExistsError:
        # Race-condition protection.
        return auth.get_user_by_email(
            email
        )


def create_truecaller_firebase_token(
    profile: dict,
):
    """
    Create a Firebase custom token for a verified
    Truecaller profile.
    """

    user = create_or_get_firebase_user(
        profile
    )

    additional_claims = {
        "truecaller": True,
    }

    token = auth.create_custom_token(
        user.uid,
        additional_claims,
    )

    if isinstance(token, bytes):
        token = token.decode("utf-8")

    return {
        "token": token,
        "uid": user.uid,
    }
