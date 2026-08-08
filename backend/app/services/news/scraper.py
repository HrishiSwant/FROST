import logging
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse


def scrape_article(url: str):
    try:
        response = requests.get(url, timeout=5)

        soup = BeautifulSoup(response.text, "html.parser")

        title = soup.title.get_text() if soup.title else ""

        text = " ".join(
            paragraph.get_text()
            for paragraph in soup.find_all("p")
        )

        return title, text[:3000]

    except Exception as e:
        logging.error(f"Scrape error: {e}")
        return "", ""


def is_suspicious_domain(url: str):
    suspicious_keywords = [
        "clickbait",
        "fake",
        "viral",
        "rumor",
    ]

    domain = urlparse(url).netloc.lower()

    return any(
        keyword in domain
        for keyword in suspicious_keywords
    )
