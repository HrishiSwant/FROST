import asyncio
import logging
import os
import re

import requests


FACTCHECK_API_URL = (
    "https://factchecktools.googleapis.com/v1alpha1/claims:search"
)


# ============================================================
# TEXT EXTRACTION
# ============================================================

def extract_search_query(text: str) -> str:
    """
    Prepare user-provided news text for evidence searching.

    For now we use the first meaningful portion of the text.
    The V2 system will later extract individual claims.
    """

    cleaned = re.sub(r"\s+", " ", text).strip()

    if len(cleaned) > 500:
        cleaned = cleaned[:500]

    return cleaned


# ============================================================
# FACT CHECK SEARCH
# ============================================================

def search_fact_checks(query: str):
    """
    Search Google's Fact Check Claim Search API.

    Returns previously published fact-check evidence.
    """

    api_key = os.getenv("FACTCHECK_API_KEY")

    if not api_key:
        logging.warning(
            "FACTCHECK_API_KEY not configured"
        )

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

        for claim in claims:

            reviews = claim.get(
                "claimReview",
                []
            )

            for review in reviews:

                publisher = review.get(
                    "publisher",
                    {}
                )

                results.append({
                    "claim": claim.get(
                        "text"
                    ),

                    "claimant": claim.get(
                        "claimant"
                    ),

                    "claim_date": claim.get(
                        "claimDate"
                    ),

                    "publisher": publisher.get(
                        "name"
                    ),

                    "publisher_site": publisher.get(
                        "site"
                    ),

                    "review_title": review.get(
                        "title"
                    ),

                    "rating": review.get(
                        "textualRating"
                    ),

                    "review_date": review.get(
                        "reviewDate"
                    ),

                    "url": review.get(
                        "url"
                    ),
                })

        return results

    except requests.RequestException as e:

        logging.error(
            f"Fact Check API request failed: {e}"
        )

        return []

    except Exception as e:

        logging.error(
            f"Fact Check processing failed: {e}"
        )

        return []


# ============================================================
# ARTICLE SCRAPING
# ============================================================

def scrape_article_sync(url: str):
    """
    Scrape a public article URL.

    This is evidence collection only.
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
# EVIDENCE ANALYSIS
# ============================================================

def build_verdict(fact_checks):
    """
    Determine an evidence-based preliminary verdict.

    This does NOT claim absolute truth.
    """

    if not fact_checks:

        return {
            "verdict": "UNVERIFIED",
            "confidence": 0,
            "reason": (
                "No matching published fact-check "
                "was found in the current evidence source."
            ),
        }

    ratings = []

    for item in fact_checks:

        rating = (
            item.get("rating") or ""
        ).lower()

        ratings.append(rating)

    false_keywords = [
        "false",
        "mostly false",
        "pants on fire",
        "fake",
        "incorrect",
        "misleading",
    ]

    true_keywords = [
        "true",
        "mostly true",
        "correct",
        "accurate",
    ]

    false_matches = 0
    true_matches = 0

    for rating in ratings:

        if any(
            keyword in rating
            for keyword in false_keywords
        ):
            false_matches += 1

        elif any(
            keyword in rating
            for keyword in true_keywords
        ):
            true_matches += 1

    if false_matches > true_matches:

        return {
            "verdict": "LIKELY FALSE / MISLEADING",
            "confidence": min(
                50 + false_matches * 10,
                95
            ),
            "reason": (
                "Existing fact-check sources contain "
                "ratings indicating that matching claims "
                "were false or misleading."
            ),
        }

    if true_matches > false_matches:

        return {
            "verdict": "SUPPORTED",
            "confidence": min(
                50 + true_matches * 10,
                95
            ),
            "reason": (
                "Existing fact-check sources contain "
                "ratings supporting matching claims."
            ),
        }

    return {
        "verdict": "CONFLICTING EVIDENCE",
        "confidence": 50,
        "reason": (
            "Available fact-check sources contain "
            "different assessments."
        ),
    }


# ============================================================
# MAIN NEWS INTELLIGENCE V2
# ============================================================

async def analyze_news(
    text=None,
    url=None,
    executor=None,
    db=None,
):

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

            article = scrape_article_sync(
                url
            )

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
            "No news content available for analysis"
        )

    text = text.strip()

    # ========================================================
    # LOG INVESTIGATION
    # ========================================================

    if db is not None:

        try:

            db.logs.insert_one({
                "type": "news_investigation_v2",
                "input": text,
                "url": url,
            })

        except Exception as e:

            logging.warning(
                f"MongoDB logging failed: {e}"
            )

    # ========================================================
    # SEARCH EXISTING FACT CHECKS
    # ========================================================

    search_query = extract_search_query(
        text
    )

    loop = asyncio.get_running_loop()

    fact_checks = await loop.run_in_executor(
        executor,
        search_fact_checks,
        search_query,
    ) if executor else search_fact_checks(
        search_query
    )

    # ========================================================
    # BUILD VERDICT
    # ========================================================

    verdict = build_verdict(
        fact_checks
    )

    # ========================================================
    # BUILD SOURCE LIST
    # ========================================================

    sources = []

    for item in fact_checks:

        sources.append({
            "publisher": item.get(
                "publisher"
            ),

            "title": item.get(
                "review_title"
            ),

            "rating": item.get(
                "rating"
            ),

            "reviewDate": item.get(
                "review_date"
            ),

            "url": item.get(
                "url"
            ),
        })

    # ========================================================
    # RESULT
    # ========================================================

    result = {

        "version": "2",

        "verdict": verdict[
            "verdict"
        ],

        "confidence": verdict[
            "confidence"
        ],

        "reason": verdict[
            "reason"
        ],

        "query": search_query,

        "sources": sources,

        "sourceCount": len(
            sources
        ),

        "article": article,

    }

    # ========================================================
    # SAVE RESULT
    # ========================================================

    if db is not None:

        try:

            db.logs.insert_one({
                "type": "news_investigation_v2_result",
                "input": text,
                "url": url,
                "result": result,
            })

        except Exception as e:

            logging.warning(
                f"MongoDB result logging failed: {e}"
            )

    return result
