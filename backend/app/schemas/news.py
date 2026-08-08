from fastapi import APIRouter, Request

from app.schemas.news import NewsInput
from app.services.news.news_service import analyze_news
from app.core.responses import success_response, error_response

from app.core.news_dependencies import (
    model_ai,
    executor,
    db,
)


router = APIRouter(
    prefix="/api/news",
    tags=["News Intelligence"]
)


@router.post("/check")
async def news_check(request: Request, data: NewsInput):
    try:
        result = await analyze_news(
            text=data.text,
            url=data.url,
            model_ai=model_ai,
            executor=executor,
            db=db,
        )

        return success_response(result)

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
            message="Internal server error",
            status_code=500,
        )
