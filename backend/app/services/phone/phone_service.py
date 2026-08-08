import re
import phonenumbers
from phonenumbers import carrier, geocoder


def analyze_phone(phone: str):
    phone = phone.strip()

    if not re.match(r"^\+?[0-9]{10,15}$", phone):
        raise ValueError("Invalid phone number")

    reasons = []
    score = 0
    carrier_name = "Unknown"
    location = "Unknown"

    try:
        parsed = phonenumbers.parse(phone, "IN")

        is_valid = phonenumbers.is_valid_number(parsed)
        is_possible = phonenumbers.is_possible_number(parsed)

        carrier_name = carrier.name_for_number(parsed, "en") or "Indian Mobile Network"
        location = geocoder.description_for_number(parsed, "en") or "India"

        if not is_valid:
            score += 40
            reasons.append("Invalid number")

        if not is_possible:
            score += 30
            reasons.append("Unusual number format")

    except Exception:
        score += 30
        reasons.append("Parsing failed")

    if phone.endswith(("0000", "9999", "1234")):
        score += 20
        reasons.append("Suspicious pattern")

    if len(phone.replace("+", "")) < 10:
        score += 20
        reasons.append("Too short")

    fraud_score = min(score, 100)

    if fraud_score > 60:
        answer = "This phone number appears risky.\n\n"
    elif fraud_score > 30:
        answer = "This phone number looks suspicious.\n\n"
    else:
        answer = "This phone number appears safe.\n\n"

    answer += f"Carrier: {carrier_name}\n"
    answer += f"Location: {location}\n"

    if reasons:
        answer += "\nObservations:\n"
        for reason in reasons:
            answer += f"• {reason}\n"

    answer += f"\nRisk Score: {fraud_score}%"

    return {
    "answer": answer,
    "carrier": carrier_name,
    "location": location,
    "fraud_score": fraud_score,
    "reasons": reasons,
}
