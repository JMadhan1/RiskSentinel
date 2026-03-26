import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LEVEL_CONFIG = {
  low:      { color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)',  label: 'LOW',      barWidth: '20%' },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)',  label: 'MEDIUM',   barWidth: '55%' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.3)',   label: 'HIGH',     barWidth: '80%' },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.35)',   label: 'CRITICAL', barWidth: '100%' },
  unknown:  { color: '#8899aa', bg: 'rgba(136,153,170,0.05)', border: 'rgba(136,153,170,0.15)', label: 'UNKNOWN',  barWidth: '0%' },
};

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function PositionCard({ position, index }) {
  const risk = position.risk_score || {};
  const level = (risk.level || 'unknown').toLowerCase();
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.unknown;
  const isAtRisk = level === 'critical' || level === 'high';

  const [seconds, setSeconds] = useState(0);
  const [hasCountdown, setHasCountdown] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);

  // Fetch countdown from API
  useEffect(() => {
    if (!isAtRisk) return;
    const fetchCountdown = async () => {
      try {
        const resp = await fetch(`${API}/api/countdown`);
        if (resp.ok) {
          const data = await resp.json();
          const entry = (data.countdowns || [])[index];
          if (entry?.hours_to_liquidation != null && entry.hours_to_liquidation > 0) {
            setSeconds(Math.round(entry.hours_to_liquidation * 3600));
            setHasCountdown(true);
            return;
          }
        }
      } catch (e) { /* fall through to local estimate */ }

      // Local estimate from collateral data
      const ratio = position.collateral_ratio || 0;
      const threshold = position.liquidation_threshold || 1.2;
      const gap = ratio - threshold;
      if (gap > 0 && gap < 0.5) {
        const estimatedHours = gap / (ratio * (level === 'critical' ? 0.02 : 0.015));
        setSeconds(Math.round(estimatedHours * 3600));
        setHasCountdown(true);
      }
    };

    fetchCountdown();
    const pollInterval = setInterval(fetchCountdown, 30000);
    return () => clearInterval(pollInterval);
  }, [index, isAtRisk, level, position.collateral_ratio, position.liquidation_threshold]);

  // Live tick
  useEffect(() => {
    if (!hasCountdown || seconds <= 0) return;
    const tick = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(tick);
  }, [hasCountdown, seconds]);

  const colRatio = position.collateral_ratio ? (position.collateral_ratio * 100).toFixed(1) : null;
  const score = risk.score != null ? (risk.score * 100).toFixed(0) : null;

  return (
    <div
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: '10px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        animation: `slide-in 0.4s ease-out ${index * 0.08}s both`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 32px ${cfg.color}20`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.02em' }}>
            {position.protocol || 'Unknown Protocol'}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#4a5568', marginTop: '2px' }}>
            {position.type || 'position'} · {position.asset || ''}
          </div>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 700,
          color: cfg.color,
          background: `${cfg.color}15`,
          border: `1px solid ${cfg.color}40`,
          borderRadius: '4px',
          padding: '2px 8px',
          letterSpacing: '0.08em',
          flexShrink: 0,
        }}>{cfg.label}</span>
      </div>

      {/* Risk bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#4a5568' }}>RISK SCORE</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: cfg.color }}>{score ?? '—'}/100</span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: cfg.barWidth,
            background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`,
            borderRadius: '2px',
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
      </div>

      {/* Live Countdown */}
      {isAtRisk && hasCountdown && seconds > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: level === 'critical' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${level === 'critical' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
          borderRadius: '8px',
          padding: '10px 14px',
        }}>
          <span style={{ fontSize: '16px', animation: 'pulse-red 1s ease-in-out infinite' }}>⚠</span>
          <div>
            <div style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              marginBottom: '2px',
            }}>EST. LIQUIDATION IN</div>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em',
              color: level === 'critical' ? '#ef4444' : '#f59e0b',
              animation: 'count-tick 0.3s ease',
            }}>
              {formatTime(seconds)}
            </div>
          </div>
        </div>
      )}

      {/* Collateral row */}
      {colRatio && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
        }}>
          <span style={{ color: '#4a5568' }}>Collateral Ratio</span>
          <span style={{ color: parseFloat(colRatio) < 120 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
            {colRatio}%
          </span>
        </div>
      )}

      {/* Value */}
      {position.value_usd != null && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          <span style={{ color: '#4a5568' }}>Position Value</span>
          <span style={{ color: '#e2e8f0' }}>${position.value_usd.toLocaleString()}</span>
        </div>
      )}

      {/* Reasons */}
      {risk.reasons && risk.reasons.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {risk.reasons.slice(0, 2).map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#718096' }}>
              <span style={{ color: cfg.color, flexShrink: 0 }}>›</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}

      {/* AI Reasoning toggle */}
      {(isAtRisk || risk.full_reasoning) && (
        <div style={{ marginTop: '4px' }}>
          <button
            onClick={() => setReasoningOpen(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 0',
              width: '100%',
            }}
          >
            <span style={{
              fontSize: '10px',
              color: reasoningOpen ? '#00d4ff' : '#475569',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              transition: 'color 0.2s',
            }}>
              {reasoningOpen ? '▼' : '▶'} AI REASONING
            </span>
            <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
              {reasoningOpen ? 'HIDE ▲' : 'SHOW ▼'}
            </span>
          </button>

          {reasoningOpen && (
            <div style={{
              marginTop: '8px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(0,212,255,0.15)',
              borderRadius: '8px',
              padding: '14px 16px',
              animation: 'slide-in 0.2s ease',
            }}>
              {risk.full_reasoning ? (
                <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
                  {risk.full_reasoning}
                </p>
              ) : (
                <div>
                  <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#94a3b8', lineHeight: 1.7, marginBottom: '10px' }}>
                    {level === 'critical'
                      ? `This position is at critical risk. The collateral ratio (${position.collateral_ratio?.toFixed(2)}) is dangerously close to the liquidation threshold (${position.liquidation_threshold?.toFixed(2)}). A ${((position.collateral_ratio - position.liquidation_threshold) / position.collateral_ratio * 100).toFixed(1)}% price drop would trigger immediate liquidation.`
                      : level === 'high'
                      ? `This position carries high risk. The collateral ratio of ${position.collateral_ratio?.toFixed(2)} provides limited buffer above the ${position.liquidation_threshold?.toFixed(2)} liquidation threshold. Market volatility could close this gap rapidly.`
                      : `This position is within acceptable risk parameters. The collateral ratio of ${position.collateral_ratio?.toFixed(2)} provides sufficient buffer above the ${position.liquidation_threshold?.toFixed(2)} liquidation threshold.`
                    }
                  </p>
                  {risk.reasons && risk.reasons.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(0,212,255,0.08)', paddingTop: '10px' }}>
                      <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#475569', letterSpacing: '0.08em', marginBottom: '6px' }}>
                        DECISION FACTORS
                      </div>
                      {risk.reasons.map((r, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94a3b8', marginBottom: '4px' }}>
                          <span style={{ color: '#00d4ff', flexShrink: 0 }}>›</span>
                          {r}
                        </div>
                      ))}
                    </div>
                  )}
                  {risk.recommended_action && (
                    <div style={{ borderTop: '1px solid rgba(0,212,255,0.08)', paddingTop: '10px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#475569', letterSpacing: '0.08em' }}>
                        RECOMMENDED ACTION
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: '#00d4ff',
                        background: 'rgba(0,212,255,0.1)',
                        border: '1px solid rgba(0,212,255,0.3)',
                        padding: '3px 10px',
                        borderRadius: '4px',
                      }}>
                        {risk.recommended_action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action taken */}
      {risk.action && risk.action !== 'none' && (
        <div style={{
          padding: '8px 12px',
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>✓</span>
          <span style={{ textTransform: 'capitalize' }}>Action: {risk.action.replace(/_/g, ' ')}</span>
        </div>
      )}
    </div>
  );
}
