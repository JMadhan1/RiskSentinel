// Accepts merged positions (risk_score embedded in each position)
const LEVEL_COLORS = {
  critical: { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  text: '#ef4444', glow: '0 0 20px rgba(239,68,68,0.2)' },
  high:     { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#f59e0b', glow: '0 0 20px rgba(245,158,11,0.15)' },
  medium:   { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)', text: '#fbbf24', glow: 'none' },
  low:      { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)', text: '#10b981', glow: 'none' },
  unknown:  { bg: 'rgba(136,153,170,0.05)', border: 'rgba(136,153,170,0.15)', text: '#8899aa', glow: 'none' },
};

export function RiskHeatmap({ positions }) {
  if (!positions?.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-dim)',
        borderRadius: '10px',
        padding: '60px 28px',
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        color: '#2d3748',
      }}>
        No positions loaded. Click ⚡ SCAN to generate heatmap.
      </div>
    );
  }

  const totalValue = positions.reduce((s, p) => s + (p.value_usd || 0), 0);
  const risks = positions.map(p => p.risk_score || {});
  const avgRisk = risks.length
    ? Math.round(risks.reduce((s, r) => s + (r.score || 0), 0) / risks.length * 100)
    : 0;
  const atRiskCount = risks.filter(r => r.level === 'critical' || r.level === 'high').length;

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'PORTFOLIO VALUE', value: `$${Number(totalValue).toLocaleString()}`, color: 'var(--cyan)' },
          { label: 'AVG RISK SCORE', value: `${avgRisk}/100`, color: avgRisk > 70 ? '#ef4444' : avgRisk > 40 ? '#f59e0b' : '#10b981' },
          { label: 'POSITIONS AT RISK', value: `${atRiskCount}/${positions.length}`, color: atRiskCount > 0 ? '#f59e0b' : '#10b981' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Heatmap label */}
      <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '12px' }}>
        POSITION RISK HEATMAP
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {positions.map((pos, i) => {
          const risk = risks[i];
          const level = (risk.level || 'unknown').toLowerCase();
          const cfg = LEVEL_COLORS[level] || LEVEL_COLORS.unknown;
          const pct = Math.round((risk.score || 0) * 100);
          const ratio = pos.collateral_ratio || 0;
          const threshold = pos.liquidation_threshold || 1.2;
          const buffer = Math.max(0, ((ratio - threshold) / threshold * 100)).toFixed(1);

          return (
            <div key={i} style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderRadius: '12px',
              padding: '16px',
              boxShadow: cfg.glow,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {pos.asset || pos.protocol}
                  </div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {pos.protocol}
                  </div>
                </div>
                <div style={{
                  fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-mono)',
                  color: cfg.text, background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  padding: '3px 8px', borderRadius: '4px', height: 'fit-content',
                }}>
                  {level.toUpperCase()}
                </div>
              </div>

              {/* Risk bar */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>RISK</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: cfg.text }}>{pct}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: cfg.text, borderRadius: '3px',
                    boxShadow: pct > 70 ? `0 0 8px ${cfg.text}` : 'none',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { label: 'VALUE', value: `$${Number(pos.value_usd || 0).toLocaleString()}` },
                  { label: 'BUFFER', value: `${buffer}%`, color: parseFloat(buffer) < 5 ? '#ef4444' : parseFloat(buffer) < 15 ? '#f59e0b' : '#10b981' },
                ].map((m, j) => (
                  <div key={j} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '6px 8px' }}>
                    <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '2px' }}>{m.label}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: m.color || 'var(--text-primary)' }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {['critical', 'high', 'medium', 'low'].map(lvl => (
          <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: LEVEL_COLORS[lvl].text, opacity: 0.7 }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{lvl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
