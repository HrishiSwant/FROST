import asyncio
import logging


GEMINI_MODEL = "gemini-3.6-flash"


async def generate_news_analysis(
    ai_client,
    prompt: str,
):
    if ai_client is None:
        raise RuntimeError(
            "Gemini AI service is not configured"
        )

    try:

        response = await ai_client.aio.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )

        return response.text

    except Exception as e:

        logging.error(
            f"Gemini request failed: {e}"
        )

        raise


async def analyze_news(
    text=None,
    url=None,
    ai_client=None,
    executor=None,
    db=None,
):
    from app.services.news.scraper import (
        scrape_article,
        is_suspicious_domain,
    )

    if not text and not url:
        raise ValueError(
            "Provide text or URL"
        )

    loop = asyncio.get_event_loop()

    # ================= URL HANDLING =================

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
        raise ValueError(
            "No content could be analyzed"
        )

    # ================= DATABASE LOG =================

    if db:

        try:

            db.logs.insert_one({
                "type": "news_check",
                "input": text,
            })

        except Exception as e:

            logging.warning(
                f"MongoDB logging failed: {e}"
            )

    # ================= PRIMARY AI ANALYSIS =================

    prompt = f"""
You are FROST AI (Fake Resistance & Online Security Tech).

Analyze the following news content.

Your task:

1. Determine whether the content appears REAL,
   FAKE, or SUSPICIOUS.

2. Explain the reasoning clearly.

3. Give a confidence score from 0 to 100.

4. Identify potentially misleading claims,
   sensational language, or suspicious patterns.

5. Do not claim that something is definitely true
   unless the provided information supports that conclusion.

Return a clear, human-readable analysis.

News content:

{text}
"""

    try:

        answer = await generate_news_analysis(
            ai_client,
            prompt,
        )

        # ================= DATABASE LOG =================

        if db:

            try:

                db.logs.insert_one({
                    "type": "news_check",
                    "input": text,
                    "response": answer,
                })

            except Exception as e:

                logging.warning(
                    f"MongoDB response logging failed: {e}"
                )

        return {
            "answer": answer,
        }

    except Exception as e:

        logging.error(
            f"Primary Gemini analysis failed: {e}"
        )

        # ================= FALLBACK =================

        fallback_prompt = f"""
You are FROST AI.

Analyze this user-provided news content
conversationally.

Explain whether the content appears reliable,
misleading, suspicious, or potentially false.

Do not invent facts.

Content:

{text}
"""

        try:

            answer = await generate_news_analysis(
                ai_client,
                fallback_prompt,
            )

            return {
                "answer": answer,
            }

        except Exception as fallback_error:

            logging.error(
                f"Gemini fallback failed: {fallback_error}"
            )

            raise RuntimeError(
                "AI service temporarily unavailable"
            )
