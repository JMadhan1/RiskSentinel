from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class Position(BaseModel):
    wallet_id: str
    protocol: str  # e.g. "ref-finance", "burrow"
    asset: str
    amount: float
    value_usd: float
    collateral_ratio: Optional[float] = None
    liquidation_threshold: Optional[float] = None


class RiskScore(BaseModel):
    level: Literal["low", "medium", "high", "critical"]
    score: float  # 0.0 to 1.0
    reasons: list[str]
    recommended_action: str
    full_reasoning: Optional[str] = None  # plain-English LLM explanation


class AgentAction(BaseModel):
    action_type: Literal["hold", "reduce_position", "exit_lp", "move_to_stablecoin"]
    simulated: bool
    position: Position
    risk: RiskScore
    reasoning: str
    timestamp: datetime
    storacha_cid: Optional[str] = None  # filled after upload
    near_tx_hash: Optional[str] = None  # filled if real execution


class AuditEntry(BaseModel):
    id: str
    timestamp: datetime
    wallet_id: str
    action: AgentAction
    storacha_cid: str
    lit_signature: Optional[str] = None
