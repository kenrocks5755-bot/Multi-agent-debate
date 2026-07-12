import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import json
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from llm import call_opencode

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
    transcript = json.loads(history)
    transcript_text = "\n\n".join(
        f"[{e['speaker'].upper()} (Round {e['round']})]: {e['message']}"
        for e in transcript
    )

    system = (
        "You are the debate moderator. Read the full transcript and do the following:\n"
        "1. Score each agent (visionary, critic, generalizer) from 1-10 as a single number.\n"
        "2. Declare a winner.\n"
        "3. Write a brief summary of the debate.\n"
        "Return your response as a JSON object with keys: scores (dict of agent name to number, e.g. {\"visionary\": 8}), "
        "winner (string), summary (string). Only return valid JSON, nothing else."
    )

    reply = call_opencode(system, transcript_text)
    try:
        verdict_data = json.loads(reply)
    except json.JSONDecodeError:
        verdict_data = {"scores": {}, "winner": "unknown", "summary": reply}

    return {
        "winner": verdict_data.get("winner", "unknown"),
        "scores": verdict_data.get("scores", {}),
        "summary": verdict_data.get("summary", reply),
        "speaker": "moderator",
        "round": 3,
    }
