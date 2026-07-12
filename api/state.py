import operator
from typing import TypedDict, Annotated, List


class DebateState(TypedDict):
    topic: str
    transcript: Annotated[List[dict], operator.add]
    round: int
    phase: str
    scores: dict
    winner: str