import re


def preprocess(text: str):
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z ]", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def fake_signals(text: str):
    score = 0
    reasons = []

    keywords = [
        "breaking",
        "shocking",
        "viral",
        "exposed",
    ]

    for keyword in keywords:
        if keyword in text:
            score += 10
            reasons.append(
                f"Clickbait keyword: {keyword}"
            )

    if text.count("!") > 2:
        score += 10
        reasons.append(
            "Excessive punctuation"
        )

    return score, reasons
