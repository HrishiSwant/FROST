import json
import os

import firebase_admin
from firebase_admin import credentials


def initialize_firebase_admin():
    """
    Initialize Firebase Admin SDK using the Firebase
    service-account JSON stored in Render.
    """

    # Reuse existing Firebase Admin app if already initialized.
    if firebase_admin._apps:
        return firebase_admin.get_app()

    raw_credentials = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_JSON"
    )

    if not raw_credentials:
        raise RuntimeError(
            "FIREBASE_SERVICE_ACCOUNT_JSON is missing."
        )

    try:
        service_account_info = json.loads(
            raw_credentials
        )

    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON."
        ) from exc

    required_fields = [
        "type",
        "project_id",
        "private_key",
        "client_email",
    ]

    missing_fields = [
        field
        for field in required_fields
        if not service_account_info.get(field)
    ]

    if missing_fields:
        raise RuntimeError(
            "Firebase service-account JSON is missing required fields."
        )

    # Normalize escaped/newline formatting safely.
    private_key = service_account_info["private_key"]

    if "\\n" in private_key:
        private_key = private_key.replace(
            "\\n",
            "\n",
        )

    service_account_info["private_key"] = private_key

    credential = credentials.Certificate(
        service_account_info
    )

    return firebase_admin.initialize_app(
        credential
    )


firebase_admin_app = initialize_firebase_admin()
