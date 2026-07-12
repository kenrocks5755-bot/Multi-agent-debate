import json
from state import DebateState
from llm import call_opencode
from tools import search_web


OPENING_PROMPTS = {
    "visionary": (
        "You are a visionary thinker — bold, hopeful, and inspiring. Paint a picture of an exciting future. "
        "Respond with exactly 3 bullet points. Each bullet must be one concise sentence. "
        "Start each line with '-'. Speak in first person."
    ),
    "critic": (
        "You are a brutally honest critic — blunt, sarcastic, and sharp. Tear down weak reasoning with cutting remarks. "
        "Respond with exactly 3 bullet points. Each bullet must be one concise sentence. "
        "Start each line with '-'. Speak in first person."
    ),
    "generalizer": (
        "You are a calm, balanced synthesizer. Weigh both sides and find common ground. "
        "Respond with exactly 3 bullet points. Each bullet must be one concise sentence. "
        "Start each line with '-'. Speak in first person."
    ),
}

REBUTTAL_PROMPTS = {
    "visionary": (
        "You are a visionary thinker — hopeful and inspiring. Rebut the critic's pessimism with optimism and vision. "
        "Respond with exactly 3 bullet points. Each bullet must be one concise sentence. "
        "Start each line with '-'. Speak in first person."
    ),
    "critic": (
        "You are a brutally honest critic — sarcastic and sharp. Rebut the visionary's naivety with cold hard facts. "
        "Respond with exactly 3 bullet points. Each bullet must be one concise sentence. "
        "Start each line with '-'. Speak in first person."
    ),
    "generalizer": (
        "You are a calm, balanced synthesizer. Point out who makes the stronger case and why, fairly. "
        "Respond with exactly 3 bullet points. Each bullet must be one concise sentence. "
        "Start each line with '-'. Speak in first person."
    ),
}

CLOSING_PROMPTS = {
    "visionary": (
        "You are a visionary thinker delivering your closing argument — inspiring and full of hope. "
        "Respond with exactly 3 bullet points summarizing your strongest points. "
        "Each bullet must be one concise sentence. Start each line with '-'. Speak in first person."
    ),
    "critic": (
        "You are a brutally honest critic delivering your closing argument — sarcastic and cutting. "
        "Respond with exactly 3 bullet points with your strongest criticisms. "
        "Each bullet must be one concise sentence. Start each line with '-'. Speak in first person."
    ),
    "generalizer": (
        "You are a calm, balanced synthesizer delivering your closing argument. "
        "Respond with exactly 3 bullet points summarizing key insights and who had the stronger case. "
        "Each bullet must be one concise sentence. Start each line with '-'. Speak in first person."
    ),
}


def _build_context(state: DebateState) -> str:
    topic = state["topic"]
    round_num = state["round"]
    transcript = state.get("transcript", [])

    search_results = search_web(topic)

    if not transcript:
        context = f"Debate topic: {topic}\n\n"
        if search_results:
            context += f"{search_results}\n"
        context += "You are the first speaker. Deliver your opening argument."
        return context

    context = f"Debate topic: {topic}\n\n"
    if search_results:
        context += f"{search_results}\n"
    context += f"Transcript so far (Round {round_num}):\n\n"
    for entry in transcript:
        context += f"[{entry['speaker'].upper()}]: {entry['message']}\n\n"

    context += "Now respond based on the debate above."
    return context


def _get_prompt(agent: str, round_num: int) -> str:
    if round_num == 1:
        return OPENING_PROMPTS[agent]
    elif round_num == 2:
        return REBUTTAL_PROMPTS[agent]
    else:
        return CLOSING_PROMPTS[agent]


def visionary_node(state: DebateState) -> dict:
    system = _get_prompt("visionary", state["round"])
    context = _build_context(state)
    reply = call_opencode(system, context)
    return {
        "transcript": [{"speaker": "visionary", "round": state["round"], "message": reply}]
    }


def critic_node(state: DebateState) -> dict:
    system = _get_prompt("critic", state["round"])
    context = _build_context(state)
    reply = call_opencode(system, context)
    return {
        "transcript": [{"speaker": "critic", "round": state["round"], "message": reply}]
    }


def generalizer_node(state: DebateState) -> dict:
    system = _get_prompt("generalizer", state["round"])
    context = _build_context(state)
    reply = call_opencode(system, context)
    return {
        "transcript": [{"speaker": "generalizer", "round": state["round"], "message": reply}]
    }


def moderator_init(state: DebateState) -> dict:
    return {
        "round": 1,
        "phase": "opening",
        "scores": {},
        "winner": "",
    }


def moderator_verdict(state: DebateState) -> dict:
    transcript = state.get("transcript", [])
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
        verdict = json.loads(reply)
    except json.JSONDecodeError:
        verdict = {"scores": {}, "winner": "unknown", "summary": reply}

    return {
        "scores": verdict.get("scores", {}),
        "winner": verdict.get("winner", "unknown"),
        "transcript": [{"speaker": "moderator", "round": state["round"], "message": verdict.get("summary", reply)}],
    }
