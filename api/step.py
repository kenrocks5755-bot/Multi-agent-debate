import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import json
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from llm import call_opencode
from tools import search_web

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PROMPTS = {
    1: {
        "visionary": "You are a visionary thinker — bold, hopeful, and inspiring. Paint a picture of an exciting future. Respond with exactly 3 bullet points. Each bullet must be one concise sentence. Start each line with '-'. Speak in first person.",
        "critic": "You are a brutally honest critic — blunt, sarcastic, and sharp. Tear down weak reasoning with cutting remarks. Respond with exactly 3 bullet points. Each bullet must be one concise sentence. Start each line with '-'. Speak in first person.",
        "generalizer": "You are a calm, balanced synthesizer. Weigh both sides and find common ground. Respond with exactly 3 bullet points. Each bullet must be one concise sentence. Start each line with '-'. Speak in first person.",
    },
    2: {
        "visionary": "You are a visionary thinker — hopeful and inspiring. Rebut the critic's pessimism with optimism and vision. Respond with exactly 3 bullet points. Each bullet must be one concise sentence. Start each line with '-'. Speak in first person.",
        "critic": "You are a brutally honest critic — sarcastic and sharp. Rebut the visionary's naivety with cold hard facts. Respond with exactly 3 bullet points. Each bullet must be one concise sentence. Start each line with '-'. Speak in first person.",
        "generalizer": "You are a calm, balanced synthesizer. Point out who makes the stronger case and why, fairly. Respond with exactly 3 bullet points. Each bullet must be one concise sentence. Start each line with '-'. Speak in first person.",
    },
    3: {
        "visionary": "You are a visionary thinker delivering your closing argument — inspiring and full of hope. Respond with exactly 3 bullet points summarizing your strongest points. Each bullet must be one concise sentence. Start each line with '-'. Speak in first person.",
        "critic": "You are a brutally honest critic delivering your closing argument — sarcastic and cutting. Respond with exactly 3 bullet points with your strongest criticisms. Each bullet must be one concise sentence. Start each line with '-'. Speak in first person.",
        "generalizer": "You are a calm, balanced synthesizer delivering your closing argument. Respond with exactly 3 bullet points summarizing key insights and who had the stronger case. Each bullet must be one concise sentence. Start each line with '-'. Speak in first person.",
    },
}

@app.get("/api/step")
async def step(
    topic: str = Query(...),
    agent: str = Query(...),
    round: int = Query(...),
    history: str = Query(default="[]"),
):
    prompt = PROMPTS.get(round, {}).get(agent)
    if not prompt:
        raise HTTPException(400, f"No prompt for agent={agent}, round={round}")

    transcript = json.loads(history)
    search_results = search_web(topic)

    if not transcript:
        context = f"Debate topic: {topic}\n\n"
        if search_results:
            context += f"{search_results}\n"
        context += "You are the first speaker. Deliver your opening argument."
    else:
        context = f"Debate topic: {topic}\n\n"
        if search_results:
            context += f"{search_results}\n"
        context += f"Transcript so far (Round {round}):\n\n"
        for entry in transcript:
            context += f"[{entry['speaker'].upper()}]: {entry['message']}\n\n"
        context += "Now respond based on the debate above."

    reply = call_opencode(prompt, context)
    return {"message": reply, "agent": agent, "round": round}
