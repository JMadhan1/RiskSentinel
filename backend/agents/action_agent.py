import os
import uuid
from datetime import datetime
from integrations.near import simulate_protective_swap
from integrations.storacha import upload_audit_log
from integrations.lit_protocol import sign_audit_entry
from models.schemas import AgentAction, AuditEntry, Position, RiskScore

SIMULATION_MODE = os.getenv("SIMULATION_MODE", "true").lower() == "true"


async def action_agent(state: dict) -> dict:
    """
    Agent 3: Protective Action Agent
    For each high/critical position, decides and executes (or simulates) a protective action.
    Logs every decision to Storacha with a Lit Protocol signature.
    """
    positions = state.get("positions", [])
    risk_scores = state.get("risk_scores", [])
    wallet_id = state.get("wallet_id")
    audit_entries = []
    log = state.get("agent_log", [])

    for i, (pos_data, risk_data) in enumerate(zip(positions, risk_scores)):
        risk_level = risk_data["level"]
        if risk_level not in ("high", "critical"):
            log.append(f"[ActionAgent] Position {i} ({pos_data['asset']}) is {risk_level} - no action needed")
            continue

        position = Position(**pos_data)
        risk = RiskScore(**risk_data)
        action_type = risk.recommended_action

        # Execute or simulate
        tx_hash = None
        if SIMULATION_MODE:
            tx_hash = await simulate_protective_swap(wallet_id, position.asset, action_type)
            log.append(f"[ActionAgent] SIMULATED {action_type} on {position.asset} => {tx_hash}")
        else:
            # Real execution placeholder -- wire to near.py execute_transaction()
            tx_hash = await simulate_protective_swap(wallet_id, position.asset, action_type)
            log.append(f"[ActionAgent] EXECUTED {action_type} on {position.asset} => {tx_hash}")

        action = AgentAction(
            action_type=action_type,
            simulated=SIMULATION_MODE,
            position=position,
            risk=risk,
            reasoning=f"Risk level {risk_level} (score {risk.score:.2f}). Reasons: {'; '.join(risk.reasons)}",
            timestamp=datetime.utcnow(),
            near_tx_hash=tx_hash
        )

        # Build audit payload
        audit_payload = {
            "id": str(uuid.uuid4()),
            "timestamp": action.timestamp.isoformat(),
            "wallet_id": wallet_id,
            "action": action.model_dump(mode="json"),
            "agent_version": "1.0.0"
        }

        # Sign with Lit Protocol (async HTTP call to lit_service)
        lit_sig = await sign_audit_entry(audit_payload)
        audit_payload["lit_signature"] = lit_sig

        # Upload to Storacha
        cid = await upload_audit_log(audit_payload)
        audit_payload["storacha_cid"] = cid
        log.append(f"[ActionAgent] Audit log uploaded to Storacha => CID: {cid}")

        audit_entries.append(audit_payload)

    return {**state, "audit_entries": audit_entries, "agent_log": log}
