import httpx
from typing import Optional

NEAR_RPC_TESTNET = "https://rpc.testnet.near.org"


async def get_account_balance(account_id: str) -> dict:
    """Fetch NEAR account balance from testnet RPC."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(NEAR_RPC_TESTNET, json={
            "jsonrpc": "2.0",
            "id": "dontcare",
            "method": "query",
            "params": {
                "request_type": "view_account",
                "finality": "final",
                "account_id": account_id
            }
        })
        return resp.json()


async def get_near_balance_yocto(account_id: str) -> float:
    """Fetch real NEAR balance in yoctoNEAR from testnet RPC. Returns 0.0 on failure."""
    try:
        result = await get_account_balance(account_id)
        amount_yocto = result.get("result", {}).get("amount", "0")
        return float(amount_yocto) / 1e24  # convert to NEAR
    except Exception:
        return 0.0


async def get_mock_defi_positions(wallet_id: str) -> list[dict]:
    """
    Fetch NEAR account balance via RPC, then build DeFi positions scaled to
    the real balance. In production, replace with live Burrow/Ref Finance API calls.
    """
    near_balance = await get_near_balance_yocto(wallet_id)
    # Use real balance if available, otherwise default to demo values
    near_price_usd = 5.50  # approximate NEAR price
    balance_usd = near_balance * near_price_usd if near_balance > 0 else 100.0

    # Scale the three demo positions to the real wallet balance
    burrow_amount = max(near_balance * 0.40, 1.0) if near_balance > 0 else 800.0
    ref1_usd = balance_usd * 0.35
    ref2_usd = balance_usd * 0.50

    return [
        {
            "wallet_id": wallet_id,
            "protocol": "ref-finance",
            "asset": "NEAR/USDC LP",
            "amount": round(ref1_usd / near_price_usd, 4),
            "value_usd": round(ref1_usd, 2),
            "collateral_ratio": 1.45,
            "liquidation_threshold": 1.20
        },
        {
            "wallet_id": wallet_id,
            "protocol": "burrow",
            "asset": "wNEAR",
            "amount": round(burrow_amount, 4),
            "value_usd": round(burrow_amount * near_price_usd, 2),
            "collateral_ratio": 1.18,  # dangerously close to threshold
            "liquidation_threshold": 1.15
        },
        {
            "wallet_id": wallet_id,
            "protocol": "ref-finance",
            "asset": "ETH/NEAR LP",
            "amount": round(ref2_usd / near_price_usd, 4),
            "value_usd": round(ref2_usd, 2),
            "collateral_ratio": 2.10,
            "liquidation_threshold": 1.30
        }
    ]


async def simulate_protective_swap(wallet_id: str, asset: str, action: str) -> str:
    """Simulate a protective swap. Returns a fake tx hash for demo."""
    import hashlib
    import time
    fake_hash = hashlib.sha256(f"{wallet_id}{asset}{action}{time.time()}".encode()).hexdigest()
    return f"simulated_tx_{fake_hash[:16]}"
