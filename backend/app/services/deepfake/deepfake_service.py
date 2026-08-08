import asyncio

from deepfake_detector import analyze_image


async def analyze_deepfake(
    image_bytes: bytes,
    executor,
):
    """
    Run deepfake image analysis without blocking
    the FastAPI event loop.
    """

    if not image_bytes:
        raise ValueError("Empty file")

    loop = asyncio.get_event_loop()

    result = await loop.run_in_executor(
        executor,
        analyze_image,
        image_bytes,
    )

    return result
