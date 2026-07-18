import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import json
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from state import DebateState
from nodes import mic_drop

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/micdrop")
async def micdrop(
    topic: str = Query(...),
    history: str = Query(...),
):
    state: DebateState = {
        "topic": topic,
        "transcript": json.loads(history),
        "round": 4,
        "phase": "micdrop",
        "scores": {},
        "winner": "",
        "mood": "",
        "wildcard": "",
        "heckle": "",
        "credibility": {},
    }

    result = mic_drop(state)
    return {"roasts": result["roasts"], "speaker": result["speaker"], "round": result["round"]}
