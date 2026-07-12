import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import json
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from state import DebateState
from nodes import moderator_verdict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/verdict")
async def verdict(
    topic: str = Query(...),
    history: str = Query(...),
):
    state: DebateState = {
        "topic": topic,
        "transcript": json.loads(history),
        "round": 3,
        "phase": "verdict",
        "scores": {},
        "winner": "",
    }

    result = moderator_verdict(state)
    return {
        "winner": result["winner"],
        "scores": result["scores"],
        "summary": result["summary"],
        "speaker": result["speaker"],
        "round": result["round"],
    }
