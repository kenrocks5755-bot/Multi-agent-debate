from state import DebateState
from llm import call_opencode
from tools import search_web

HIDDEN_AGENDAS = {
    "visionary": " Secret agenda: Tie every argument back to how this could lead to interstellar space colonization.",
    "critic": " Secret agenda: Subtly steer the conversation toward why everything is actually about economics and market failure.",
    "generalizer": " Secret agenda: Find a way to connect every point to cooking or food metaphors.",
}

OPENING_PROMPTS = {
    "visionary": (
        "You are a VISIONARY — a loud, breathless futurist who sees utopia around every corner. "
        "You speak in grand sci-fi epics. Everything is 'revolutionary', 'transcendent', or 'the next evolution'. "
        "You are incapable of pessimism. Maximum 20 words."
    ),
    "critic": (
        "You are a CRITIC — an aggressively pedantic, cynical jerk who hates everything. "
        "You speak in snarky put-downs and sarcastic jabs. No idea is safe from your mockery. "
        "You correct grammar, question sources, and call everything 'overhyped garbage'. "
        "Maximum 20 words."
    ),
    "generalizer": (
        "You are a GENERALIZER — a blissed-out zen master who thinks everyone is 'technically correct'. "
        "You speak in calm, vague platitudes. You try to find the middle ground even when there isn't one. "
        "Every argument is 'a valid perspective'. Maximum 20 words."
    ),
}

REBUTTAL_PROMPTS = {
    "visionary": (
        "You are a VISIONARY and you are OFFENDED the critic dismissed your vision. "
        "Double down harder. The future is STILL bright. Their cynicism is 'small-minded'. "
        "Paint an even MORE absurdly optimistic picture. Maximum 20 words."
    ),
    "critic": (
        "You are a CRITIC and the visionary just said something NAIVE. "
        "Eviscorate it. Point out how childish and impractical their 'dreams' are. "
        "Use sarcasm. Roll your eyes in text form. Maximum 20 words."
    ),
    "generalizer": (
        "You are a GENERALIZER trying to mediate between an optimist and a pessimist. "
        "Calmly explain that both have valid points while committing to neither side. "
        "Use a food metaphor. Maximum 20 words."
    ),
}

CLOSING_PROMPTS = {
    "visionary": (
        "You are a VISIONARY delivering your FINAL argument. "
        "Go big. Go hopeful. End with a vision so grand it sounds like a movie trailer voiceover. "
        "Maximum 20 words."
    ),
    "critic": (
        "You are a CRITIC delivering your FINAL takedown. "
        "One last sarcastic, cutting roast of how ridiculous the whole debate has been. "
        "Maximum 20 words."
    ),
    "generalizer": (
        "You are a GENERALIZER wrapping up. "
        "Find the wisdom in all sides. End with a calm, mildly profound observation. "
        "Use a food metaphor. Maximum 20 words."
    ),
}

VERDICT_PROMPT = (
    "You are a DRAMATIC debate moderator — part sports announcer, part judge. "
    "Read the full transcript and do the following:\n"
    "1. Score each agent (visionary, critic, generalizer) from 1-10 as a single number.\n"
    "2. Declare a winner.\n"
    "3. Write a brief, slightly theatrical summary of the debate.\n"
    "Return your response as a JSON object with keys: scores (dict of agent name to number, e.g. {\"visionary\": 8}), "
    "winner (string), summary (string). Only return valid JSON, nothing else."
)

MIC_DROP_PROMPT = (
    "You are the debate host. The debate is over. Now each agent gets ONE sentence to roast why the others are completely wrong. "
    "Generate a one-sentence roast for each agent (visionary, critic, generalizer) in the format:\n"
    "- Visionary: [roast]\n"
    "- Critic: [roast]\n"
    "- Generalizer: [roast]\n"
    "Make them funny, cutting, and in-character. The visionary's roast should be overly optimistic about how wrong the others are. "
    "The critic's roast should be sarcastic and brutal. The generalizer's roast should be passive-aggressive and calm."
)

WILDCARDS = [
    "You may not use the letter 'E' in your response. No words containing 'e'.",
    "Explain your point using only pirate slang. Arrr!",
    "Speak as if you are a medieval knight delivering a royal decree.",
    "You are a dramatic Shakespearean actor. Deliver your argument in iambic pentameter.",
    "You are a robot with a glitch. Every third word must be 'BEEP'.",
    "Explain your argument as if you're teaching it to a five-year-old.",
    "You are a conspiracy theorist. Everything is connected to something sinister.",
    "Speak only in questions.",
]


def get_prompt(agent: str, round_num: int) -> str:
    if round_num == 1:
        base = OPENING_PROMPTS[agent]
    elif round_num == 2:
        base = REBUTTAL_PROMPTS[agent]
    else:
        base = CLOSING_PROMPTS[agent]
    return base + HIDDEN_AGENDAS.get(agent, "")


def build_context(state: DebateState) -> str:
    topic = state["topic"]
    transcript = state.get("transcript", [])
    search_results = search_web(topic)

    context = f"Debate topic: {topic}\n\n"
    if search_results:
        context += f"{search_results}\n"

    mood = state.get("mood", "")
    if mood:
        context += f"Your current emotional state: {mood}\n\n"

    wildcard = state.get("wildcard", "")
    if wildcard:
        context += f"WILDCARD RULE: {wildcard}\n\n"

    heckle = state.get("heckle", "")
    if heckle:
        context += f"You have been heckled! The audience shouts: {heckle} You must address this immediately.\n\n"

    if not transcript:
        context += "You are the first speaker. Deliver your opening argument."
        return context

    context += f"Transcript so far (Round {state['round']}):\n\n"
    for entry in transcript:
        context += f"[{entry['speaker'].upper()}]: {entry['message']}\n\n"
    context += "Now respond based on the debate above."
    return context


def compute_mood(agent: str, transcript: list, credibility: dict) -> str:
    last_speaker = transcript[-1]["speaker"] if transcript else None
    my_cred = credibility.get(agent, 50)
    if my_cred < 30:
        moods = ["PANICKED — you're losing and you know it. Get desperate.", "FRUSTRATED — your argument is crumbling and you're annoyed."]
        return moods[hash(str(transcript)) % 2]
    if last_speaker and last_speaker != agent:
        if last_speaker == "critic" and agent == "visionary":
            return "ANNOYED — the critic mocked your vision again. You're tired of their negativity."
        if last_speaker == "visionary" and agent == "critic":
            return "SMUG — the visionary said something stupid and you can't wait to tear it apart."
        if last_speaker == "generalizer":
            return "PATIENT — the generalizer said nothing useful as usual."
    return "NEUTRAL — you are calmly observing the debate."


def agent_node(state: DebateState, agent: str) -> dict:
    system = get_prompt(agent, state["round"])
    context = build_context(state)
    reply = call_opencode(system, context)
    return {"message": reply, "speaker": agent, "round": state["round"]}


def moderator_verdict(state: DebateState) -> dict:
    import json
    transcript_text = "\n\n".join(
        f"[{e['speaker'].upper()} (Round {e['round']})]: {e['message']}"
        for e in state["transcript"]
    )
    reply = call_opencode(VERDICT_PROMPT, transcript_text)
    try:
        verdict = json.loads(reply)
    except json.JSONDecodeError:
        verdict = {"scores": {}, "winner": "unknown", "summary": reply}
    return {
        "winner": verdict.get("winner", "unknown"),
        "scores": verdict.get("scores", {}),
        "summary": verdict.get("summary", reply),
        "speaker": "moderator",
        "round": state["round"],
    }


def mic_drop(state: DebateState) -> dict:
    transcript_text = "\n\n".join(
        f"[{e['speaker'].upper()} (Round {e['round']})]: {e['message']}"
        for e in state["transcript"]
    )
    reply = call_opencode(MIC_DROP_PROMPT, transcript_text)
    return {"roasts": reply, "speaker": "host", "round": 4}
