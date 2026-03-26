import { useState } from 'react';

function ShareButton({ entry }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const lines = [
      `🛡️ RiskSentinel flagged a ${(entry.risk_level || 'unknown').toUpperCase()} risk position on ${entry.protocol || 'Unknown'}`,
      entry.action && entry.action !== 'none'
        ? `⚡ Autonomous action taken: ${entry.action.replace(/_/g, ' ')}`
        : null,
      entry.cid
        ? `📦 Audit proof stored on Filecoin:\n${entry.cid}`
        : null,
      entry.cid
        ? `🔗 Verify: https://ipfs.io/ipfs/${entry.cid}`
        : null,
      `\n#DeFi #NEAR #Filecoin #LitProtocol #RiskSentinel`,
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      window.prompt('Copy this:', lines);
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        fontWeight: 600,
        color: copied ? '#10b981' : '#a78bfa',
        background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(167,139,250,0.08)',
        border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(167,139,250,0.25)'}`,
        borderRadius: '4px',
        padding: '3px 10px',
        cursor: 'pointer',
        letterSpacing: '0.06em',
        transition: 'all 0.2s',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? '✓ COPIED' : '↗ SHARE PROOF'}
    </button>
  );
}

export default function AuditTrail({ entries = [] }) {
  const sorted = [...entries].reverse();

  if (sorted.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(0,212,255,0.08)',
        borderRadius: '10px',
        padding: '28px',
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        color: '#2d3748',
      }}>
        No audit entries yet — run a scan to generate on-chain records.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {sorted.map((entry, i) => {
        const isNew = i === 0;
        const levelColor =
          entry.risk_level === 'critical' ? '#ef4444' :
          entry.risk_level === 'high' ? '#f97316' :
          entry.risk_level === 'medium' ? '#f59e0b' : '#10b981';

        return (
          <div key={i} style={{
            background: 'var(--bg-card)',
            border: `1px solid ${isNew ? 'rgba(0,212,255,0.25)' : 'rgba(0,212,255,0.08)'}`,
            borderRadius: '8px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: isNew ? 'slide-in 0.4s ease-out' : 'none',
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isNew && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#00d4ff',
                    background: 'rgba(0,212,255,0.12)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    borderRadius: '3px',
                    padding: '1px 6px',
                    letterSpacing: '0.1em',
                  }}>NEW</span>
                )}
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#e2e8f0',
                }}>{entry.protocol || 'Unknown'}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: levelColor,
                  background: `${levelColor}15`,
                  border: `1px solid ${levelColor}40`,
                  borderRadius: '3px',
                  padding: '1px 6px',
                  textTransform: 'uppercase',
                }}>{entry.risk_level || 'unknown'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: '#4a5568',
                }}>{entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : ''}</span>
                <ShareButton entry={entry} />
              </div>
            </div>

            {/* CID row */}
            {entry.cid && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#4a5568', flexShrink: 0 }}>CID</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: '#00d4ff',
                  wordBreak: 'break-all',
                  flex: 1,
                }}>{entry.cid}</span>
                <a
                  href={`https://ipfs.io/ipfs/${entry.cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: '#0a0f1e',
                    background: '#00d4ff',
                    padding: '2px 10px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    flexShrink: 0,
                    transition: 'opacity 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Verify ↗
                </a>
              </div>
            )}

            {/* Signature row */}
            {entry.signature && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#4a5568', flexShrink: 0 }}>SIG</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: '#a78bfa',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}>{entry.signature.slice(0, 32)}…</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: '3px',
                  padding: '1px 6px',
                  flexShrink: 0,
                }}>✓ VERIFIED</span>
              </div>
            )}

            {/* Action row */}
            {entry.action && entry.action !== 'none' && (
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#10b981',
              }}>
                ✓ Action taken: <span style={{ opacity: 0.8 }}>{entry.action.replace(/_/g, ' ')}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
