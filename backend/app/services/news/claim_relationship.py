import re
from difflib import SequenceMatcher


# ============================================================
# STOPWORDS
# ============================================================

STOPWORDS = {
    "a",
    "an",
    "the",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "am",
    "to",
    "of",
    "in",
    "on",
    "at",
    "for",
    "from",
    "with",
    "by",
    "about",
    "as",
    "into",
    "than",
    "that",
    "this",
    "these",
    "those",
    "it",
    "its",
    "they",
    "them",
    "their",
    "there",
    "here",
    "and",
    "or",
    "but",
    "if",
    "then",
    "so",
    "because",
    "while",
    "during",
    "after",
    "before",
    "has",
    "have",
    "had",
    "do",
    "does",
    "did",
    "can",
    "could",
    "may",
    "might",
    "will",
    "would",
    "should",
    "must",
}


# ============================================================
# NEGATION WORDS
# ============================================================

NEGATION_WORDS = {
    "not",
    "no",
    "never",
    "none",
    "neither",
    "nor",
    "without",
    "false",
    "cannot",
    "can't",
    "doesnt",
    "doesn't",
    "isnt",
    "isn't",
    "wasnt",
    "wasn't",
    "wont",
    "won't",
    "dont",
    "don't",
    "didnt",
    "didn't",
}


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_claim(text: str) -> str:
    """
    Normalize a claim so superficial wording differences
    do not prevent matching.
    """

    if not text:
        return ""

    text = text.lower().strip()

    # Normalize apostrophes
    text = text.replace("’", "'")

    # Remove URLs
    text = re.sub(r"https?://\S+", " ", text)

    # Keep letters/numbers
    text = re.sub(r"[^a-z0-9\s']", " ", text)

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


# ============================================================
# TOKENIZATION
# ============================================================

def tokenize_claim(text: str) -> list[str]:
    normalized = normalize_claim(text)

    if not normalized:
        return []

    return normalized.split()


def content_tokens(text: str) -> list[str]:
    """
    Remove common grammatical words while preserving
    important words such as negation.
    """

    tokens = tokenize_claim(text)

    return [
        token
        for token in tokens
        if token not in STOPWORDS
    ]


# ============================================================
# NEGATION DETECTION
# ============================================================

def has_negation(text: str) -> bool:
    tokens = tokenize_claim(text)

    return any(
        token in NEGATION_WORDS
        for token in tokens
    )


# ============================================================
# REMOVE NEGATION
# ============================================================

def remove_negation(text: str) -> str:
    tokens = tokenize_claim(text)

    filtered = [
        token
        for token in tokens
        if token not in NEGATION_WORDS
    ]

    return " ".join(filtered)


# ============================================================
# TOKEN OVERLAP
# ============================================================

def token_overlap(
    user_claim: str,
    fact_claim: str,
) -> float:

    user_tokens = set(content_tokens(user_claim))
    fact_tokens = set(content_tokens(fact_claim))

    if not user_tokens or not fact_tokens:
        return 0.0

    intersection = user_tokens.intersection(
        fact_tokens
    )

    smaller_set_size = min(
        len(user_tokens),
        len(fact_tokens)
    )

    if smaller_set_size == 0:
        return 0.0

    return len(intersection) / smaller_set_size


# ============================================================
# TEXT SIMILARITY
# ============================================================

def text_similarity(
    user_claim: str,
    fact_claim: str,
) -> float:

    user_normalized = normalize_claim(
        user_claim
    )

    fact_normalized = normalize_claim(
        fact_claim
    )

    if not user_normalized or not fact_normalized:
        return 0.0

    return SequenceMatcher(
        None,
        user_normalized,
        fact_normalized,
    ).ratio()


# ============================================================
# POLARITY-AWARE SIMILARITY
# ============================================================

def polarity_similarity(
    user_claim: str,
    fact_claim: str,
) -> float:

    user_without_negation = remove_negation(
        user_claim
    )

    fact_without_negation = remove_negation(
        fact_claim
    )

    if (
        not user_without_negation
        or not fact_without_negation
    ):
        return 0.0

    return SequenceMatcher(
        None,
        user_without_negation,
        fact_without_negation,
    ).ratio()


# ============================================================
# CLAIM RELATIONSHIP
# ============================================================

def classify_relationship(
    user_claim: str,
    fact_claim: str,
) -> dict:

    if not user_claim or not fact_claim:
        return {
            "relationship": "UNRELATED",
            "score": 0,
            "reason": "One or both claims are empty.",
        }

    normalized_user = normalize_claim(
        user_claim
    )

    normalized_fact = normalize_claim(
        fact_claim
    )

    # --------------------------------------------------------
    # EXACT MATCH
    # --------------------------------------------------------

    if normalized_user == normalized_fact:

        return {
            "relationship": "EXACT",
            "score": 100,
            "reason": "The fact-checked claim exactly matches the user claim.",
        }

    # --------------------------------------------------------
    # NEGATION-AWARE COMPARISON
    # --------------------------------------------------------

    user_negated = has_negation(user_claim)
    fact_negated = has_negation(fact_claim)

    polarity_score = polarity_similarity(
        user_claim,
        fact_claim,
    )

    overlap_score = token_overlap(
        user_claim,
        fact_claim,
    )

    raw_similarity = text_similarity(
        user_claim,
        fact_claim,
    )

    # --------------------------------------------------------
    # DIRECT CONTRADICTION
    #
    # Example:
    #
    # User:
    #   The Earth is flat.
    #
    # Fact:
    #   The Earth is not flat.
    # --------------------------------------------------------

    if (
        polarity_score >= 0.80
        and user_negated != fact_negated
    ):

        score = round(
            (
                polarity_score * 0.70
                + overlap_score * 0.20
                + raw_similarity * 0.10
            )
            * 100
        )

        return {
            "relationship": "CONTRADICTS",
            "score": min(score, 100),
            "reason": (
                "The claims describe substantially the same "
                "subject and proposition, but their polarity "
                "is opposite."
            ),
        }

    # --------------------------------------------------------
    # STRONG SUPPORT
    #
    # Same proposition + same polarity.
    # --------------------------------------------------------

    if (
        polarity_score >= 0.88
        and user_negated == fact_negated
    ):

        score = round(
            (
                polarity_score * 0.70
                + overlap_score * 0.20
                + raw_similarity * 0.10
            )
            * 100
        )

        return {
            "relationship": "SUPPORTS",
            "score": min(score, 100),
            "reason": (
                "The fact-checked claim substantially matches "
                "the user's claim with the same polarity."
            ),
        }

    # --------------------------------------------------------
    # POSSIBLE SUPPORT
    # --------------------------------------------------------

    if (
        polarity_score >= 0.72
        and overlap_score >= 0.60
        and user_negated == fact_negated
    ):

        score = round(
            (
                polarity_score * 0.65
                + overlap_score * 0.25
                + raw_similarity * 0.10
            )
            * 100
        )

        return {
            "relationship": "POSSIBLY_SUPPORTS",
            "score": min(score, 100),
            "reason": (
                "The claims appear similar and have matching "
                "polarity, but the match is not strong enough "
                "to establish direct support."
            ),
        }

    # --------------------------------------------------------
    # RELATED
    #
    # Important:
    # Related evidence MUST NOT automatically determine
    # the final verdict.
    # --------------------------------------------------------

    if (
        overlap_score >= 0.50
        or polarity_score >= 0.55
    ):

        score = round(
            max(
                overlap_score,
                polarity_score,
                raw_similarity * 0.80,
            )
            * 100
        )

        return {
            "relationship": "RELATED",
            "score": min(score, 100),
            "reason": (
                "The fact-check discusses a related topic, "
                "but does not directly establish or contradict "
                "the user's exact claim."
            ),
        }

    # --------------------------------------------------------
    # UNRELATED
    # --------------------------------------------------------

    return {
        "relationship": "UNRELATED",
        "score": round(
            max(
                raw_similarity * 100,
                overlap_score * 100,
            )
        ),
        "reason": (
            "The published fact-check does not contain "
            "sufficiently matching information."
        ),
    }


# ============================================================
# BEST RELATIONSHIP
# ============================================================

RELATIONSHIP_PRIORITY = {
    "EXACT": 5,
    "CONTRADICTS": 4,
    "SUPPORTS": 4,
    "POSSIBLY_SUPPORTS": 3,
    "RELATED": 2,
    "UNRELATED": 1,
}


def choose_best_relationship(
    user_claim: str,
    fact_checks: list[dict],
) -> dict | None:

    if not fact_checks:
        return None

    best = None

    for fact_check in fact_checks:

        fact_claim = fact_check.get(
            "factCheckedClaim",
            ""
        )

        if not fact_claim:
            continue

        relationship = classify_relationship(
            user_claim,
            fact_claim,
        )

        candidate = {
            **fact_check,
            "relationship": relationship[
                "relationship"
            ],
            "matchScore": relationship[
                "score"
            ],
            "matchReason": relationship[
                "reason"
            ],
        }

        if best is None:
            best = candidate
            continue

        current_priority = RELATIONSHIP_PRIORITY.get(
            candidate["relationship"],
            0,
        )

        best_priority = RELATIONSHIP_PRIORITY.get(
            best["relationship"],
            0,
        )

        # Prefer relationship quality first.
        if current_priority > best_priority:
            best = candidate
            continue

        # If relationship quality is equal,
        # prefer higher match score.
        if (
            current_priority == best_priority
            and candidate["matchScore"]
            > best["matchScore"]
        ):
            best = candidate

    return best
