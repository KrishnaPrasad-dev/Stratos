import os
import sys
print("STEP 1: Script started successfully!", flush=True)

try:
    from supabase import create_client
    print("STEP 2: Supabase library imported successfully!", flush=True)
except Exception as e:
    print(f"FAILED AT STEP 2: {e}", flush=True)
    sys.exit(1)

# Hardcoded keys just for this 30-second test to rule out .env loading issues
url = "https://xsrzpwxygzxpyffxafdg.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzcnpwd3h5Z3p4cHlmZnhhZmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNjk0MTUsImV4cCI6MjA5ODc0NTQxNX0.XvkV9iNz03rrU3z0pNJ7pcFB70eBs6SyaK7d82Hmx60"

print("STEP 3: Initializing client...", flush=True)
try:
    supabase = create_client(url, key)
    print("STEP 4: Client object created!", flush=True)
except Exception as e:
    print(f"FAILED AT STEP 4: {e}", flush=True)
    sys.exit(1)

print("STEP 5: Sending network request to insert node...", flush=True)
try:
    test_node = {
        "label": "Stratos Central Command",
        "category": "System",
        "properties": {"status": "operational"}
    }
    response = supabase.table("nodes").insert(test_node).execute()
    print("STEP 6: Network response received!", flush=True)
    print(f"\n SUCCESS! Inserted Node ID: {response.data[0]['id']}", flush=True)
except Exception as e:
    print(f"\n FAILED AT STEP 5/6: Network connection failed.", flush=True)
    print(f"Error details: {e}", flush=True)