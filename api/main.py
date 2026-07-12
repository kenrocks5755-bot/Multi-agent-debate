import json
import os
import asyncio
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from graph import build_graph


app = FastAPI(title="AI Debate Arena")

origins = ["http://localhost:3001", "http://localhost:4173"]
if vercel_url := os.environ.get("VERCEL_URL"):
    origins.append(f"https://{vercel_url}")
    origins.append(f"https://{vercel_url.replace('-','')}-*.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def run_debate_stream(topic: str):
    graph = build_graph()
    initial_state = {"topic": topic}

    try:
        async for event in graph.astream(initial_state):
            for node_name, node_output in event.items():
                transcript_entries = node_output.get("transcript", [])
                for entry in transcript_entries:
                    yield f"data: {json.dumps({'node': node_name, **entry})}\n\n"

                if "winner" in node_output and node_output["winner"]:
                    summary = ""
                    if transcript_entries:
                        summary = transcript_entries[-1].get("message", "")
                    yield f"data: {json.dumps({'node': node_name, 'type': 'verdict', 'scores': node_output.get('scores', {}), 'winner': node_output['winner'], 'summary': summary})}\n\n"

        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


@app.get("/debate")
async def debate(topic: str = Query(..., description="The debate topic")):
    return StreamingResponse(
        run_debate_stream(topic),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/health")
async def health():
    return {"status": "ok"}