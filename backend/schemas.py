from pydantic import BaseModel, Field
from typing import Dict, Any
from uuid import UUID
from datetime import datetime

# --- NODE SCHEMAS ---
class NodeBase(BaseModel):
    label: str = Field(..., example="Stratos Inc")
    category: str = Field(..., example="Company") 
    properties: Dict[str, Any] = Field(default_factory=dict, example={"valuation": "5M"})

class NodeCreate(NodeBase):
    pass

class Node(NodeBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- EDGE (RELATIONSHIP) SCHEMAS ---
class EdgeBase(BaseModel):
    source_id: UUID
    target_id: UUID
    relationship_type: str = Field(..., example="INVESTED_IN")
    properties: Dict[str, Any] = Field(default_factory=dict, example={"amount": 500000})

class EdgeCreate(EdgeBase):
    pass

class Edge(EdgeBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True