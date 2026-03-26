import httpx
import json
import os
import hashlib

STORACHA_SERVICE_URL = os.getenv("STORACHA_SERVICE_URL", "http://localhost:3002")


async def upload_audit_log(audit_entry: dict) -> str:
    """
    Upload an audit entry as JSON via the Storacha Node.js microservice (storacha_service/).
    The service uses @web3-storage/w3up-client for real uploads to Filecoin/IPFS.
    Falls back to a deterministic mock CID if the service is unreachable or unconfigured.
    """
    try:
        filename = f"risksentinel-audit-{audit_entry.get('id', 'unknown')}.json"
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{STORACHA_SERVICE_URL}/upload",
                json={"content": audit_entry, "filename": filename}
            )
            data = resp.json()
            cid = data.get("cid", "")
            if data.get("mock"):
                print(f"[Storacha] Mock CID returned: {data.get('reason', 'unknown')}")
            else:
                print(f"[Storacha] Uploaded to Filecoin => {cid}")
            return cid
    except Exception as e:
        print(f"[Storacha] Service unreachable: {e}, using local fallback")
        mock_cid = "bafyreib" + hashlib.sha256(
            json.dumps(audit_entry, default=str).encode()
        ).hexdigest()[:38]
        return mock_cid
