import logging
import os

import requests


NYT_API_URL = (
    "https://api.nytimes.com/svc/search/v2/articlesearch.json"
)


def search_nyt_articles(query: str):
    """
    Search The New York Times Article Search API.

    This returns NYT article coverage only.
    It does not determine whether a claim is true or false.
    """

    query = (query or "").strip()

    if not query:
        raise ValueError("Search query is required")

    api_key = os.getenv("NYT_API_KEY")

    if not api_key:
        raise RuntimeError(
            "NYT API service is not configured"
        )

    try:
        response = requests.get(
            NYT_API_URL,
            params={
                "q": query[:500],
                "sort": "newest",
                "api-key": api_key,
            },
            timeout=10,
        )

        response.raise_for_status()

        data = response.json()

        response_data = data.get(
            "response",
            {}
        )

        docs = response_data.get(
            "docs",
            []
        )

        articles = []

        for article in docs:

            headline = article.get(
                "headline",
                {}
            )

            articles.append({
                "title": (
                    headline.get("main")
                    or "Untitled NYT article"
                ),
                "abstract": (
                    article.get("abstract")
                    or article.get("snippet")
                    or ""
                ),
                "publishedDate": article.get(
                    "pub_date"
                ),
                "url": article.get(
                    "web_url"
                ),
                "source": (
                    article.get("source")
                    or "The New York Times"
                ),
            })

        return {
            "source": "The New York Times",
            "query": query,
            "resultCount": len(articles),
            "articles": articles,
        }

    except requests.RequestException as e:

        logging.error(
            f"NYT API request failed: {e}"
        )

        raise RuntimeError(
            "New York Times search failed"
        )

    except Exception as e:

        logging.error(
            f"NYT processing failed: {e}"
        )

        raise
