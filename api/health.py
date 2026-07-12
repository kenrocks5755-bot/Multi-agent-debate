import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastapi import FastAPI

app = FastAPI()

@app.get("/api/health")
async def health():
    return {"status": "ok"}
