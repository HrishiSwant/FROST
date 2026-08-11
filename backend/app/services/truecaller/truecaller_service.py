import asyncio
import os
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


async def fetch_truecaller_profile(
    access_token: str,
    endpoint: str,
):
    if not access_token:
        raise ValueError(
            "Truecaller access token is missing"
        )

    if not endpoint:
        raise ValueError(
            "Truecaller profile endpoint is missing"
        )

    request = Request(
        endpoint,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Cache-Control": "no-cache",
            "Accept": "application/json",
        },
        method="GET",
    )

    def perform_request():
        with urlopen(
            request,
            timeout=10,
        ) as response:
            return response.read().decode("utf-8")

    try:
        response_body = await asyncio.to_thread(
            perform_request
        )

    except HTTPError as exc:
        if exc.code == 401:
            raise RuntimeError(
                "Truecaller access token is invalid or expired"
            )

        raise RuntimeError(
            f"Truecaller profile request failed with status {exc.code}"
        )

    except URLError:
        raise RuntimeError(
            "Unable to connect to Truecaller"
        )

    except Exception:
        raise RuntimeError(
            "Truecaller profile request failed"
        )

    import json

    try:
        return json.loads(response_body)

    except json.JSONDecodeError:
        raise RuntimeError(
            "Invalid profile response received from Truecaller"
        )
