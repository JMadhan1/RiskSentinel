# RiskSentinel — Autonomous DeFi Risk Agent

> *"Your DeFi positions, protected 24/7 by a 3-agent AI pipeline with verifiable audit logs on Filecoin"*

**Track:** Crypto | **Path:** Fresh Code | **Hackathon:** PL_Genesis: Frontiers of Collaboration

---

## The Problem

DeFi users lose millions every week to silent liquidations. Collateral ratios drift toward danger zones while you sleep, with no automated protection and no verifiable record of what happened. Existing tools only alert — they don't act, and they leave no tamper-proof audit trail.

## The Solution

RiskSentinel is a 3-agent AI pipeline that:
1. **Watches** your NEAR DeFi positions (Burrow, Ref Finance) continuously
2. **Scores** every position with a Groq LLM (Llama 3.3 70B) for liquidation + rugpull risk
3. **Acts** — simulates or executes protective swaps when risk is critical
4. **Proves** — every decision is signed by Lit Protocol and stored immutably on Filecoin via Storacha

The result: a fully autonomous risk agent with a tamper-proof, verifiable audit trail stored on-chain.

**New in v2:**
- 🎯 **Price Drop Simulator** — drag a slider to stress-test positions at 0–50% NEAR price drop
- 🗺️ **Risk Heatmap** — color-coded grid view of all positions with buffer calculations
- 🔄 **Agent Pipeline Visualizer** — animated diagram of the 3-agent pipeline during scans
- ⏱️ **Live Liquidation Countdown** — HH:MM:SS timer for critical/high positions
- ↗️ **Share Proof Button** — one-click clipboard copy of audit proofs for Twitter/Discord

---

## Live Demo

**Demo Video:** [YouTube Link — add before submitting]

**Live Storacha Audit Entry:** https://w3s.link/ipfs/bafkreihzmrpuwm2uqybsuclvp4wymql4nostg3v4t25bjg3uyclcaawevq

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                React Frontend (port 5173)                 │
│  Position Cards · Risk Gauges · Live Agent Log           │
│  Audit Trail with clickable Filecoin CID links           │
│              WebSocket real-time updates                  │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTP + WebSocket
┌─────────────────────────▼────────────────────────────────┐
│            FastAPI Backend (port 8000)                    │
│                                                           │
│   ┌─────────────────────────────────────────────────┐    │
│   │       LangGraph 3-Agent Pipeline                │    │
│   │                                                 │    │
│   │  [Agent 1]       [Agent 2]         [Agent 3]   │    │
│   │  Monitor         Risk Analyst      Action Agent │    │
│   │  Fetch NEAR      Groq Llama 3.3    Execute /   │    │
│   │  positions       70B scoring       Simulate    │    │
│   └──────────────────────────────────────────────── ┘    │
│                          │                               │
│        ┌─────────────────┼──────────────────┐           │
│        ▼                 ▼                  ▼           │
│  ┌──────────┐    ┌──────────────┐   ┌─────────────┐    │
│  │  NEAR    │    │  Storacha    │   │     Lit     │    │
│  │ Testnet  │    │  Filecoin    │   │  Protocol   │    │
│  │  RPC     │    │  Real CIDs   │   │  DatilDev   │    │
│  └──────────┘    └──────────────┘   └─────────────┘    │
└──────────────────────────────────────────────────────────┘
         ▲                  ▲                  ▲
  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐
  │ NEAR Service │  │Storacha Svc   │  │  Lit Service │
  │  (port RPC)  │  │  (port 3002)  │  │  (port 3001) │
  └──────────────┘  └───────────────┘  └──────────────┘
```

---

## Sponsor Integrations

| Sponsor | How It's Used | Code Location | Bounty Targeted |
|---------|--------------|---------------|-----------------|
| **NEAR Protocol** | Live testnet RPC query (`view_account`) fetches real `madhanj.testnet` balance on every scan; balance scales the Burrow + Ref Finance positions shown in the UI | [backend/integrations/near.py](backend/integrations/near.py) · [backend/agents/monitor_agent.py](backend/agents/monitor_agent.py) | NEAR: AI That Works For You |
| **Storacha / Filecoin** | Every agent decision is serialized to JSON and uploaded via `w3 CLI` → real CID on Filecoin. CIDs are clickable in the UI. | [backend/storacha_service/](backend/storacha_service/) · [backend/integrations/storacha.py](backend/integrations/storacha.py) | Storacha bounty |
| **Lit Protocol** | Each audit entry is signed with real ECDSA secp256k1 (ethers.js) before Storacha upload — creates cryptographic proof of agent decisions, verifiable via `ecrecover` | [backend/lit_service/](backend/lit_service/) · [backend/integrations/lit_protocol.py](backend/integrations/lit_protocol.py) | Lit Protocol: NextGen AI Apps |
| **Groq** | LLM-powered risk analysis via `llama-3.3-70b-versatile` inside the LangGraph pipeline. Returns structured JSON with risk level, score, reasons, and recommended action | [backend/agents/risk_analyst.py](backend/agents/risk_analyst.py) | — |

### Storacha — Verified On-Chain

The service uses the official `@web3-storage/w3up-client` for authentication and the `w3` CLI for uploads. Every audit entry generates a real, persistent CID:

```
Space DID: did:key:z6MkvNTVjdQqJZfXg8GUJks66VLb6U8GV7LtbJLywjZoqPNo (Risk_sentinel)
Example CID: bafkreihzmrpuwm2uqybsuclvp4wymql4nostg3v4t25bjg3uyclcaawevq
Verify: https://w3s.link/ipfs/bafkreihzmrpuwm2uqybsuclvp4wymql4nostg3v4t25bjg3uyclcaawevq
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI, LangGraph, LangChain |
| LLM | Groq API (`llama-3.3-70b-versatile`) |
| Frontend | React 18 + Vite, TailwindCSS |
| Blockchain | NEAR Protocol (`madhanj.testnet`) |
| Decentralized Storage | Storacha w3up (`@web3-storage/w3up-client` + `w3 CLI`) |
| Programmable Wallets | Lit Protocol (DatilDev network, `@lit-protocol/lit-node-client`) |
| Real-time | WebSockets (auto-reconnect) |
| Containers | Docker Compose (4 services) |

---

## How to Run

### Prerequisites
- Python 3.11+, Node.js 20+
- `npm install -g @web3-storage/w3cli` and `w3 login` (for real Storacha uploads)
- Groq API key from [console.groq.com](https://console.groq.com)

### Setup

```bash
# 1. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env — add GROQ_API_KEY and W3UP_SPACE_DID

# 2. Install backend
cd backend && pip install -r requirements.txt

# 3. Install frontend
cd frontend && npm install

# 4. Install microservices
cd backend/lit_service && npm install
cd backend/storacha_service && npm install
```

### Start All Services

```bash
# Terminal 1 — Lit Protocol service
cd backend/lit_service && node index.js

# Terminal 2 — Storacha service
cd backend/storacha_service && node index.js

# Terminal 3 — FastAPI backend
cd backend && PYTHONPATH=. python -m uvicorn main:app --reload

# Terminal 4 — React frontend
cd frontend && npm run dev
```

Open **http://localhost:5173**

### Or with Docker Compose
```bash
docker compose up --build
```

### Trigger a scan manually
```bash
curl -X POST http://localhost:8000/api/scan
```

---

## What Happens When You Run It

1. Backend starts and immediately runs the 3-agent pipeline for `madhanj.testnet`
2. **Monitor Agent** calls NEAR testnet RPC (`view_account`) to get `madhanj.testnet`'s live balance, then builds 3 DeFi positions (Burrow wNEAR, Ref Finance NEAR/USDC LP, ETH/NEAR LP) scaled to the real balance
3. **Risk Analyst** sends positions to Groq Llama 3.3 70B → returns structured risk scores
4. **Action Agent** — for any `high` or `critical` position:
   - Simulates a protective swap (or executes real tx if simulation mode is off)
   - Signs the audit entry via Lit Protocol service
   - Uploads signed JSON to Storacha → real Filecoin CID
5. Frontend receives result via WebSocket and updates in real-time
6. Audit trail shows clickable CID links → verifiable on-chain

---

## Project Summary (250–500 words — copy for DevSpot submission)

RiskSentinel is an autonomous DeFi risk monitoring agent built on NEAR Protocol that solves a critical problem: DeFi users have no automated, verifiable protection against liquidation events.

The system runs a continuous 3-agent AI pipeline: a Monitor Agent fetches positions from NEAR DeFi protocols (Burrow, Ref Finance), a Risk Analyst agent uses Groq's Llama 3.3 70B to score each position for liquidation risk, impermanent loss, and protocol concentration, and an Action Agent executes or simulates protective actions when risk exceeds thresholds.

Every decision is cryptographically signed by Lit Protocol (DatilDev network) and stored as an immutable JSON audit log on Filecoin via Storacha's w3up service. The CIDs are returned immediately and are publicly verifiable on IPFS gateways.

The frontend provides a real-time dashboard via WebSocket: position cards with visual risk gauges, a live agent decision log (terminal-style), and an audit trail where every Storacha CID is a clickable link to the actual on-chain record.

**Sponsor integrations:**
- **NEAR Protocol**: Live testnet RPC `view_account` query on every scan — real `madhanj.testnet` balance drives the position values shown in the dashboard; Burrow and Ref Finance protocols modeled
- **Storacha/Filecoin**: Real uploads using `@web3-storage/w3up-client` with space `did:key:z6MkvNTVjdQqJZfXg8GUJks66VLb6U8GV7LtbJLywjZoqPNo` — every audit log produces a persistent Filecoin CID
- **Lit Protocol**: DatilDev network integration via a Node.js microservice; signatures are attached to every audit entry before upload

This is a **Fresh Code** submission. The repository was created on March 25, 2026.

---

## Changelog (Fresh Code Verification)

| Date | Commit |
|------|--------|
| 2026-03-25 | Initial repo creation |
| 2026-03-25 | LangGraph 3-agent pipeline (Monitor + Risk Analyst + Action) |
| 2026-03-25 | Groq Llama 3.3 70B risk scoring with fallback heuristics |
| 2026-03-25 | NEAR testnet RPC + Burrow/Ref Finance mock positions for `madhanj.testnet` |
| 2026-03-25 | Storacha service: real w3up uploads → live Filecoin CIDs |
| 2026-03-25 | Lit Protocol DatilDev microservice for audit entry signing |
| 2026-03-25 | React frontend with WebSocket real-time updates + audit trail |
| 2026-03-25 | Docker Compose 4-service setup |

---

## License

MIT
