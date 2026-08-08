import asyncio
import logging


async def analyze_news(
    text=None,
    url=None,
    model_ai=None,
    executor=None,
    db=None,
):
    from app.services.news.scraper import (
        scrape_article,
        is_suspicious_domain,
    )

    if not text and not url:
        raise ValueError("Provide text or URL")

    loop = asyncio.get_event_loop()

    # ---------------- URL HANDLING ----------------

    if not text and url:

        if is_suspicious_domain(url):
            return {
                "answer": (
                    "This source appears suspicious.\n\n"
                    "The domain is commonly associated "
                    "with misleading content."
                )
            }

        title, article = await loop.run_in_executor(
            executor,
            scrape_article,
            url,
        )

        text = f"{title} {article}"

    if not text:
        raise ValueError("No content")

    # ---------------- MONGO LOG - REQUEST ----------------

    if db:
        db.logs.insert_one({
            "type": "news_check",
            "input": text,
        })

    # ---------------- GEMINI ----------------

    try:
        response = model_ai.generate_content(
            f"""
You are FROST AI (Fake Resistance & Online Security Tech assistant).

Analyze the following news and:

1. Verdict: REAL or FAKE
2. Explain why
3. Give confidence score (0-100%)

News:

{text}
"""
        )

        if db:
            db.logs.insert_one({
                "type": "news_check",
                "input": text,
                "response": response.text,
            })

        return {
            "answer": response.text
        }

    except Exception as ai_error:
        logging.error(
            f"Gemini failed, using fallback: {ai_error}"
        )

    # ---------------- FALLBACK ----------------

    try:
        response = model_ai.generate_content(
            f"""
You are FROST AI, a smart and conversational assistant.

Talk naturally like ChatGPT.

If the statement is factual, confirm it clearly.

If it's false or misleading, explain politely.

Keep answers simple and human-like.

User input:

{text}
"""
        )

        return {
            "answer": response.text
        }

    except Exception as ai_error:
        logging.error(
            f"Gemini fallback failed: {ai_error}"
        )

        raise RuntimeError(
            "AI service temporarily unavailable"
        )
