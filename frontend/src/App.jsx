import { useState, useEffect, useRef, useCallback } from 'react';
import LandingScreen from './components/LandingScreen';
import StatBar from './components/StatBar';
import PositionCard from './components/PositionCard';
import AgentTerminal from './components/AgentTerminal';
import AuditTrail from './components/AuditTrail';
import NearPriceTicker from './components/NearPriceTicker';
import { SimulationSlider } from './components/SimulationSlider';
import { RiskHeatmap } from './components/RiskHeatmap';
import { AgentPipeline } from './components/AgentPipeline';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// http:// → ws://, https:// → wss://  (works for both local and production)
const WS = API.replace(/^http/, 'ws') + '/ws';

// Normalize audit entries from backend format to AuditTrail format
function normalizeAuditEntry(e) {
  return {
    protocol: e.action?.position?.protocol || e.protocol || 'Unknown',
    risk_level: e.action?.risk?.level || e.risk_level || 'unknown',
    cid: e.storacha_cid || e.cid,
    signature: e.lit_signature || e.signature,
    action: e.action?.action_type || e.action_type || (typeof e.action === 'string' ? e.action : null),
    timestamp: e.timestamp,
  };
}

export default function App() {
  const [launched, setLaunched] = useState(false);
  const [wallet, setWallet] = useState('madhanj.testnet');
  const [walletInput, setWalletInput] = useState('');
  const [editingWallet, setEditingWallet] = useState(false);

  const [positions, setPositions] = useState([]);
  const [simPositions, setSimPositions] = useState(null);
  const [simDrop, setSimDrop] = useState(0);
  const [logs, setLogs] = useState([]);
  const [auditEntries, setAuditEntries] = useState([]);
  const [nearPrice, setNearPrice] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [tab, setTab] = useState('positions'); // 'positions' | 'heatmap' | 'audit'
  const [scanCount, setScanCount] = useState(0);

  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  // Positions to display (simulated or real)
  const displayPositions = simPositions || positions;

  // Simulation handler
  const handleSimulate = useCallback((simulated, pct) => {
    setSimPositions(simulated);
    setSimDrop(pct);
  }, []);

  // Fetch NEAR price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const r = await fetch(`${API}/api/price`);
        if (r.ok) { const d = await r.json(); setNearPrice(d.near_price_usd ?? d.price); }
      } catch (e) {}
    };
    fetchPrice();
    const t = setInterval(fetchPrice, 60000);
    return () => clearInterval(t);
  }, []);

  // Fetch audit history
  const fetchHistory = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/history`);
      if (r.ok) { const d = await r.json(); setAuditEntries(d.history || []); }
    } catch (e) {}
  }, []);

  useEffect(() => { if (launched) fetchHistory(); }, [launched, fetchHistory]);

  // WebSocket
  const connectWS = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(WS);
    wsRef.current = ws;

    ws.onopen = () => {
      setLogs(prev => [...prev.slice(-199), 'WebSocket connected to RiskSentinel backend']);
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);

        if (msg.type === 'scan_start') {
          setIsScanning(true);
          setSimPositions(null);
          setSimDrop(0);
          setLogs(prev => [...prev.slice(-199), `Scan started for ${msg.wallet || wallet}`]);
        }

        if (msg.type === 'log') {
          setLogs(prev => [...prev.slice(-199), msg.message]);
        }

        if (msg.type === 'status') {
          setLogs(prev => [...prev.slice(-199), msg.message]);
        }

        if (msg.type === 'result') {
          setIsScanning(false);
          setLastScan(new Date());
          setScanCount(c => c + 1);

          // Pipeline returns { data: { positions, risk_scores, agent_log, audit_entries }, audit_history }
          const result = msg.data || {};
          const rawPositions = result.positions || [];
          const rawRisks = result.risk_scores || [];
          const agentLogs = result.agent_log || [];

          // Merge risk scores into position objects for PositionCard
          const merged = rawPositions.map((p, i) => ({ ...p, risk_score: rawRisks[i] || {} }));
          setPositions(merged);
          setSimPositions(null);
          setSimDrop(0);

          // Add agent logs to terminal
          if (agentLogs.length > 0) {
            setLogs(prev => [...prev, ...agentLogs].slice(-200));
          }

          // Normalize and store audit history
          if (msg.audit_history) {
            setAuditEntries(msg.audit_history.map(normalizeAuditEntry));
          }

          // Log Filecoin CIDs
          const entries = result.audit_entries || [];
          entries.forEach(e => {
            if (e.storacha_cid) {
              setLogs(prev => [...prev.slice(-199), `Audit uploaded to Filecoin: ${e.storacha_cid}`]);
            }
          });
        }

        if (msg.type === 'price_update') {
          setNearPrice(msg.near_price_usd ?? msg.price);
        }

        if (msg.type === 'audit_history') {
          setAuditEntries((msg.entries || []).map(normalizeAuditEntry));
        }
      } catch (e) {}
    };

    ws.onerror = () => {
      setLogs(prev => [...prev.slice(-199), 'WebSocket error — retrying...']);
    };

    ws.onclose = () => {
      setIsScanning(false);
      reconnectRef.current = setTimeout(connectWS, 3000);
    };
  }, [wallet]);

  useEffect(() => {
    if (!launched) return;
    connectWS();
    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [launched, connectWS]);

  const triggerScan = async () => {
    try {
      setIsScanning(true);
      setLogs(prev => [...prev.slice(-199), `Manual scan triggered for ${wallet}`]);
      await fetch(`${API}/api/scan?wallet_id=${encodeURIComponent(wallet)}`, { method: 'POST' });
    } catch (e) {
      setIsScanning(false);
      setLogs(prev => [...prev.slice(-199), 'Scan request failed — is backend running?']);
    }
  };

  const handleLaunch = (w) => {
    setWallet(w);
    setLaunched(true);
  };

  if (!launched) {
    return <LandingScreen onLaunch={handleLaunch} />;
  }

  // Stats (use displayPositions for live sim feedback)
  const criticalCount = displayPositions.filter(p => p.risk_score?.level === 'critical').length;
  const highCount = displayPositions.filter(p => p.risk_score?.level === 'high').length;
  const avgScore = displayPositions.length > 0
    ? (displayPositions.reduce((s, p) => s + (p.risk_score?.score || 0), 0) / displayPositions.length * 100).toFixed(0)
    : '—';

  const statsData = [
    { label: 'WALLET', value: wallet.length > 14 ? wallet.slice(0, 12) + '…' : wallet, sub: 'NEAR testnet', color: '#00d4ff' },
    { label: 'RISK SCORE', value: avgScore !== '—' ? `${avgScore}%` : '—', sub: 'avg across positions', color: avgScore > 70 ? '#ef4444' : avgScore > 40 ? '#f59e0b' : '#10b981' },
    { label: 'POSITIONS', value: displayPositions.length, sub: `${criticalCount} critical · ${highCount} high`, color: criticalCount > 0 ? '#ef4444' : '#00d4ff' },
    { label: 'SCANS', value: scanCount, sub: lastScan ? `last: ${lastScan.toLocaleTimeString()}` : 'none yet', color: '#a78bfa' },
  ];

  const TABS = [
    { id: 'positions', label: `Positions (${displayPositions.length})` },
    { id: 'heatmap',   label: 'Heatmap' },
    { id: 'audit',     label: `Audit Trail (${auditEntries.length})` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: '#e2e8f0' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '56px',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        background: 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '16px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{ fontSize: '22px' }}>🛡️</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '15px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#fff',
          }}>
            Risk<span style={{ color: '#00d4ff' }}>Sentinel</span>
          </span>
        </div>

        {/* Wallet bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          flex: 1,
          maxWidth: '360px',
          borderRadius: '6px',
          border: '1px solid rgba(0,212,255,0.18)',
          overflow: 'hidden',
        }}>
          <span style={{
            padding: '6px 10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: '#00d4ff',
            background: 'rgba(0,212,255,0.07)',
            borderRight: '1px solid rgba(0,212,255,0.15)',
            whiteSpace: 'nowrap',
          }}>wallet://</span>
          {editingWallet ? (
            <input
              autoFocus
              value={walletInput}
              onChange={e => setWalletInput(e.target.value)}
              onBlur={() => { setEditingWallet(false); if (walletInput.trim()) setWallet(walletInput.trim()); }}
              onKeyDown={e => {
                if (e.key === 'Enter') { setEditingWallet(false); if (walletInput.trim()) setWallet(walletInput.trim()); }
                if (e.key === 'Escape') setEditingWallet(false);
              }}
              style={{
                flex: 1,
                padding: '6px 10px',
                background: '#0d1529',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#e2e8f0',
              }}
            />
          ) : (
            <button
              onClick={() => { setWalletInput(wallet); setEditingWallet(true); }}
              style={{
                flex: 1,
                padding: '6px 10px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#e2e8f0',
                textAlign: 'left',
                cursor: 'text',
              }}
            >{wallet}</button>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <NearPriceTicker price={nearPrice} />
          <button
            onClick={triggerScan}
            disabled={isScanning}
            style={{
              padding: '7px 18px',
              background: isScanning ? 'rgba(0,212,255,0.1)' : 'var(--cyan)',
              color: isScanning ? '#00d4ff' : '#0a0f1e',
              border: `1px solid ${isScanning ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isScanning ? 'not-allowed' : 'pointer',
              letterSpacing: '0.06em',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}
          >
            {isScanning ? (
              <>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00d4ff', display: 'inline-block', animation: 'pulse-dot 1s infinite' }} />
                SCANNING
              </>
            ) : '⚡ SCAN'}
          </button>
        </div>
      </nav>

      {/* Simulation banner */}
      {simDrop > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.08)',
          borderBottom: '1px solid rgba(245,158,11,0.25)',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
        }}>
          <span style={{ color: '#f59e0b', fontWeight: 700 }}>⚠ SIMULATION MODE</span>
          <span style={{ color: '#94a3b8' }}>Showing results for a</span>
          <span style={{ color: '#f59e0b', fontWeight: 600 }}>{simDrop}% NEAR price drop</span>
          <span style={{ color: '#94a3b8' }}>— live positions not affected</span>
          <button
            onClick={() => { setSimPositions(null); setSimDrop(0); }}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '4px',
              padding: '3px 10px',
              color: '#f59e0b',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >✕ RESET</button>
        </div>
      )}

      {/* Main content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>
        {/* Stats bar */}
        <StatBar stats={statsData} />

        {/* Agent Pipeline visualization */}
        <AgentPipeline scanning={isScanning} logs={logs} />

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '2px',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(0,212,255,0.1)',
          paddingBottom: '1px',
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 20px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? '#00d4ff' : '#4a5568',
              cursor: 'pointer',
              borderBottom: tab === t.id ? '2px solid #00d4ff' : '2px solid transparent',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transition: 'color 0.2s',
              marginBottom: '-1px',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>
          {/* Left — Positions / Heatmap / Audit */}
          <div>
            {tab === 'positions' && (
              <>
                {/* Simulation slider */}
                {positions.length > 0 && (
                  <SimulationSlider positions={positions} onSimulate={handleSimulate} />
                )}

                {displayPositions.length === 0 ? (
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(0,212,255,0.08)',
                    borderRadius: '10px',
                    padding: '60px 28px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: '#2d3748',
                  }}>
                    No positions loaded. Click <span style={{ color: '#00d4ff' }}>⚡ SCAN</span> to start the agent pipeline.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {displayPositions.map((pos, i) => (
                      <PositionCard key={i} position={pos} index={i} />
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'heatmap' && (
              <RiskHeatmap positions={displayPositions} />
            )}

            {tab === 'audit' && <AuditTrail entries={auditEntries} />}
          </div>

          {/* Right — Agent Terminal */}
          <div style={{ position: 'sticky', top: '76px', height: 'calc(100vh - 120px)' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#4a5568',
              marginBottom: '8px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>Agent Log</div>
            <AgentTerminal logs={logs} isScanning={isScanning} />
          </div>
        </div>
      </main>
    </div>
  );
}
