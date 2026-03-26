export default function StatBar({ stats }) {
  // stats: [{ label, value, sub, color? }]
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1px',
      background: 'rgba(0,212,255,0.08)',
      border: '1px solid rgba(0,212,255,0.12)',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '20px',
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: 'var(--bg-card)',
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: '#4a5568',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>{s.label}</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '22px',
            fontWeight: 700,
            color: s.color || '#00d4ff',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>{s.value}</span>
          {s.sub && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#4a5568',
            }}>{s.sub}</span>
          )}
        </div>
      ))}
    </div>
  );
}
