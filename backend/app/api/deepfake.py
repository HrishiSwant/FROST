import logging

from fastapi import APIRouter, UploadFile, File


from app.services.deepfake.deepfake_service import (
    analyze_deepfake,
)

from app.core.responses import (
    success_response,
    error_response,
)

from app.core.news_dependencies import executor


router = APIRouter(
    prefix="/api/deepfake",
    tags=["Deepfake Intelligence"],
)


@router.post("/check")
async def deepfake_check(
    file: UploadFile = File(...),
):

    try:

        # ================= FILE VALIDATION =================

        if (
            not file.content_type
            or not file.content_type.startswith("image/")
        ):

            return error_response(
                message="Upload image only",
                status_code=400,
            )


        # ================= READ IMAGE =================

        image_bytes = await file.read()

        if not image_bytes:

            return error_response(
                message="Empty file",
                status_code=400,
            )


        # ================= ANALYZE IMAGE =================

        result = await analyze_deepfake(
            image_bytes=image_bytes,
            executor=executor,
        )


        # ================= RESULT =================

        ai_analysis = result.get(
            "ai_analysis",
            "Analysis not available",
        )

        confidence = result.get(
            "confidence",
            0,
        )

        faces = result.get(
            "facesDetected",
            0,
        )

        verdict = result.get(
            "verdict",
            "ERROR",
        )

        blur_score = result.get(
            "blurScore",
        )


        # ================= BUILD RESPONSE =================

        answer = f"{ai_analysis}\n\n"

        answer += f"Verdict: {verdict}\n"

        answer += f"Confidence: {confidence}%\n"

        answer += f"Faces Detected: {faces}\n"

        if blur_score is not None:

            answer += f"Blur Score: {blur_score}\n"


        # ================= RESPONSE =================

        return success_response(
            {
                "answer": answer,
                "verdict": verdict,
                "confidence": confidence,
                "facesDetected": faces,
                "blurScore": blur_score,
                "ai_analysis": ai_analysis,
            }
        )


    except ValueError as e:

        return error_response(
            message=str(e),
            status_code=400,
        )


    except Exception as e:

        logging.error(
            f"Deepfake error: {e}"
        )

        return error_response(
            message="Internal server error",
            status_code=500,
        )
