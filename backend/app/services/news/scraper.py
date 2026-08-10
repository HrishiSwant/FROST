import logging
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup


# ============================================================
# ARTICLE SCRAPER
# ============================================================

def scrape_article(url: str):
    """
    Fetch and extract readable text from a public news article.

    This function collects evidence only.
    It does NOT determine whether the article is true or false.
    """

    if not url:
        raise ValueError("URL is required")

    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise ValueError(
            "Only HTTP and HTTPS URLs are supported"
        )

    if not parsed.netloc:
        raise ValueError(
            "Invalid article URL"
        )

    try:

        response = requests.get(
            url,
            timeout=10,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 "
                    "(compatible; FROST-News-Intelligence/2.0)"
                )
            },
        )

        response.raise_for_status()

        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )

        # ----------------------------------------------------
        # Remove elements that are normally not article text
        # ----------------------------------------------------

        for element in soup(
            ["script", "style", "noscript", "nav", "footer"]
        ):
            element.decompose()

        # ----------------------------------------------------
        # Title
        # ----------------------------------------------------

        title = ""

        if soup.title:
            title = soup.title.get_text(
                " ",
                strip=True
            )

        # ----------------------------------------------------
        # Article text
        # ----------------------------------------------------

        paragraphs = []

        for paragraph in soup.find_all("p"):

            text = paragraph.get_text(
                " ",
                strip=True
            )

            if text and len(text) > 20:
                paragraphs.append(text)

        article_text = " ".join(
            paragraphs
        )

        # Keep the amount of scraped content manageable.
        article_text = article_text[:10000]

        if not title and not article_text:

            raise ValueError(
                "Could not extract article content"
            )

        return title, article_text

    except requests.RequestException as e:

        logging.error(
            f"Article request failed: {e}"
        )

        return "", ""

    except Exception as e:

        logging.error(
            f"Article scraping failed: {e}"
        )

        return "", ""
