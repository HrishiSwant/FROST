import re
from difflib import SequenceMatcher


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_claim(text: str) -> str:
    if not text:
        return ""

    text = text.lower().strip()

    # Remove URLs
    text = re.sub(
        r"https?://\S+",
        " ",
        text,
    )

    # Common contractions
    replacements = {
        "isn't": "is not",
        "aren't": "are not",
        "wasn't": "was not",
        "weren't": "were not",
        "doesn't": "does not",
        "don't": "do not",
        "didn't": "did not",
        "can't": "can not",
        "cannot": "can not",
        "won't": "will not",
    }

    for old, new in replacements.items():
        text = text.replace(
            old,
            new,
        )

    # ========================================================
    # SEMANTIC NORMALIZATION
    # ========================================================

    replacements = {
        # Earth shape
        "rounded": "round",
        "spherical": "round",
        "sphere": "round",
        "roughly spherical": "round",
        "roughly round": "round",

        # Earth references
        "planet earth": "earth",
        "earth's": "earth",

        # Common equivalent words
        "fabricated": "fake",
        "incorrect": "false",
        "untrue": "false",
    }

    for old, new in replacements.items():
        text = text.replace(
            old,
            new,
        )

    # Remove punctuation
    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text,
    )

    # Normalize whitespace
    text = re.sub(
        r"\s+",
        " ",
        text,
    ).strip()

    return text


# ============================================================
# NEGATION
# ============================================================

NEGATION_WORDS = {
    "not",
    "no",
    "never",
    "false",
    "fake",
    "incorrect",
    "untrue",
}


def remove_negation(text: str) -> str:

    words = text.split()

    return " ".join(
        word
        for word in words
        if word not in NEGATION_WORDS
    )


def has_negation(text: str) -> bool:

    words = set(
        normalize_claim(text).split()
    )

    return bool(
        words & NEGATION_WORDS
    )


# ============================================================
# CONCEPT NORMALIZATION
# ============================================================

def canonical_concept(text: str) -> str:

    normalized = normalize_claim(text)

    # Earth shape concepts
    if (
        "earth" in normalized
        and "round" in normalized
    ):
        return "earth_shape_round"

    if (
        "earth" in normalized
        and "flat" in normalized
    ):
        return "earth_shape_flat"

    return ""


# ============================================================
# CONTRADICTION PAIRS
# ============================================================

CONTRADICTION_PAIRS = {
    (
        "earth_shape_flat",
        "earth_shape_round",
    ),

    (
        "earth_shape_round",
        "earth_shape_flat",
    ),
}


# ============================================================
# RELATIONSHIP ENGINE
# ============================================================

def classify_relationship(
    user_claim: str,
    fact_claim: str,
):

    if not user_claim or not fact_claim:

        return {
            "relationship": "UNRELATED",
            "score": 0,
            "reason": "One or both claims are empty.",
        }

    user_normalized = normalize_claim(
        user_claim
    )

    fact_normalized = normalize_claim(
        fact_claim
    )

    if not user_normalized or not fact_normalized:

        return {
            "relationship": "UNRELATED",
            "score": 0,
            "reason": "Claims could not be normalized.",
        }

    # ========================================================
    # EXACT
    # ========================================================

    if user_normalized == fact_normalized:

        return {
            "relationship": "EXACT",
            "score": 100,
            "reason": (
                "The user claim and fact-checked claim "
                "are equivalent after normalization."
            ),
        }

    # ========================================================
    # CANONICAL CONCEPTS
    # ========================================================

    user_concept = canonical_concept(
        user_claim
    )

    fact_concept = canonical_concept(
        fact_claim
    )

    # ========================================================
    # EXPLICIT NEGATION
    # ========================================================

    user_negated = has_negation(
        user_claim
    )

    fact_negated = has_negation(
        fact_claim
    )

    user_without_negation = (
        remove_negation(
            user_normalized
        )
    )

    fact_without_negation = (
        remove_negation(
            fact_normalized
        )
    )

    # Same underlying claim but opposite polarity
    if (
        user_without_negation
        == fact_without_negation
        and user_negated
        != fact_negated
    ):

        return {
            "relationship": "CONTRADICTS",
            "score": 98,
            "reason": (
                "The claims express the same underlying "
                "proposition but use opposite polarity."
            ),
        }

    # ========================================================
    # CANONICAL CONTRADICTION
    # ========================================================

    if (
        user_concept
        and fact_concept
        and (
            user_concept,
            fact_concept,
        )
        in CONTRADICTION_PAIRS
    ):

        return {
            "relationship": "CONTRADICTS",
            "score": 96,
            "reason": (
                "The claims refer to the same subject "
                "but assert mutually incompatible concepts."
            ),
        }

    # ========================================================
    # SAME CANONICAL CONCEPT
    # ========================================================

    if (
        user_concept
        and fact_concept
        and user_concept == fact_concept
    ):

        return {
            "relationship": "SUPPORTS",
            "score": 94,
            "reason": (
                "Both claims express the same normalized "
                "concept."
            ),
        }

    # ========================================================
    # STRING SIMILARITY
    # ========================================================

    similarity = (
        SequenceMatcher(
            None,
            user_normalized,
            fact_normalized,
        ).ratio()
        * 100
    )

    similarity = round(
        similarity,
        2,
    )

    if similarity >= 90:

        return {
            "relationship": "POSSIBLY_SUPPORTS",
            "score": similarity,
            "reason": (
                "The claims are highly similar, "
                "but their semantic relationship "
                "could not be established with certainty."
            ),
        }

    if similarity >= 65:

        return {
            "relationship": "RELATED",
            "score": similarity,
            "reason": (
                "The claims share substantial wording "
                "but are not sufficiently equivalent "
                "to determine the same claim."
            ),
        }

    return {
        "relationship": "UNRELATED",
        "score": similarity,
        "reason": (
            "The claims do not have enough similarity "
            "to establish a meaningful relationship."
        ),
    }
