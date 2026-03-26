<div align="center">

# 🛡️ RiskSentinel

### Autonomous DeFi Risk Management · Powered by AI Agents

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![NEAR](https://img.shields.io/badge/NEAR-Testnet-000000?style=flat&logo=near&logoColor=white)](https://near.org)
[![Filecoin](https://img.shields.io/badge/Filecoin-Storacha-0090FF?style=flat&logo=filecoin&logoColor=white)](https://storacha.network)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)
[![Demo](https://img.shields.io/badge/▶_Demo-YouTube-FF0000?style=flat&logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=TsMkBLaxFzA)
[![Live](https://img.shields.io/badge/🌐_Live-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://risk-sentinel-demo.vercel.app/)

<br/>

> **"Your DeFi positions, protected 24/7 by a 3-agent AI pipeline.**
> **Every decision signed. Every proof stored on Filecoin. Nothing left to chance."**

<br/>

[🎬 Demo Video](#-demo) · [⚡ Quick Start](#-quick-start) · [🏗️ Architecture](#%EF%B8%8F-architecture) · [🤝 Sponsors](#-sponsor-integrations)

</div>

---

## 🚨 The Problem

DeFi users lose **millions every week** to silent liquidations. Collateral ratios drift toward danger zones while you sleep — no automated protection, no verifiable record of what happened.

**Existing tools only alert. They don't act.**

---

## ✅ The Solution

RiskSentinel is an autonomous 3-agent AI system that:

| Step | Agent | Action |
|------|-------|--------|
| 👁️ **Watch** | Monitor Agent | Fetches live positions from NEAR DeFi protocols every 5 min |
| 🧠 **Score** | Risk Analyst | Groq LLM scores each position 0–100 with chain-of-thought reasoning |
| ⚡ **Act** | Action Agent | Executes protective swaps for critical positions automatically |
| 📦 **Prove** | — | Signs every decision with Lit Protocol · stores proof on Filecoin |

---

## 🎬 Demo

| | |
|---|---|
| **Demo Video** | ▶️ [Watch on YouTube](https://www.youtube.com/watch?v=TsMkBLaxFzA) |
| **Live App** | 🌐 [risk-sentinel-demo.vercel.app](https://risk-sentinel-demo.vercel.app/) |
| **GitHub** | 💻 [JMadhan1/RiskSentinel](https://github.com/JMadhan1/RiskSentinel) |
| **Live Filecoin Proof** | 🔗 [bafkrei...wevq](https://ipfs.io/ipfs/bafkreihzmrpuwm2uqybsuclvp4wymql4nostg3v4t25bjg3uyclcaawevq) |

---

## ✨ Features

<table>
<tr>
<td width="50%">

**🗺️ Risk Heatmap**
Color-coded grid of all positions. Buffer %, value, and glow effects show danger at a glance.

**🎯 Price Drop Simulator**
Drag a slider to stress-test at 0–50% NEAR price drop — see which positions liquidate before it happens.

**🔄 Agent Pipeline Visualizer**
Animated 3-node diagram. Watch each LangGraph agent light up in real time as the pipeline runs.

</td>
<td width="50%">

**⏱️ Live Liquidation Countdown**
HH:MM:SS timer on critical/high positions — estimated time to liquidation based on collateral gap.

**🧠 AI Reasoning Panel**
Click any position to see the full LLM chain-of-thought: risk factors, decision logic, recommended action.

**↗️ Share Proof Button**
One-click copy of a formatted audit proof — CID + signature + protocol — ready for Twitter or Discord.

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
╔══════════════════════════════════════════════════════════════╗
║              React Frontend  :5173                           ║
║                                                              ║
║   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   ║
║   │ Position │  │  Risk    │  │  Agent   │  │  Audit   │   ║
║   │  Cards   │  │ Heatmap  │  │ Pipeline │  │  Trail   │   ║
║   └──────────┘  └──────────┘  └──────────┘  └──────────┘   ║
║                    WebSocket  ·  REST API                    ║
╚════════════════════════════╤═════════════════════════════════╝
                             │
╔════════════════════════════▼═════════════════════════════════╗
║              FastAPI Backend  :8000                          ║
║                                                              ║
║   ┌──────────────────────────────────────────────────────┐   ║
║   │           LangGraph 3-Agent Pipeline                 │   ║
║   │                                                      │   ║
║   │   👁 Monitor  ──►  🧠 Risk Analyst  ──►  ⚡ Action  │   ║
║   │   Fetch NEAR       Groq LLM Score       Execute Tx   │   ║
║   │   positions        0-100 + reasons      + sign/store │   ║
║   └──────────────────────────────────────────────────────┘   ║
╚═══════════════════╤══════════════════════╤════════════════════╝
                    │                      │
         ╔══════════▼═══════╗   ╔══════════▼════════╗
         ║  Lit Service     ║   ║  Storacha Service  ║
         ║     :3001        ║   ║      :3002         ║
         ║  ECDSA secp256k1 ║   ║  w3 CLI → Filecoin ║
         ║  ethers.js sign  ║   ║  Real IPFS CIDs    ║
         ╚══════════════════╝   ╚════════════════════╝
```

---

## 🤝 Sponsor Integrations

<details>
<summary><b>🟣 NEAR Protocol — AI That Works For You</b></summary>
<br/>

Live testnet RPC query (`view_account`) fetches **real `madhanj.testnet` balance** on every scan. Balance scales the Burrow and Ref Finance positions shown in the UI. Action Agent submits NEAR transactions for protective swaps.

```python
# backend/integrations/near.py
result = await provider.get_account("madhanj.testnet")
balance_near = int(result["amount"]) / 1e24
```
</details>

<details>
<summary><b>🔵 Storacha / Filecoin — Permanent Audit Storage</b></summary>
<br/>

Every agent decision is serialized to JSON and uploaded via `w3 CLI` → **real persistent CID on Filecoin**. CIDs are displayed with clickable verification links in the Audit Trail.

```
Space DID : did:key:z6MkvNTVjdQqJZfXg8GUJks66VLb6U8GV7LtbJLywjZoqPNo
Example CID: bafkreihzmrpuwm2uqybsuclvp4wymql4nostg3v4t25bjg3uyclcaawevq
Verify    : https://w3s.link/ipfs/bafkreihzmrpuwm2uqybsuclvp4wymql4nostg3v4t25bjg3uyclcaawevq
```
</details>

<details>
<summary><b>🟡 Lit Protocol — Cryptographic Agent Identity</b></summary>
<br/>

Each audit entry is signed with **real ECDSA secp256k1** (ethers.js `Wallet.signMessage`) before Storacha upload. The signature is verifiable via standard `ecrecover` — anyone can prove the exact decision came from this agent's key.

```js
// backend/lit_service/index.js
const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(data)));
const signature = await wallet.signMessage(ethers.utils.arrayify(hash));
```
</details>

<details>
<summary><b>🟢 Groq — LLM Risk Scoring</b></summary>
<br/>

`llama-3.3-70b-versatile` inside the LangGraph pipeline. Returns structured JSON with `risk_level`, `score` (0–1), `reasons[]`, `recommended_action`, and `full_reasoning` — the full chain-of-thought shown in the AI Reasoning panel.
</details>

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **AI Pipeline** | LangGraph · LangChain · Groq `llama-3.3-70b-versatile` |
| **Backend** | Python 3.11 · FastAPI · WebSockets · APScheduler |
| **Frontend** | React 18 · Vite · TailwindCSS |
| **Blockchain** | NEAR Protocol (`madhanj.testnet`) |
| **Decentralized Storage** | Storacha w3up · Filecoin · IPFS |
| **Cryptographic Signing** | Lit Protocol · ethers.js · ECDSA secp256k1 |
| **Deployment** | Vercel (frontend) · Railway (backend) |

---

## ⚡ Quick Start

### 1 · Prerequisites

```bash
node --version   # 18+
python --version # 3.11+
npm install -g @web3-storage/w3cli   # for Storacha uploads
```

### 2 · Configure

```bash
# Edit backend/.env
GROQ_API_KEY=your_key_from_console.groq.com
NEAR_ACCOUNT_ID=madhanj.testnet
NEAR_NETWORK=testnet
SIMULATION_MODE=true
```

### 3 · Install

```bash
cd backend && pip install -r requirements.txt
cd backend/lit_service && npm install
cd backend/storacha_service && npm install
cd frontend && npm install
```

### 4 · Start (Windows)

```bash
start.bat          # opens 4 terminals automatically
```

**Or manually:**

```bash
# Terminal 1
cd backend/lit_service && node index.js

# Terminal 2
cd backend/storacha_service && node index.js

# Terminal 3
cd backend && python -m uvicorn main:app --reload

# Terminal 4
cd frontend && npm run dev
```

Open **http://localhost:5173** → connect your NEAR wallet → click **⚡ SCAN**

### 5 · Trigger a scan via API

```bash
curl -X POST http://localhost:8000/api/scan
```

---

## 🌐 Deploy to Vercel

The frontend is Vercel-ready out of the box.

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com) — `vercel.json` is already configured
3. Set **Environment Variable** in Vercel dashboard:
   ```
   VITE_API_URL = https://your-backend.railway.app
   ```
4. Deploy — WebSocket URL is derived automatically (`https://` → `wss://`)

For the backend, deploy to [Railway](https://railway.app) or expose locally with:
```bash
ngrok http 8000
```

---

## 📁 Project Structure

```
risk-sentinel/
├── backend/
│   ├── main.py                    # FastAPI + WebSocket + scheduler
│   ├── agents/
│   │   ├── graph.py               # LangGraph pipeline definition
│   │   ├── monitor_agent.py       # Position fetcher (NEAR RPC)
│   │   ├── risk_analyst.py        # Groq LLM scorer
│   │   └── action_agent.py        # TX executor + Lit/Storacha writer
│   ├── lit_service/               # Node.js ECDSA signing service (:3001)
│   └── storacha_service/          # Node.js Filecoin upload service (:3002)
├── frontend/src/
│   ├── App.jsx                    # Root — WebSocket + state
│   └── components/
│       ├── LandingScreen.jsx      # NEAR wallet connect
│       ├── PositionCard.jsx       # Risk card + countdown + AI reasoning
│       ├── RiskHeatmap.jsx        # Color-coded position grid
│       ├── SimulationSlider.jsx   # Price drop stress tester
│       ├── AgentPipeline.jsx      # Animated 3-agent visualizer
│       ├── AuditTrail.jsx         # Filecoin CID list + share button
│       └── AgentTerminal.jsx      # Live agent log
├── vercel.json                    # Vercel build + SPA routing config
├── start.bat                      # One-click Windows launcher
└── .gitignore
```

---

## 🔄 How It Works — Step by Step

```
User clicks ⚡ SCAN
        │
        ▼
👁 Monitor Agent
  └─ calls NEAR testnet RPC view_account("madhanj.testnet")
  └─ fetches live balance → scales 3 DeFi positions
        │
        ▼
🧠 Risk Analyst Agent
  └─ sends each position to Groq llama-3.3-70b-versatile
  └─ returns { score, level, reasons[], recommended_action, full_reasoning }
        │
        ▼
⚡ Action Agent  (for high/critical positions)
  └─ executes protective swap (or simulates if SIMULATION_MODE=true)
  └─ POSTs audit JSON → Lit Service → ECDSA signature
  └─ POSTs signed JSON → Storacha Service → Filecoin CID
        │
        ▼
📡 WebSocket broadcast → React frontend updates in real time
📦 Audit Trail shows CID + "Verify ↗" link → click to inspect on IPFS
```

---

## 📋 Changelog

| Date | Milestone |
|------|-----------|
| 2026-03-25 | Initial repo · LangGraph 3-agent pipeline |
| 2026-03-25 | NEAR testnet RPC · Burrow / Ref Finance positions |
| 2026-03-25 | Groq LLM scoring with fallback heuristics |
| 2026-03-25 | Storacha service · real Filecoin CIDs |
| 2026-03-25 | Lit Protocol signing microservice |
| 2026-03-25 | React frontend · WebSocket · Audit Trail |
| 2026-03-26 | Price Drop Simulator · Risk Heatmap |
| 2026-03-26 | Agent Pipeline Visualizer · Liquidation Countdown |
| 2026-03-26 | Share Proof button · Vercel deployment config |

---

<div align="center">

**Track:** Crypto &nbsp;·&nbsp; **Path:** Fresh Code &nbsp;·&nbsp; **Hackathon:** PL_Genesis: Frontiers of Collaboration

**Bounties targeted:** NEAR · Storacha · Lit Protocol

<br/>

Made with ☕ and too little sleep · MIT License

</div>
