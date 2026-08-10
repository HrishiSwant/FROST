# ================= SOURCE REGISTRY =================
#
# Central registry for all external news sources.
# Add new sources here instead of expanding news.py.
#

NEWS_SOURCES = {
    "nyt": {
        "id": "nyt",
        "name": "The New York Times",
        "short_name": "NYT",
        "description": (
            "News articles and coverage published "
            "by The New York Times."
        ),
        "type": "news",
        "search_enabled": True,
    },
}


def get_source(source_id: str):
    """
    Return source configuration by ID.
    """
    return NEWS_SOURCES.get(source_id)


def get_all_sources():
    """
    Return all registered news sources.
    """
    return list(NEWS_SOURCES.values())
