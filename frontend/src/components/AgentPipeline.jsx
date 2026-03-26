import { useState, useEffect } from 'react';

const AGENTS = [
  { id: 'monitor',  label: 'MONITOR',      icon: '👁',  desc: 'Fetching on-chain positions' },
  { id: 'analyst',  label: 'RISK ANALYST', icon: '🧠', desc: 'Scoring collateral risk' },
  { id: 'action',   label: 'ACTION AGENT', icon: '⚡', desc: 'Executing protective moves' },
];

export function AgentPipeline({ scanning, logs }) {
  const [activeIdx, setActiveIdx] = useState(-1);
  const [doneIdx, setDoneIdx] = useState(-1);

  useEffect(() => {
    if (!scanning) {
      setActiveIdx(-1);
      setDoneIdx(-1);
      return;
    }
    setActiveIdx(0);
    setDoneIdx(-1);
    const timers = [];
    timers.push(setTimeout(() => { setDoneIdx(0); setActiveIdx(1); }, 1200));
    timers.push(setTimeout(() => { setDoneIdx(1); setActiveIdx(2); }, 2600));
    timers.push(setTimeout(() => { setDoneIdx(2); setActiveIdx(-1); }, 4000));
    return () => timers.forEach(clearTimeout);
  }, [scanning]);

  const statusLine = (() => {
    if (!scanning && doneIdx === 2) return '✓ Pipeline complete';
    if (activeIdx >= 0) return `Running: ${AGENTS[activeIdx].desc}…`;
    if (logs?.length) return logs[logs.length - 1];
    return 'Idle — press ⚡ SCAN to start';
  })();

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-dim)',
      borderRadius: '10px',
      padding: '16px 20px',
      marginBottom: '16px',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '14px' }}>
        AGENT PIPELINE
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        {AGENTS.map((agent, i) => {
          const isActive = activeIdx === i;
          const isDone = doneIdx >= i;
          const color = isDone ? '#10b981' : isActive ? '#00d4ff' : 'var(--text-muted)';

          return (
            <div key={agent.id} style={{ display: 'flex', alignItems: 'center', flex: i < AGENTS.length - 1 ? '1' : 'none' }}>
              {/* Node */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                minWidth: '80px',
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: `2px solid ${color}`,
                  background: isActive ? `${color}15` : isDone ? 'rgba(16,185,129,0.08)' : 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  boxShadow: isActive ? `0 0 16px ${color}40` : 'none',
                  transition: 'all 0.4s ease',
                  position: 'relative',
                }}>
                  {agent.icon}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      inset: '-4px',
                      borderRadius: '50%',
                      border: `1px solid ${color}60`,
                      animation: 'pulse-dot 1s ease-in-out infinite',
                    }} />
                  )}
                </div>
                <div style={{ fontSize: '9px', color, letterSpacing: '0.06em', textAlign: 'center' }}>
                  {agent.label}
                </div>
                <div style={{ fontSize: '9px', color: isDone ? '#10b981' : 'var(--text-muted)', letterSpacing: '0.04em' }}>
                  {isDone ? '✓ done' : isActive ? '● active' : '○ wait'}
                </div>
              </div>

              {/* Connector line */}
              {i < AGENTS.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  background: doneIdx >= i ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.06)',
                  position: 'relative',
                  margin: '0 4px',
                  marginTop: '-20px',
                  overflow: 'hidden',
                  transition: 'background 0.4s ease',
                }}>
                  {(isActive || (scanning && activeIdx === i + 1 && doneIdx < i + 1)) && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#00d4ff',
                      boxShadow: '0 0 8px #00d4ff',
                      animation: 'travel-dot 1.2s linear infinite',
                    }} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status line */}
      <div style={{
        marginTop: '14px',
        fontSize: '11px',
        color: scanning ? '#00d4ff' : doneIdx === 2 ? '#10b981' : 'var(--text-muted)',
        letterSpacing: '0.04em',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        {scanning && (
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#00d4ff', animation: 'pulse-dot 0.8s ease-in-out infinite' }} />
        )}
        {statusLine}
      </div>
    </div>
  );
}
