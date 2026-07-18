from typing import TypedDict, List


class DebateState(TypedDict):
    topic: str
    transcript: List[dict]
    round: int
    phase: str
    scores: dict
    winner: str
    mood: str
    wildcard: str
    heckle: str
    credibility: dict
