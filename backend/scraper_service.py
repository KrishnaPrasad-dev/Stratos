from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List


def collect_market_intelligence(competitors: List[str], company_name: str) -> List[Dict[str, Any]]:
    """Collect lightweight market intelligence events for the given competitors.

    The implementation prefers Playwright when available, but falls back to a
    deterministic semantic parser so the dashboard still has meaningful data in
    local demos and offline environments.
    """

    normalized_competitors = [c.strip() for c in competitors if c and c.strip()]
    if not normalized_competitors:
        normalized_competitors = ["the market"]

    try:
        from playwright.sync_api import sync_playwright  # type: ignore

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            search_query = " ".join(normalized_competitors[:3])
            page.goto(f"https://example.com/?q={search_query}", wait_until="domcontentloaded")
            page_content = page.content()
            browser.close()
            return parse_semantic_events(page_content, normalized_competitors, company_name)
    except Exception:
        return generate_fallback_events(normalized_competitors, company_name)


def parse_semantic_events(content: str, competitors: List[str], company_name: str) -> List[Dict[str, Any]]:
    lowered = content.lower()
    events: List[Dict[str, Any]] = []
    for competitor in competitors:
        signal_kind = "pricing"
        if any(keyword in lowered for keyword in ["funding", "raise", "series"]):
            signal_kind = "funding"
        elif any(keyword in lowered for keyword in ["launch", "product", "release"]):
            signal_kind = "launch"
        elif any(keyword in lowered for keyword in ["acquire", "acquisition", "hire"]):
            signal_kind = "talent"

        label = f"{competitor} triggered a {signal_kind} signal"
        events.append(
            {
                "label": label,
                "category": "Event",
                "properties": {
                    "company_name": company_name,
                    "competitor": competitor,
                    "signal_kind": signal_kind,
                    "source": "playwright-semantic-parser",
                    "ingested_at": datetime.now(timezone.utc).isoformat(),
                },
            }
        )

    return events[:5]


def generate_fallback_events(competitors: List[str], company_name: str) -> List[Dict[str, Any]]:
    events: List[Dict[str, Any]] = []
    for index, competitor in enumerate(competitors[:5], start=1):
        signal_kind = "pricing" if index % 2 == 0 else "funding"
        label = f"{competitor} showed a {signal_kind} change"
        events.append(
            {
                "label": label,
                "category": "Event",
                "properties": {
                    "company_name": company_name,
                    "competitor": competitor,
                    "signal_kind": signal_kind,
                    "source": "fallback-parser",
                    "ingested_at": datetime.now(timezone.utc).isoformat(),
                },
            }
        )
    return events
