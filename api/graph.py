from langgraph.graph import StateGraph, END
from state import DebateState
from nodes import (
    moderator_verdict,
    agent_node,
)


def build_graph() -> StateGraph:
    graph = StateGraph(DebateState)

    graph.add_node("visionary", lambda s: agent_node(s, "visionary"))
    graph.add_node("critic", lambda s: agent_node(s, "critic"))
    graph.add_node("generalizer", lambda s: agent_node(s, "generalizer"))
    graph.add_node("moderator_verdict", moderator_verdict)

    graph.set_entry_point("visionary")
    graph.add_edge("visionary", "critic")
    graph.add_edge("critic", "generalizer")

    def route_after_generalizer(state: DebateState) -> str:
        if state.get("round", 1) < 3:
            return "increment_round"
        return "moderator_verdict"

    def increment_round(state: DebateState) -> dict:
        return {"round": state["round"] + 1}

    graph.add_node("increment_round", increment_round)
    graph.add_conditional_edges(
        "generalizer",
        route_after_generalizer,
        {"increment_round": "increment_round", "moderator_verdict": "moderator_verdict"},
    )
    graph.add_edge("increment_round", "visionary")
    graph.add_edge("moderator_verdict", END)

    return graph.compile()
