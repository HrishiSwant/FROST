from fastapi import APIRouter

from app.core.responses import (
    success_response,
    error_response,
)

from app.services.news.source_registry import (
    get_source,
    get_all_sources,
)

from app.services.news.nyt_service import (
    search_nyt_articles,
)

from app.schemas.news import NYTSearchInput


router = APIRouter(
    prefix="/api/news/sources",
    tags=["News Sources"],
)


# =========================================================
# LIST AVAILABLE SOURCES
# =========================================================

@router.get("")
async def list_sources():

    return success_response(
        get_all_sources()
    )


# =========================================================
# SEARCH SOURCE
# =========================================================

@router.post("/{source_id}/search")
async def search_source(
    source_id: str,
    data: NYTSearchInput,
):

    source = get_source(source_id)

    if not source:
        return error_response(
            message="News source not supported",
            status_code=404,
        )

    if not source.get("search_enabled"):
        return error_response(
            message=(
                f"Search is not available for "
                f"{source['name']}"
            ),
            status_code=400,
        )

    if not data.query or not data.query.strip():
        return error_response(
            message="Search query is required",
            status_code=400,
        )

    query = data.query.strip()

    try:

        # ================= NYT =================

        if source_id == "nyt":

            result = await search_nyt_articles(
                query
            )

            return success_response(
                result
            )

        # ================= FUTURE SOURCES =================
        #
        # Reuters
        # BBC
        # Guardian
        # etc.
        #
        # Their implementations will be
        # added through separate services.
        #


        return error_response(
            message=(
                f"{source['name']} search "
                "is not implemented yet"
            ),
            status_code=501,
        )

    except Exception as e:

        return error_response(
            message=(
                f"{source['name']} search failed"
            ),
            status_code=500,
            errors=str(e),
        )
