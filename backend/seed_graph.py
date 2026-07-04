import os
from database import supabase

def seed_scenario():
    print("Initiating Blast Radius Seed...")

    # 1. Create the Nodes
    nodes = [
        {"label": "Competitor X", "category": "Company", "properties": {"status": "Threat"}},
        {"label": "Sarah Jenkins (VP Growth)", "category": "Person", "properties": {"hired": "2 months ago"}},
        {"label": "TikTok Ad Network", "category": "Technology", "properties": {"spend": "$50k/mo"}},
        {"label": "Dropped Pricing by 20%", "category": "Event", "properties": {"impact": "High"}}
    ]
    
    node_responses = []
    for node in nodes:
        res = supabase.table("nodes").insert(node).execute()
        node_responses.append(res.data[0])
        print(f"Created Node: {node['label']}")

    # 2. Extract their generated UUIDs
    comp_id = node_responses[0]['id']
    vp_id = node_responses[1]['id']
    tech_id = node_responses[2]['id']
    event_id = node_responses[3]['id']

    # 3. Create the Edges (The Connections)
    edges = [
        {"source_id": comp_id, "target_id": vp_id, "relationship_type": "HIRED"},
        {"source_id": vp_id, "target_id": tech_id, "relationship_type": "DEPLOYED"},
        {"source_id": tech_id, "target_id": event_id, "relationship_type": "CAUSED"}
    ]

    for edge in edges:
        supabase.table("edges").insert(edge).execute()
        print(f"Created Edge: {edge['relationship_type']}")
        
    print("\n✅ Scenario Injected Successfully!")

if __name__ == "__main__":
    seed_scenario()