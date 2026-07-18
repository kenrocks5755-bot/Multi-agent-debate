import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import json
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from state import DebateState
from nodes import agent_node

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/step")
async def step(
    topic: str = Query(...),
    agent: str = Query(...),
    round: int = Query(...),
    history: str = Query(default="[]"),
    mood: str = Query(default=""),
    wildcard: str = Query(default=""),
    heckle: str = Query(default=""),
    credibility: str = Query(default="{}"),
):
    if agent not in ("visionary", "critic", "generalizer"):
        raise HTTPException(400, f"Invalid agent: {agent}")

    state: DebateState = {
        "topic": topic,
        "transcript": json.loads(history),
        "round": round,
        "phase": "debating",
        "scores": {},
        "winner": "",
        "mood": mood,
        "wildcard": wildcard,
        "heckle": heckle,
        "credibility": json.loads(credibility),
    }

    result = agent_node(state, agent)
    return {"message": result["message"], "agent": result["speaker"], "round": result["round"]}
