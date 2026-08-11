import re

import phonenumbers
from phonenumbers import carrier, geocoder

from app.services.phone.veriphone_service import (
    verify_phone_with_veriphone,
)


async def analyze_phone(phone: str):
    phone = phone.strip()

    if not re.match(r"^\+?[0-9]{10,15}$", phone):
        raise ValueError(
            "Invalid phone number format"
        )

    reasons = []
    score = 0

    carrier_name = "Unknown"
    location = "Unknown"

    is_valid = False
    is_possible = False

    # ---------------------------------------------------------
    # Local phone-number analysis
    # ---------------------------------------------------------

    try:
        parsed = phonenumbers.parse(
            phone,
            "IN",
        )

        is_valid = phonenumbers.is_valid_number(
            parsed
        )

        is_possible = phonenumbers.is_possible_number(
            parsed
        )

        carrier_name = (
            carrier.name_for_number(
                parsed,
                "en",
            )
            or "Unknown"
        )

        location = (
            geocoder.description_for_number(
                parsed,
                "en",
            )
            or "Unknown"
        )

    except phonenumbers.NumberParseException:
        reasons.append(
            "The number could not be parsed"
        )
        score += 40

    except Exception:
        reasons.append(
            "Local phone-number analysis failed"
        )
        score += 20

    # ---------------------------------------------------------
    # Veriphone
    # ---------------------------------------------------------

    veriphone = None

    try:
        veriphone = await verify_phone_with_veriphone(
            phone=phone,
            default_country="IN",
        )

    except RuntimeError as exc:
        # We keep local analysis available even if
        # the external provider is temporarily unavailable.
        reasons.append(
            "External phone intelligence was unavailable"
        )

    # ---------------------------------------------------------
    # Merge Veriphone data
    # ---------------------------------------------------------

    if veriphone:
        veriphone_valid = veriphone.get(
            "phone_valid"
        )

        if veriphone_valid is False:
            score += 40

            reasons.append(
                "Veriphone could not validate this number"
            )

        country = veriphone.get(
            "country",
            "Unknown",
        )

        region = veriphone.get(
            "phone_region",
            "Unknown",
        )

        line_type = veriphone.get(
            "phone_type",
            "Unknown",
        )

        veriphone_carrier = veriphone.get(
            "carrier"
        )

        if veriphone_carrier:
            carrier_name = veriphone_carrier

        if region and region != "Unknown":
            location = region

        # VoIP is a signal, not proof of fraud.
        if line_type.lower() == "voip":
            score += 20

            reasons.append(
                "The number is classified as VoIP"
            )

    else:
        country = "Unknown"
        region = location
        line_type = "Unknown"

    # ---------------------------------------------------------
    # Local risk signals
    # ---------------------------------------------------------

    if not is_valid:
        score += 40

        reasons.append(
            "The number is not valid according to local numbering rules"
        )

    elif not is_possible:
        score += 25

        reasons.append(
            "The number format is unusual"
        )

    digits = phone.replace("+", "")

    # Weak pattern signal only.
    if digits.endswith(
        ("0000", "9999", "1234")
    ):
        score += 5

        reasons.append(
            "The number contains a repeated or sequential ending pattern"
        )

    fraud_score = min(score, 100)

    if fraud_score >= 60:
        risk_level = "HIGH"
    elif fraud_score >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # ---------------------------------------------------------
    # Final response
    # ---------------------------------------------------------

    return {
        "answer": (
            "Phone number analysis completed. "
            "The results describe numbering, carrier, "
            "line-type, and risk signals. They do not "
            "prove that the owner is trustworthy or fraudulent."
        ),
        "phone": phone,
        "valid": (
            veriphone.get("phone_valid")
            if veriphone
            else is_valid
        ),
        "possible": is_possible,
        "country": country,
        "region": region,
        "carrier": carrier_name,
        "location": location,
        "line_type": line_type,
        "fraud_score": fraud_score,
        "risk_level": risk_level,
        "reasons": reasons,
        "source": (
            "Veriphone + local phone-number analysis"
            if veriphone
            else "Local phone-number analysis"
        ),
    }