import asyncio
import logging
import os
import re
from difflib import SequenceMatcher

import requests


FACTCHECK_API_URL = (
    "https://factchecktools.googleapis.com/v1alpha1/claims:search"
)


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_claim(text: str) -> str:
    """
    Normalize text before comparing a user claim with
    previously fact-checked claims.
    """

    if not text:
        return ""

    text = text.lower()

    # Remove URLs
    text = re.sub(r"https?://\S+", " ", text)

    # Normalize common contractions
    text = text.replace("isn't", "is not")
    text = text.replace("aren't", "are not")
    text = text.replace("wasn't", "was not")
    text = text.replace("weren't", "were not")
    text = text.replace("don't", "do not")
    text = text.replace("doesn't", "does not")
    text = text.replace("didn't", "did not")
    text = text.replace("can't", "can not")
    text = text.replace("cannot", "can not")

    # Basic semantic normalization
    replacements = {
        "rounded": "round",
        "spherical": "round",
        "sphere": "round",
        "planet earth": "earth",
        "earth's": "earth",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    # Remove punctuation
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


def tokenize_claim(text: str):
    """
    Convert normalized claim into useful comparison tokens.
    """

    normalized = normalize_claim(text)

    if not normalized:
        return set()

    stop_words = {
        "the",
        "a",
        "an",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "of",
        "to",
        "in",
        "on",
        "for",
        "and",
        "or",
        "that",
        "this",
        "it",
        "as",
        "by",
        "with",
        "from",
    }

    return {
        word
        for word in normalized.split()
        if word not in stop_words
    }


# ============================================================
# CLAIM SEARCH QUERY
# ============================================================

def extract_search_query(text: str) -> str:
    """
    Prepare user-provided text for fact-check searching.

    For long articles we currently search the first meaningful
    portion. Individual claim extraction can be added later.
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

                    # IMPORTANT:
                    # This is the actual claim that was
                    # fact-checked.
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
# CLAIM MATCHING
# ============================================================

def calculate_claim_match(
    user_claim: str,
    fact_claim: str,
):
    """
    Determine how closely the user's claim matches the
    claim that was actually fact-checked.

    This is deliberately conservative.

    A related topic is NOT automatically considered the
    same claim.
    """

    if not user_claim or not fact_claim:

        return {
            "score": 0,
            "match": "NO_MATCH",
        }

    user_normalized = normalize_claim(
        user_claim
    )

    fact_normalized = normalize_claim(
        fact_claim
    )

    if not user_normalized or not fact_normalized:

        return {
            "score": 0,
            "match": "NO_MATCH",
        }

    # --------------------------------------------------------
    # EXACT MATCH
    # --------------------------------------------------------

    if user_normalized == fact_normalized:

        return {
            "score": 100,
            "match": "EXACT",
        }

    # --------------------------------------------------------
    # STRING SIMILARITY
    # --------------------------------------------------------

    sequence_score = (
        SequenceMatcher(
            None,
            user_normalized,
            fact_normalized,
        ).ratio()
        * 100
    )

    # --------------------------------------------------------
    # TOKEN OVERLAP
    # --------------------------------------------------------

    user_tokens = tokenize_claim(
        user_claim
    )

    fact_tokens = tokenize_claim(
        fact_claim
    )

    if user_tokens and fact_tokens:

        intersection = (
            user_tokens & fact_tokens
        )

        union = (
            user_tokens | fact_tokens
        )

        token_score = (
            len(intersection)
            / len(union)
        ) * 100

    else:

        token_score = 0

    # --------------------------------------------------------
    # COMBINED SCORE
    # --------------------------------------------------------

    score = (
        sequence_score * 0.45
        + token_score * 0.55
    )

    score = round(
        min(score, 100),
        2
    )

    # --------------------------------------------------------
    # MATCH LEVEL
    # --------------------------------------------------------

    if score >= 85:

        match = "STRONG"

    elif score >= 65:

        match = "POSSIBLE"

    else:

        match = "NO_MATCH"

    return {
        "score": score,
        "match": match,
    }


def rank_fact_checks(
    user_claim: str,
    fact_checks,
):
    """
    Rank fact-check results by actual claim similarity.

    Only results with meaningful claim similarity are
    allowed to influence the final verdict.
    """

    ranked = []

    for item in fact_checks:

        fact_claim = item.get(
            "claim"
        )

        match = calculate_claim_match(
            user_claim,
            fact_claim,
        )

        enriched = {
            **item,
            "matchScore": match["score"],
            "matchType": match["match"],
        }

        ranked.append(
            enriched
        )

    ranked.sort(
        key=lambda item: item.get(
            "matchScore",
            0
        ),
        reverse=True,
    )

    return ranked


# ============================================================
# RATING INTERPRETATION
# ============================================================

def interpret_rating(rating: str):
    """
    Convert publisher rating language into a conservative
    evidence category.

    This does NOT decide the final verdict by itself.
    """

    rating = (
        rating or ""
    ).strip().lower()

    if not rating:

        return "UNKNOWN"

    # Strong negative ratings
    if any(
        phrase in rating
        for phrase in [
            "pants on fire",
            "false",
            "fake",
            "incorrect",
            "not true",
            "untrue",
            "fabricated",
        ]
    ):

        return "FALSE"

    # Misleading / partial negative ratings
    if any(
        phrase in rating
        for phrase in [
            "misleading",
            "mostly false",
            "half false",
            "partly false",
            "false in part",
        ]
    ):

        return "MISLEADING"

    # Strong positive ratings
    if any(
        phrase in rating
        for phrase in [
            "true",
            "correct",
            "accurate",
            "verified",
        ]
    ):

        return "SUPPORTED"

    # Mixed / partial positive ratings
    if any(
        phrase in rating
        for phrase in [
            "mostly true",
            "half true",
            "partly true",
            "true in part",
        ]
    ):

        return "PARTIALLY_SUPPORTED"

    return "UNKNOWN"


# ============================================================
# VERDICT ENGINE
# ============================================================

def build_verdict(
    user_claim,
    fact_checks,
):
    """
    Build an evidence-based preliminary verdict.

    IMPORTANT:

    A fact-check rating is only considered when the
    fact-checked claim itself strongly matches the
    user's claim.
    """

    ranked = rank_fact_checks(
        user_claim,
        fact_checks,
    )

    strong_matches = [
        item
        for item in ranked
        if item.get("matchType") == "STRONG"
    ]

    possible_matches = [
        item
        for item in ranked
        if item.get("matchType") == "POSSIBLE"
    ]

    # ========================================================
    # NO STRONG EVIDENCE
    # ========================================================

    if not strong_matches:

        if possible_matches:

            return {
                "verdict": "NEEDS VERIFICATION",
                "confidence": 35,
                "reason": (
                    "Related fact-checks were found, "
                    "but the available evidence does not "
                    "closely match the exact claim."
                ),
                "matchedEvidence": None,
                "rankedEvidence": ranked,
            }

        return {
            "verdict": "UNVERIFIED",
            "confidence": 0,
            "reason": (
                "No sufficiently matching published "
                "fact-check was found for this claim."
            ),
            "matchedEvidence": None,
            "rankedEvidence": ranked,
        }

    # ========================================================
    # ONLY USE STRONG MATCHES
    # ========================================================

    evidence = []

    for item in strong_matches:

        category = interpret_rating(
            item.get("rating")
        )

        if category != "UNKNOWN":

            evidence.append({
                **item,
                "evidenceCategory": category,
            })

    if not evidence:

        return {
            "verdict": "NEEDS VERIFICATION",
            "confidence": 40,
            "reason": (
                "A closely matching fact-check was found, "
                "but its rating could not be interpreted "
                "reliably."
            ),
            "matchedEvidence": strong_matches[0],
            "rankedEvidence": ranked,
        }

    # ========================================================
    # COUNT EVIDENCE
    # ========================================================

    false_count = sum(
        1
        for item in evidence
        if item["evidenceCategory"]
        in {
            "FALSE",
            "MISLEADING",
        }
    )

    supported_count = sum(
        1
        for item in evidence
        if item["evidenceCategory"]
        in {
            "SUPPORTED",
            "PARTIALLY_SUPPORTED",
        }
    )

    # ========================================================
    # FALSE / MISLEADING
    # ========================================================

    if false_count > supported_count:

        confidence = min(
            65
            + false_count * 8
            + min(
                strong_matches[0]["matchScore"]
                - 85,
                10,
            ),
            95,
        )

        return {
            "verdict": "LIKELY FALSE / MISLEADING",
            "confidence": round(
                confidence
            ),
            "reason": (
                "A closely matching claim has been "
                "previously fact-checked and the available "
                "publishers rated it false or misleading."
            ),
            "matchedEvidence": evidence[0],
            "rankedEvidence": ranked,
        }

    # ========================================================
    # SUPPORTED
    # ========================================================

    if supported_count > false_count:

        confidence = min(
            65
            + supported_count * 8
            + min(
                strong_matches[0]["matchScore"]
                - 85,
                10,
            ),
            95,
        )

        return {
            "verdict": "SUPPORTED",
            "confidence": round(
                confidence
            ),
            "reason": (
                "A closely matching claim has been "
                "previously fact-checked and the available "
                "publishers rated it as supported or accurate."
            ),
            "matchedEvidence": evidence[0],
            "rankedEvidence": ranked,
        }

    # ========================================================
    # CONFLICTING EVIDENCE
    # ========================================================

    return {
        "verdict": "CONFLICTING EVIDENCE",
        "confidence": 50,
        "reason": (
            "Closely matching fact-check sources contain "
            "different assessments of the claim."
        ),
        "matchedEvidence": evidence[0],
        "rankedEvidence": ranked,
    }


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

    title, article = scrape_article(
        url
    )

    return {
        "title": title,
        "content": article,
        "url": url,
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

            loop = (
                asyncio.get_running_loop()
            )

            article = (
                await loop.run_in_executor(
                    executor,
                    scrape_article_sync,
                    url,
                )
            )

        else:

            article = (
                scrape_article_sync(
                    url
                )
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

                "type": (
                    "news_investigation_v2"
                ),

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

    search_query = (
        extract_search_query(
            text
        )
    )

    if executor:

        loop = (
            asyncio.get_running_loop()
        )

        fact_checks = (
            await loop.run_in_executor(
                executor,
                search_fact_checks,
                search_query,
            )
        )

    else:

        fact_checks = (
            search_fact_checks(
                search_query
            )
        )

    # ========================================================
    # BUILD V2 VERDICT
    # ========================================================

    verdict = build_verdict(
        search_query,
        fact_checks,
    )

    # ========================================================
    # BUILD SOURCE LIST
    # ========================================================

    sources = []

    for item in verdict.get(
        "rankedEvidence",
        [],
    ):

        sources.append({

            "publisher": item.get(
                "publisher"
            ),

            "title": item.get(
                "review_title"
            ),

            # VERY IMPORTANT:
            # Show what claim was actually
            # fact-checked.
            "factCheckedClaim": item.get(
                "claim"
            ),

            "claimant": item.get(
                "claimant"
            ),

            "rating": item.get(
                "rating"
            ),

            "evidenceCategory": item.get(
                "evidenceCategory"
            ),

            "matchScore": item.get(
                "matchScore"
            ),

            "matchType": item.get(
                "matchType"
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

        "verdict": verdict.get(
            "verdict"
        ),

        "confidence": verdict.get(
            "confidence"
        ),

        "reason": verdict.get(
            "reason"
        ),

        "query": search_query,

        "matchedClaim": (
            verdict.get(
                "matchedEvidence",
                {}
            ) or {}
        ).get(
            "claim"
        ),

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

                "type": (
                    "news_investigation_v2_result"
                ),

                "input": text,

                "url": url,

                "result": result,

            })

        except Exception as e:

            logging.warning(
                f"MongoDB result logging failed: {e}"
            )

    return result
