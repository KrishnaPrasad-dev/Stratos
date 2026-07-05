from __future__ import annotations

import asyncio
import json
import logging
import re
from typing import Any, Dict, List, Literal

from pydantic import BaseModel, Field, ValidationError

logger = logging.getLogger(__name__)


class Node(BaseModel):
    id: str = Field(..., description="Stable graph node id")
    label: str = Field(..., min_length=3, description="Human-readable intelligence label")
    category: Literal["Company", "Event", "Threat", "Opportunity"]


class Edge(BaseModel):
    id: str
    source_id: str
    target_id: str
    relationship_type: str


class BlastRadiusGraph(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


class ScrapePipelineError(Exception):
    pass


def normalize_competitors(raw_competitors: Any) -> List[str]:
    if isinstance(raw_competitors, str):
        values = raw_competitors.split(",")
    elif isinstance(raw_competitors, list):
        values = [str(item) for item in raw_competitors]
    else:
        values = []

    cleaned: List[str] = []
    for value in values:
        candidate = " ".join(value.strip().split())
        if candidate and candidate not in cleaned:
            cleaned.append(candidate)
    return cleaned


def _slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def _build_news_query(company: str, category: str, competitors: List[str]) -> str:
    competitor_clause = " OR ".join(competitors)
    return f"{company} OR {competitor_clause} {category} news"


async def search_live_news(
    company: str,
    category: str,
    competitors: List[str],
    max_results: int = 10,
) -> List[Dict[str, str]]:
    """Run a live DuckDuckGo news search and normalize top result fields."""

    query = _build_news_query(company, category, competitors)

    def _run_search() -> List[Dict[str, str]]:
        from duckduckgo_search import DDGS

        rows: List[Dict[str, str]] = []
        with DDGS() as ddgs:
            results = ddgs.news(keywords=query, max_results=max_results)
            for item in results:
                if not isinstance(item, dict):
                    continue
                rows.append(
                    {
                        "title": str(item.get("title", "")).strip(),
                        "body": str(item.get("body", "")).strip(),
                        "source": str(item.get("source", "")).strip(),
                        "url": str(item.get("url", "")).strip(),
                        "date": str(item.get("date", "")).strip(),
                    }
                )
        return rows

    try:
        rows = await asyncio.to_thread(_run_search)
    except Exception as exc:  # noqa: BLE001
        raise ScrapePipelineError(f"Live search failed: {exc}") from exc

    if not rows:
        raise ScrapePipelineError("Live search returned no results")

    return rows[:max_results]


def _format_news_for_llm(company: str, category: str, competitors: List[str], news_rows: List[Dict[str, str]]) -> str:
    lines = [
        f"Company: {company}",
        f"Category: {category}",
        f"Competitors: {', '.join(competitors)}",
        "News Inputs:",
    ]
    for idx, row in enumerate(news_rows, start=1):
        lines.append(
            (
                f"{idx}. title={row.get('title', '')}; "
                f"body={row.get('body', '')}; "
                f"source={row.get('source', '')}; "
                f"date={row.get('date', '')}; "
                f"url={row.get('url', '')}"
            )
        )
    return "\n".join(lines)


def _coerce_edge_ids(graph: BlastRadiusGraph) -> BlastRadiusGraph:
    normalized_edges: List[Edge] = []
    for idx, edge in enumerate(graph.edges, start=1):
        edge_id = edge.id.strip() if edge.id.strip() else f"edge-{idx}"
        normalized_edges.append(
            Edge(
                id=edge_id,
                source_id=edge.source_id,
                target_id=edge.target_id,
                relationship_type=edge.relationship_type,
            )
        )
    return BlastRadiusGraph(nodes=graph.nodes, edges=normalized_edges)


async def extract_blast_radius_graph(
    company: str,
    category: str,
    competitors: List[str],
    news_rows: List[Dict[str, str]],
    model: str = "gpt-4o-mini",
) -> BlastRadiusGraph:
    """Convert live news rows into a strict nodes/edges blast-radius graph."""

    try:
        from openai import APIError, APITimeoutError, AsyncOpenAI
    except Exception as exc:  # noqa: BLE001
        raise ScrapePipelineError(f"OpenAI SDK unavailable: {exc}") from exc

    try:
        client = AsyncOpenAI()
    except Exception as exc:  # noqa: BLE001
        raise ScrapePipelineError(f"OpenAI client initialization failed: {exc}") from exc

    system_prompt = (
        "You are a market intelligence analyst. Read this live news data. "
        "Build a causal 'Blast Radius' graph showing how these real events impact the market. "
        "Identify the root events, the threats, and the opportunities. "
        "Return ONLY JSON matching this schema exactly: "
        "{ nodes: [{id, label, category}], edges: [{id, source_id, target_id, relationship_type}] }. "
        "Allowed node.category values: Company, Event, Threat, Opportunity."
    )

    payload = _format_news_for_llm(company, category, competitors, news_rows)

    try:
        completion = await asyncio.wait_for(
            client.beta.chat.completions.parse(
                model=model,
                temperature=0.1,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": payload},
                ],
                response_format=BlastRadiusGraph,
            ),
            timeout=60,
        )
    except (APITimeoutError, APIError, asyncio.TimeoutError) as exc:
        raise ScrapePipelineError(f"OpenAI extraction failed: {exc}") from exc
    except Exception as exc:  # noqa: BLE001
        raise ScrapePipelineError(f"OpenAI extraction failed: {exc}") from exc

    parsed = completion.choices[0].message.parsed
    if parsed is None:
        raw_content = completion.choices[0].message.content or ""
        if isinstance(raw_content, list):
            raw_content = "\n".join(item.get("text", "") for item in raw_content if isinstance(item, dict))
        try:
            parsed = BlastRadiusGraph.model_validate(json.loads(str(raw_content)))
        except (json.JSONDecodeError, ValidationError) as exc:
            raise ScrapePipelineError("OpenAI returned invalid JSON schema") from exc

    node_ids = {node.id for node in parsed.nodes}
    filtered_edges = [edge for edge in parsed.edges if edge.source_id in node_ids and edge.target_id in node_ids]
    return _coerce_edge_ids(BlastRadiusGraph(nodes=parsed.nodes, edges=filtered_edges))

async def run_autonomous_scrape_pipeline(
    company: str,
    category: str,
    raw_competitors: Any,
    model: str = "gpt-4o-mini",
) -> BlastRadiusGraph:
    company_name = " ".join(company.strip().split())
    category_name = " ".join(category.strip().split())
    competitors = normalize_competitors(raw_competitors)

    if not company_name:
        raise ValueError("Company is required")
    if not category_name:
        raise ValueError("Category is required")
    if not competitors:
        raise ValueError("Provide at least one valid competitor")

    news_rows = await search_live_news(company_name, category_name, competitors, max_results=10)
    return await extract_blast_radius_graph(
        company=company_name,
        category=category_name,
        competitors=competitors,
        news_rows=news_rows,
        model=model,
    )
