from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, UploadFile, File

from app.core.responses import success_response, error_response
from app.services.deepfake.deepfake_service import analyze_deepfake


router = APIRouter(
    prefix="/api/deepfake",
    tags=["Deepfake Detection"]
)


# Executor used for image analysis
executor = ThreadPoolExecutor()


@router.post("/check")
async def deepfake_check(
    file: UploadFile = File(...)
):

    try:

        # ---------------- FILE VALIDATION ----------------

        if (
            not file.content_type
            or not file.content_type.startswith("image/")
        ):
            return error_response(
                message="Upload image only",
                status_code=400
            )


        # ---------------- READ IMAGE ----------------

        image_bytes = await file.read()

        if not image_bytes:
            return error_response(
                message="Empty file",
                status_code=400
            )


        # ---------------- ANALYZE IMAGE ----------------

        result = await analyze_deepfake(
            image_bytes,
            executor
        )


        # ---------------- ANALYSIS ERROR ----------------

        if result.get("verdict") == "ERROR":

            return error_response(
                message=result.get(
                    "error",
                    "Image analysis failed"
                ),
                status_code=500
            )


        # ---------------- RESULT VALUES ----------------

        verdict = result.get(
            "verdict",
            "UNKNOWN"
        )

        confidence = result.get(
            "confidence",
            0
        )

        faces = result.get(
            "facesDetected",
            0
        )

        blur_score = result.get(
            "blurScore"
        )

        noise_score = result.get(
            "noiseScore"
        )

        method = result.get(
            "method",
            "Forensic image analysis"
        )


        # ---------------- BUILD ANSWER ----------------

        answer = (
            "Deepfake analysis completed.\n\n"
            f"Verdict: {verdict}\n"
            f"Confidence: {confidence}%\n"
            f"Faces Detected: {faces}\n"
        )

        if blur_score is not None:
            answer += f"Blur Score: {blur_score}\n"

        if noise_score is not None:
            answer += f"Noise Score: {noise_score}\n"

        answer += f"Method: {method}"


        # ---------------- SUCCESS RESPONSE ----------------

        return success_response(
            data={
                "answer": answer,
                "verdict": verdict,
                "confidence": confidence,
                "facesDetected": faces,
                "blurScore": blur_score,
                "noiseScore": noise_score,
                "method": method
            }
        )


    except ValueError as e:

        return error_response(
            message=str(e),
            status_code=400
        )


    except Exception as e:

        return error_response(
            message="Internal server error",
            status_code=500,
            errors=str(e)
        )
