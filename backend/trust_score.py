def calculate_trust_score(deepfake=None, news=None, phone=None):
    score = 100
    reasons = []

    if deepfake and deepfake.get("verdict") == "FAKE":
        score -= 40
        reasons.append("Deepfake detected")

    if news and news.get("verdict") == "FAKE":
        score -= 30
        reasons.append("Fake news detected")

    if phone and phone.get("fraudScore", 0) > 50:
        score -= 30
        reasons.append("Suspicious phone number")

    if score > 70:
        risk = "LOW"
    elif score > 40:
        risk = "MEDIUM"
    else:
        risk = "HIGH"

    return {
        "score": score,
        "risk": risk,
        "reasons": reasons
    }
