from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from database import supabase
from schemas import NodeCreate, EdgeCreate

app = FastAPI(title="Stratos Core Engine API", version="1.0.0")

# Enable CORS so your Next.js frontend can communicate with this API safely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
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