import os
import json
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from models.schemas import RiskScore

_llm = None


def get_llm():
    """Lazy-initialize the LLM so import doesn't fail without an API key."""
    global _llm
    if _llm is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return None
        _llm = ChatGroq(
            api_key=api_key,
            model="llama-3.3-70b-versatile",
            temperature=0.1
        )
    return _llm


SYSTEM_PROMPT = """You are a DeFi risk analyst AI. You will be given a list of wallet positions
across DeFi protocols. For each position, analyze:
1. Liquidation risk (collateral_ratio vs liquidation_threshold)
2. Impermanent loss risk for LP positions
3. Protocol concentration risk
4. Overall portfolio health

Respond with a JSON array. Each item must have:
- position_index (int)
- level: "low" | "medium" | "high" | "critical"
- score: float 0.0 to 1.0 (1.0 = maximum risk)
- reasons: list of strings (max 3 reasons)
- recommended_action: one of "hold" | "reduce_position" | "exit_lp" | "move_to_stablecoin"

Respond ONLY with valid JSON. No markdown, no explanation."""

EXPLAIN_SYSTEM_PROMPT = """You are a DeFi risk expert explaining to a non-technical user.
Given a position and its risk assessment, write 2-3 plain English sentences explaining:
1. Why this position is at risk
2. What could happen if nothing is done
3. What the recommended action achieves

Be direct, clear, and avoid jargon. No bullet points — flowing sentences only."""


def _fallback_scoring(positions: list) -> list:
    """Compute risk scores heuristically when LLM is unavailable."""
    risk_data = []
    for i, pos in enumerate(positions):
        ratio = pos.get("collateral_ratio", 2.0)
        threshold = pos.get("liquidation_threshold", 1.2)
        gap = ratio - threshold
        if gap < 0.05:
            level, score, action = "critical", 0.95, "move_to_stablecoin"
        elif gap < 0.15:
            level, score, action = "high", 0.75, "reduce_position"
        elif gap < 0.40:
            level, score, action = "medium", 0.45, "hold"
        else:
            level, score, action = "low", 0.15, "hold"
        risk_data.append({
            "position_index": i,
            "level": level,
            "score": score,
            "reasons": [f"Collateral ratio {ratio:.2f} vs threshold {threshold:.2f}"],
            "recommended_action": action,
            "full_reasoning": None
        })
    return risk_data


async def risk_analyst_agent(state: dict) -> dict:
    """
    Agent 2: Risk Analyst Agent
    Uses Groq Llama 3.3 70B to score each position for risk.
    Also generates plain-English explanations for high/critical positions.
    Falls back to heuristic scoring if API key not configured.
    """
    positions = state.get("positions", [])
    print(f"[RiskAnalyst] Analyzing {len(positions)} positions with LLM")

    user_msg = f"Analyze these DeFi positions and return risk scores:\n{json.dumps(positions, indent=2)}"
    llm = get_llm()

    risk_data = None
    if llm is not None:
        try:
            response = llm.invoke([
                SystemMessage(content=SYSTEM_PROMPT),
                HumanMessage(content=user_msg)
            ])
            raw = response.content.strip()
            # Strip markdown code blocks if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            risk_data = json.loads(raw.strip())
        except Exception as e:
            print(f"[RiskAnalyst] LLM error: {e}, using fallback scoring")

    if risk_data is None:
        print("[RiskAnalyst] Using fallback heuristic scoring")
        risk_data = _fallback_scoring(positions)
    else:
        # Add plain-English reasoning for high/critical positions
        for i, r in enumerate(risk_data):
            pos_data = positions[i] if i < len(positions) else {}
            r.setdefault("full_reasoning", None)
            if r.get("level") in ("high", "critical") and llm is not None:
                try:
                    explain_resp = llm.invoke([
                        SystemMessage(content=EXPLAIN_SYSTEM_PROMPT),
                        HumanMessage(content=f"Position: {json.dumps(pos_data)}\nRisk assessment: {json.dumps(r)}")
                    ])
                    r["full_reasoning"] = explain_resp.content.strip()
                except Exception:
                    pass

    risk_scores = []
    for r in risk_data:
        risk_scores.append(RiskScore(
            level=r["level"],
            score=r["score"],
            reasons=r.get("reasons", []),
            recommended_action=r["recommended_action"],
            full_reasoning=r.get("full_reasoning")
        ).model_dump())

    log = state.get("agent_log", [])
    critical = [r for r in risk_scores if r["level"] == "critical"]
    high = [r for r in risk_scores if r["level"] == "high"]
    log.append(f"[RiskAnalyst] {len(critical)} critical, {len(high)} high-risk positions detected")

    return {**state, "risk_scores": risk_scores, "agent_log": log}
