from langgraph.graph import StateGraph, END, START
from agents.monitor_agent import monitor_agent
from agents.risk_analyst import risk_analyst_agent
from agents.action_agent import action_agent
from typing import TypedDict, Any


class RiskSentinelState(TypedDict):
    wallet_id: str
    positions: list
    risk_scores: list
    audit_entries: list
    agent_log: list


def build_graph():
    graph = StateGraph(RiskSentinelState)
    graph.add_node("monitor", monitor_agent)
    graph.add_node("risk_analyst", risk_analyst_agent)
    graph.add_node("action", action_agent)
    graph.add_edge(START, "monitor")
    graph.add_edge("monitor", "risk_analyst")
    graph.add_edge("risk_analyst", "action")
    graph.add_edge("action", END)
    return graph.compile()


pipeline = build_graph()


async def run_pipeline(wallet_id: str) -> dict:
    initial_state = {
        "wallet_id": wallet_id,
        "positions": [],
        "risk_scores": [],
        "audit_entries": [],
        "agent_log": []
    }
    result = await pipeline.ainvoke(initial_state)
    return result
