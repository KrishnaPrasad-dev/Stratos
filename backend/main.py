from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from typing import Any, Dict, List
from database import supabase
from schemas import EdgeCreate, NodeCreate, StartupSetupCreate
from scraper_service import collect_market_intelligence
from services.scraper import BlastRadiusGraph, run_autonomous_scrape_pipeline


class StartupSetup(BaseModel):
    company: str
    category: str
    competitors: str


class ScrapeRequest(BaseModel):
    company: str
    category: str
    competitors: List[str] | str
    model: str = "gpt-4o-mini"


app = FastAPI(title="Stratos Core Engine API", version="1.0.0")

# Enable CORS so your Next.js frontend can communicate with this API safely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "engine": "Stratos Platform"}

# --- NODE ENDPOINTS ---

@app.post("/api/nodes", status_code=status.HTTP_201_CREATED)
def create_node(node: NodeCreate):
    try:
        response = supabase.table("nodes").insert(node.model_dump()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/nodes", response_model=List[dict])
def get_nodes():
    try:
        response = supabase.table("nodes").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- EDGE ENDPOINTS ---

@app.post("/api/edges", status_code=status.HTTP_201_CREATED)
def create_edge(edge: EdgeCreate):
    try:
        response = supabase.table("edges").insert(edge.model_dump()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/edges", response_model=List[dict])
def get_edges():
    try:
        response = supabase.table("edges").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- STARTUP / SCRAPER ENDPOINTS ---

@app.post("/api/startup-setup", status_code=status.HTTP_201_CREATED, response_model=StartupSetup)
def save_startup_setup(payload: StartupSetupCreate):
    try:
        response = supabase.table("startup_setup").insert(payload.model_dump()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/fetch-market-intel")
def fetch_market_intel(payload: StartupSetupCreate):
    try:
        events = collect_market_intelligence(payload.target_competitors, payload.company_name)
        created_nodes = []
        for event in events:
            insert_response = supabase.table("nodes").insert({
                "label": event["label"],
                "category": event["category"],
                "properties": event["properties"],
            }).execute()
            created_nodes.append(insert_response.data[0])

        if not created_nodes:
            return {"status": "ok", "message": "No intelligence events generated", "events": [], "count": 0}

        company_node = supabase.table("nodes").insert({
            "label": payload.company_name,
            "category": "Company",
            "properties": {"category": payload.category},
        }).execute().data[0]

        for event_node in created_nodes:
            supabase.table("edges").insert({
                "source_id": company_node["id"],
                "target_id": event_node["id"],
                "relationship_type": "OBSERVED",
                "properties": {"source": "market-intel"},
            }).execute()

        return {
            "status": "ok",
            "message": f"Intelligence ingested: {len(created_nodes)} new signals identified",
            "events": created_nodes,
            "count": len(created_nodes),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/setup", status_code=status.HTTP_201_CREATED)
def save_setup(payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        parsed = StartupSetup.model_validate(payload)
        print("Received startup setup:", parsed.model_dump())
        return {"status": "success"}
    except ValidationError as e:
        print(e)
        raise HTTPException(status_code=422, detail=e.errors()) from e
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to process setup payload") from e


@app.post("/api/scrape", response_model=BlastRadiusGraph)
async def scrape_competitors(payload: ScrapeRequest) -> BlastRadiusGraph:
    try:
        return await run_autonomous_scrape_pipeline(
            company=payload.company,
            category=payload.category,
            raw_competitors=payload.competitors,
            model=payload.model,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Autonomous scrape pipeline failed: {exc}") from exc