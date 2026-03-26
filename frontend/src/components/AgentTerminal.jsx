import { useEffect, useRef } from 'react';

const LOG_COLORS = {
  monitor: '#00d4ff',
  risk: '#f59e0b',
  action: '#10b981',
  error: '#ef4444',
  info: '#8899aa',
  system: '#a78bfa',
};

function getLogColor(message) {
  const msg = (message || '').toLowerCase();
  if (msg.includes('error') || msg.includes('fail')) return LOG_COLORS.error;
  if (msg.includes('monitor') || msg.includes('fetching') || msg.includes('scanning')) return LOG_COLORS.monitor;
  if (msg.includes('risk') || msg.includes('groq') || msg.includes('llm') || msg.includes('score')) return LOG_COLORS.risk;
  if (msg.includes('action') || msg.includes('swap') || msg.includes('protect') || msg.includes('storacha') || msg.includes('upload') || msg.includes('cid')) return LOG_COLORS.action;
  if (msg.includes('lit') || msg.includes('sign') || msg.includes('ecdsa')) return LOG_COLORS.system;
  return LOG_COLORS.info;
}

function getPrefix(message) {
  const msg = (message || '').toLowerCase();
  if (msg.includes('monitor') || msg.includes('fetching') || msg.includes('scanning')) return '[MONITOR]';
  if (msg.includes('risk') || msg.includes('groq') || msg.includes('score')) return '[RISK]';
  if (msg.includes('action') || msg.includes('swap') || msg.includes('protect')) return '[ACTION]';
  if (msg.includes('storacha') || msg.includes('upload') || msg.includes('cid')) return '[STORACHA]';
  if (msg.includes('lit') || msg.includes('sign')) return '[LIT]';
  if (msg.includes('error') || msg.includes('fail')) return '[ERROR]';
  return '[SYS]';
}

export default function AgentTerminal({ logs = [], isScanning = false }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false });

  return (
    <div style={{
      background: '#060b18',
      borderRadius: '10px',
      border: '1px solid rgba(0,212,255,0.12)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '320px',
    }}>
      {/* macOS-style title bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        borderBottom: '1px solid rgba(0,212,255,0.08)',
        background: '#0a0f1e',
      }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
        <span style={{
          marginLeft: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: '#4a5568',
          letterSpacing: '0.1em',
          flex: 1,
        }}>risk-sentinel — agent-log</span>
        {isScanning && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#10b981',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#10b981',
              display: 'inline-block', animation: 'pulse-dot 1.5s infinite',
            }} />
            LIVE
          </span>
        )}
      </div>

      {/* Log output */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        lineHeight: '1.7',
      }}>
        {logs.length === 0 ? (
          <div style={{ color: '#2d3748', textAlign: 'center', paddingTop: '40px' }}>
            waiting for agent activity...
            <span style={{ animation: 'blink 1s step-end infinite' }}>█</span>
          </div>
        ) : (
          logs.map((log, i) => {
            const color = getLogColor(log);
            const prefix = getPrefix(log);
            return (
              <div key={i} style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '2px',
                animation: i === logs.length - 1 ? 'slide-in 0.3s ease-out' : 'none',
              }}>
                <span style={{ color: '#2d3748', whiteSpace: 'nowrap', flexShrink: 0 }}>{timeStr}</span>
                <span style={{ color, whiteSpace: 'nowrap', flexShrink: 0, opacity: 0.85 }}>{prefix}</span>
                <span style={{ color: '#cbd5e0', wordBreak: 'break-word' }}>{log}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
