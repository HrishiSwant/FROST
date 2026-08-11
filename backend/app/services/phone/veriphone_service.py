import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import asyncio


VERIPHONE_URL = "https://api.veriphone.io/v3/verify"


async def verify_phone_with_veriphone(
    phone: str,
    default_country: str = "IN",
):
    api_key = os.getenv("VERIPHONE_API_KEY")

    if not api_key:
        raise RuntimeError(
            "VERIPHONE_API_KEY is not configured"
        )

    params = urlencode(
        {
            "phone": phone,
            "default_country": default_country,
            "mode": "static",
        }
    )

    request = Request(
        f"{VERIPHONE_URL}?{params}",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
        },
        method="GET",
    )

    def perform_request():
        with urlopen(request, timeout=10) as response:
            return response.read().decode("utf-8")

    try:
        response_body = await asyncio.to_thread(
            perform_request
        )

    except HTTPError as exc:
        if exc.code == 401:
            raise RuntimeError(
                "Veriphone API key is invalid"
            )

        if exc.code == 402:
            raise RuntimeError(
                "Veriphone API credits are exhausted"
            )

        if exc.code == 429:
            raise RuntimeError(
                "Veriphone API rate limit exceeded"
            )

        raise RuntimeError(
            f"Veriphone API request failed with status {exc.code}"
        )

    except URLError:
        raise RuntimeError(
            "Unable to connect to Veriphone"
        )

    except Exception:
        raise RuntimeError(
            "Veriphone request failed"
        )

    import json

    try:
        data = json.loads(response_body)
    except json.JSONDecodeError:
        raise RuntimeError(
            "Invalid response received from Veriphone"
        )

    if data.get("status") == "error":
        raise RuntimeError(
            data.get(
                "message",
                "Veriphone verification failed",
            )
        )

    return data