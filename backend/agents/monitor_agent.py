from integrations.near import get_mock_defi_positions, get_near_balance_yocto
from models.schemas import Position


async def monitor_agent(state: dict) -> dict:
    """
    Agent 1: Monitor Agent
    Fetches real NEAR account balance via testnet RPC, then builds DeFi positions
    scaled to the actual wallet balance.
    """
    wallet_id = state.get("wallet_id")
    print(f"[MonitorAgent] Scanning positions for {wallet_id}")

    near_balance = await get_near_balance_yocto(wallet_id)
    balance_log = (
        f"[Monitor] NEAR balance for {wallet_id}: {near_balance:.4f} NEAR (live from testnet RPC)"
        if near_balance > 0
        else f"[Monitor] Could not fetch live balance for {wallet_id}, using defaults"
    )

    raw_positions = await get_mock_defi_positions(wallet_id)
    positions = [Position(**p) for p in raw_positions]

    return {
        **state,
        "positions": [p.model_dump() for p in positions],
        "agent_log": state.get("agent_log", []) + [
            balance_log,
            f"[Monitor] Found {len(positions)} positions for {wallet_id}"
        ]
    }
