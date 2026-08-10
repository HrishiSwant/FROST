import asyncio
import logging
import os
import re

import requests


FACTCHECK_API_URL = (
    "https://factchecktools.googleapis.com/v1alpha1/claims:search"
)


# ============================================================
# SEARCH QUERY
# ============================================================

def extract_search_query(text: str) -> str:
    """
    Prepare user-provided text for Google's Fact Check
    Claim Search API.

    No claim interpretation is performed here.
    """

    if not text:
        return ""

    cleaned = re.sub(r"\s+", " ", text).strip()

    # Google search query should not become excessively large.
    if len(cleaned) > 500:
        cleaned = cleaned[:500]

    return cleaned


# ============================================================
# GOOGLE FACT CHECK SEARCH
# ============================================================

def search_fact_checks(query: str):
    """
    Search Google's Fact Check Claim Search API.

    IMPORTANT:
    This function does NOT decide whether a claim is true
    or false.

    It only retrieves fact-checks that Google has indexed
    from published fact-checking organizations.
    """

    api_key = os.getenv("FACTCHECK_API_KEY")

    if not api_key:
        raise RuntimeError(
            "FACTCHECK_API_KEY is not configured"
        )

    if not query:
        return []

    try:
        response = requests.get(
            FACTCHECK_API_URL,
            params={
                "query": query,
                "languageCode": "en",
                "pageSize": 10,
                "key": api_key,
            },
            timeout=10,
        )

        response.raise_for_status()

        data = response.json()

        claims = data.get("claims", [])

        results = []

        # Preserve Google's returned order.
        for claim in claims:

            claim_text = claim.get("text")

            claimant = claim.get("claimant")

            claim_date = claim.get("claimDate")

            reviews = claim.get("claimReview", [])

            for review in reviews:

                publisher = review.get(
                    "publisher",
                    {}
                )

                results.append(
                    {
                        # The original claim that was
                        # fact-checked.
                        "factCheckedClaim": claim_text,

                        "claimant": claimant,

                        "claimDate": claim_date,

                        # Publisher information.
                        "publisher": publisher.get(
                            "name"
                        ),

                        "publisherSite": publisher.get(
                            "site"
                        ),

                        # Publisher's original review.
                        "title": review.get(
                            "title"
                        ),

                        # IMPORTANT:
                        # This is the publisher's rating.
                        # FROST does not interpret it.
                        "rating": review.get(
                            "textualRating"
                        ),

                        "reviewDate": review.get(
                            "reviewDate"
                        ),

                        "url": review.get(
                            "url"
                        ),
                    }
                )

        return results

    except requests.RequestException as e:

        logging.error(
            f"Google Fact Check API request failed: {e}"
        )

        raise RuntimeError(
            "Google Fact Check service is temporarily unavailable"
        )

    except Exception as e:

        logging.error(
            f"Fact Check processing failed: {e}"
        )

        raise RuntimeError(
            "Unable to process Google Fact Check results"
        )


# ============================================================
# ARTICLE SCRAPING
# ============================================================

def scrape_article_sync(url: str):

    """
    Scrape a public article URL.

    This is only used to obtain text that can be searched
    through Google's Fact Check API.

    It does NOT determine whether the article is true.
    """

    from app.services.news.scraper import (
        scrape_article,
    )

    title, article = scrape_article(url)

    return {
        "title": title,
        "content": article,
        "url": url,
    }


# ============================================================
# MAIN NEWS INTELLIGENCE
# ============================================================

async def analyze_news(
    text=None,
    url=None,
    executor=None,
    db=None,
):
    """
    News Intelligence V3.

    Pipeline:

        User input
             ↓
        Extract text
             ↓
        Google Fact Check Claim Search
             ↓
        Return published fact-check results
             ↓
        User evaluates the evidence

    FROST does NOT create its own verdict.
    """

    if not text and not url:

        raise ValueError(
            "Provide news text or URL"
        )

    # ========================================================
    # COLLECT INPUT
    # ========================================================

    article = None

    if url:

        if executor:

            loop = asyncio.get_running_loop()

            article = await loop.run_in_executor(
                executor,
                scrape_article_sync,
                url,
            )

        else:

            article = scrape_article_sync(url)

        if article.get("content"):

            text = (
                f"{article.get('title', '')} "
                f"{article.get('content', '')}"
            )

        elif not text:

            raise ValueError(
                "Could not extract article content"
            )

    if not text:

        raise ValueError(
            "No news content available"
        )

    text = text.strip()

    # ========================================================
    # BUILD GOOGLE SEARCH QUERY
    # ========================================================

    search_query = extract_search_query(text)

    if not search_query:

        raise ValueError(
            "No searchable claim was provided"
        )

    # ========================================================
    # LOG INVESTIGATION
    # ========================================================

    if db is not None:

        try:

            db.logs.insert_one(
                {
                    "type": "news_factcheck_search",
                    "input": text,
                    "url": url,
                    "query": search_query,
                }
            )

        except Exception as e:

            logging.warning(
                f"MongoDB logging failed: {e}"
            )

    # ========================================================
    # GOOGLE FACT CHECK SEARCH
    # ========================================================

    if executor:

        loop = asyncio.get_running_loop()

        fact_checks = await loop.run_in_executor(
            executor,
            search_fact_checks,
            search_query,
        )

    else:

        fact_checks = search_fact_checks(
            search_query
        )

    # ========================================================
    # RESULT
    # ========================================================

    result = {
        "version": "3",
        "query": search_query,
        "resultCount": len(fact_checks),
        "sources": fact_checks,
        "article": article,
    }

    # ========================================================
    # SAVE RESULT
    # ========================================================

    if db is not None:

        try:

            db.logs.insert_one(
                {
                    "type": "news_factcheck_result",
                    "input": text,
                    "url": url,
                    "query": search_query,
                    "resultCount": len(fact_checks),
                }
            )

        except Exception as e:

            logging.warning(
                f"MongoDB result logging failed: {e}"
            )

    return result
