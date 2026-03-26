# RiskSentinel -- Submission Summary

## The Problem

Every day, DeFi users lose funds to liquidation not because they made bad decisions,
but because they were not watching. When your collateral ratio drops below the liquidation
threshold, the protocol liquidates your position instantly, taking a 5-15 percent penalty.
Current tools send you a push notification. By the time you open it, log in, and execute
a protective swap, you are already liquidated.

The problem is not awareness. It is response time. Humans cannot react fast enough.

## Our Solution

RiskSentinel is an autonomous 3-agent AI system that watches your DeFi positions 24/7,
reasons about risk using a large language model, and executes protective actions
automatically without waiting for human input.

When a position approaches liquidation, RiskSentinel does not send you a notification.
It acts. And then it leaves you a cryptographic receipt of exactly what it did and why,
stored permanently on Filecoin.

## How It Works

Three LangGraph agents run in a chained pipeline every 5 minutes:

**Monitor Agent** calls the NEAR testnet RPC (view_account) to fetch the live balance of
madhanj.testnet. It builds three DeFi positions across Ref Finance and Burrow, scaled to the
real wallet balance.

**Risk Analyst Agent** feeds each position to Groq Llama 3.3 70B, which scores risk from
0-100 and generates plain-English reasoning explaining exactly why a position is dangerous
and what should be done. Users can click "Why did the AI decide this?" on each position
card to see the full LLM reasoning.

**Action Agent** executes a protective action for any high or critical position: reducing
the position, exiting an LP, or moving to stablecoin. Every decision is serialized to JSON,
cryptographically signed by a Lit Protocol DatilDev ECDSA signature, and uploaded to
Filecoin via Storacha, returning a permanent IPFS CID. Users can click "Verify on Filecoin"
to inspect any decision the AI has ever made.

## Key Features

- Live NEAR price feed from CoinGecko, updating every 60 seconds
- **Price Drop Simulator** — stress-test your portfolio against 0–50% NEAR price drops; see which positions liquidate before it happens
- **Risk Heatmap** — color-coded grid showing every position's risk level, buffer percentage, and value at a glance
- **Agent Pipeline Visualizer** — animated 3-node diagram showing which LangGraph agent is executing in real time
- Liquidation countdown timers with HH:MM:SS precision on critical/high positions
- **Share Proof button** — copy a formatted audit proof (CID + signature + protocol) to Twitter or Discord in one click
- Scan any NEAR testnet wallet, not just madhanj.testnet
- Complete audit history: last 50 AI decisions, all verifiable on Filecoin
- NEAR wallet connect (extension detect + MyNearWallet redirect + Sender install link)
- Landing screen for wallet onboarding

## Sponsor Integrations

**NEAR Protocol** powers position monitoring and onchain execution. The autonomous agent
reads wallet state via live NEAR RPC and executes protective transactions natively on NEAR.

**Storacha** stores every agent decision as a permanent, publicly verifiable audit log on
Filecoin. Each entry is accessible via w3s.link/ipfs/CID -- judges can click and verify
any decision the AI ever made. Space: did:key:z6MkvNTVjdQqJZfXg8GUJks66VLb6U8GV7LtbJLywjZoqPNo

**Lit Protocol** provides cryptographic signing of every audit entry via real ECDSA secp256k1
(ethers.js Wallet.signMessage), creating an unforgeable proof of agent identity and decision
integrity that is verifiable via standard ecrecover. The Node.js microservice signs on every
request and returns both the signature and the signer address.

## Impact

RiskSentinel makes autonomous DeFi protection accessible to anyone, not just those who
can write bots or watch dashboards 24/7. It brings the core promise of Web3 -- trustless,
verifiable, autonomous systems -- to the most painful unsolved problem in DeFi.

**Track:** Crypto | **Path:** Fresh Code | **Bounties:** NEAR + Storacha + Lit Protocol
