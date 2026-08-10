import asyncio

from fastapi import APIRouter, Request

from app.schemas.news import (
    NewsInput,
    NYTSearchInput,
)

from app.services.news.news_service import (
    analyze_news,
)

from app.services.news.nyt_service import (
    search_nyt_articles,
)

from app.core.responses import (
    success_response,
    error_response,
)

from app.core.news_dependencies import (
    executor,
    db,
)


router = APIRouter(
    prefix="/api/news",
    tags=["News Intelligence"],
)


# ============================================================
# GOOGLE FACT CHECK
# ============================================================

@router.post("/check")
async def news_check(
    request: Request,
    data: NewsInput,
):

    try:

        result = await analyze_news(
            text=data.text,
            url=data.url,
            executor=executor,
            db=db,
        )

        return success_response(
            result
        )

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


# ============================================================
# NEW YORK TIMES SEARCH
# ============================================================

@router.post("/nyt")
async def nyt_search(
    data: NYTSearchInput,
):

    try:

        if not data.query.strip():

            return error_response(
                message="Search query is required",
                status_code=400,
            )

        loop = asyncio.get_running_loop()

        result = await loop.run_in_executor(
            executor,
            search_nyt_articles,
            data.query.strip(),
        )

        return success_response(
            data=result
        )

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
            message="New York Times search failed",
            status_code=500,
        )
