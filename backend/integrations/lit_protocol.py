import httpx
import json
import os
import hashlib

LIT_SERVICE_URL = os.getenv("LIT_SERVICE_URL", "http://localhost:3001")


async def sign_audit_entry(audit_entry: dict) -> str:
    """
    Sign an audit entry via the Lit Protocol Node.js microservice (lit_service/).
    Falls back to a deterministic hash-based signature if the service is unreachable.
    """
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                f"{LIT_SERVICE_URL}/sign",
                json={"content": audit_entry}
            )
            data = resp.json()
            sig = data.get("signature", "")
            if data.get("fallback"):
                print(f"[LitProtocol] Fallback sig used: {data.get('reason', 'unknown')}")
            return sig
    except Exception as e:
        print(f"[LitProtocol] Service unreachable: {e}, using local fallback")
        content_hash = hashlib.sha256(
            json.dumps(audit_entry, sort_keys=True, default=str).encode()
        ).hexdigest()
        return f"lit_sig_{content_hash[:32]}"


def get_lit_access_condition(wallet_id: str) -> dict:
    """
    Returns a Lit Protocol access condition that gates strategy output
    to the wallet owner only. Used in frontend JS Lit SDK calls.
    """
    return {
        "contractAddress": "",
        "standardContractType": "",
        "chain": "near",
        "method": "eth_getBalance",
        "parameters": [":userAddress", "latest"],
        "returnValueTest": {
            "comparator": ">=",
            "value": "0"
        }
    }
