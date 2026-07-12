from langgraph.graph import StateGraph, END
from state import DebateState
from nodes import (
    moderator_init,
    moderator_verdict,
    visionary_node,
    critic_node,
    generalizer_node,
)


def route_after_generalizer(state: DebateState) -> str:
    round_num = state["round"]
    if round_num < 3:
        return "increment_round"
    return "moderator_verdict"


def route_after_moderator_init(state: DebateState) -> str:
    return "visionary"


def route_after_round_increment(state: DebateState) -> str:
    return "visionary"


def increment_round(state: DebateState) -> dict:
    return {"round": state["round"] + 1}


def build_graph() -> StateGraph:
    graph = StateGraph(DebateState)

    graph.add_node("moderator_init", moderator_init)
    graph.add_node("moderator_verdict", moderator_verdict)
    graph.add_node("visionary", visionary_node)
    graph.add_node("critic", critic_node)
    graph.add_node("generalizer", generalizer_node)
    graph.add_node("increment_round", increment_round)

    graph.set_entry_point("moderator_init")

    graph.add_edge("moderator_init", "visionary")
    graph.add_edge("visionary", "critic")
    graph.add_edge("critic", "generalizer")

    graph.add_conditional_edges(
        "generalizer",
        route_after_generalizer,
        {
            "increment_round": "increment_round",
            "moderator_verdict": "moderator_verdict",
        },
    )

    graph.add_edge("increment_round", "visionary")
    graph.add_edge("moderator_verdict", END)

    return graph.compile()


debate_graph = build_graph()