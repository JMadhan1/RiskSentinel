import os
import asyncio
import json
import httpx
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from agents.graph import run_pipeline

load_dotenv()

app = FastAPI(title="RiskSentinel API", version="1.0.0")

# Allow all origins so Vercel/ngrok frontends work without reconfiguring
_cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app" if "*" not in _cors_origins else None,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

WALLET_ID = os.getenv("NEAR_ACCOUNT_ID", "madhanj.testnet")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL_SECONDS", "300"))
MAX_HISTORY = 50

connected_clients: list[WebSocket] = []
latest_result: dict = {}
audit_history: list[dict] = []

NEAR_PRICE_CACHE: dict = {"price": 4.50, "updated_at": None}


async def fetch_near_price() -> float:
    global NEAR_PRICE_CACHE
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://api.coingecko.com/api/v3/simple/price",
                params={"ids": "near", "vs_currencies": "usd"}
            )
            data = resp.json()
            price = float(data["near"]["usd"])
            NEAR_PRICE_CACHE = {"price": price, "updated_at": datetime.utcnow().isoformat()}
            return price
    except Exception as e:
        print(f"[Price] CoinGecko error: {e}, using cached {NEAR_PRICE_CACHE['price']}")
        return NEAR_PRICE_CACHE["price"]


async def price_polling_loop():
    while True:
        price = await fetch_near_price()
        await broadcast({
            "type": "price_update",
            "near_price_usd": price,
            "timestamp": datetime.utcnow().isoformat()
        })
        await asyncio.sleep(60)


async def broadcast(data: dict):
    for ws in connected_clients[:]:
        try:
            await ws.send_text(json.dumps(data, default=str))
        except Exception:
            connected_clients.remove(ws)


async def run_and_broadcast(wallet_id: str):
    global latest_result, audit_history
    await broadcast({"type": "status", "message": f"Scanning {wallet_id}..."})
    try:
        result = await run_pipeline(wallet_id)
        latest_result = result
        new_entries = result.get("audit_entries", [])
        audit_history = (new_entries + audit_history)[:MAX_HISTORY]
        await broadcast({
            "type": "result",
            "data": result,
            "audit_history": audit_history
        })
    except Exception as e:
        await broadcast({"type": "error", "message": str(e)})


async def polling_loop():
    while True:
        await asyncio.sleep(POLL_INTERVAL)
        print(f"[Scheduler] Running pipeline for {WALLET_ID}")
        await run_and_broadcast(WALLET_ID)


@app.on_event("startup")
async def startup():
    asyncio.create_task(polling_loop())
    asyncio.create_task(price_polling_loop())
    asyncio.create_task(run_and_broadcast(WALLET_ID))


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    connected_clients.append(ws)
    if latest_result:
        await ws.send_text(json.dumps({
            "type": "result",
            "data": latest_result,
            "audit_history": audit_history
        }, default=str))
    await ws.send_text(json.dumps({
        "type": "price_update",
        "near_price_usd": NEAR_PRICE_CACHE["price"],
        "timestamp": NEAR_PRICE_CACHE.get("updated_at")
    }))
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        if ws in connected_clients:
            connected_clients.remove(ws)


@app.post("/api/scan")
async def manual_scan(wallet_id: str = None):
    wid = wallet_id or WALLET_ID
    asyncio.create_task(run_and_broadcast(wid))
    return {"message": f"Pipeline triggered for {wid}"}


@app.get("/api/price")
async def get_price():
    price = await fetch_near_price()
    return {"price": price, "near_price_usd": price, "updated_at": NEAR_PRICE_CACHE.get("updated_at")}


@app.get("/api/countdown")
async def get_countdown():
    positions = latest_result.get("positions", [])
    risk_scores = latest_result.get("risk_scores", [])
    countdowns = []
    for pos, risk in zip(positions, risk_scores):
        ratio = pos.get("collateral_ratio", 2.0)
        threshold = pos.get("liquidation_threshold", 1.2)
        gap = ratio - threshold
        level = risk.get("level", "low")
        if gap <= 0:
            hours = 0.0
        elif level == "critical":
            hours = round(gap / (ratio * 0.02), 1)
        elif level == "high":
            hours = round(gap / (ratio * 0.015), 1)
        else:
            hours = None
        countdowns.append({
            "asset": pos.get("asset"),
            "hours_to_liquidation": hours,
            "risk_level": level
        })
    return {"countdowns": countdowns}


@app.get("/api/history")
async def get_history():
    return {"entries": audit_history, "total": len(audit_history)}


@app.get("/api/status")
async def status():
    return {
        "wallet_id": WALLET_ID,
        "simulation_mode": os.getenv("SIMULATION_MODE", "true"),
        "poll_interval": POLL_INTERVAL,
        "latest_scan": latest_result.get("audit_entries", [])
    }


@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}
