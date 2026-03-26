import { useState, useCallback } from 'react';

// Accepts merged positions (with risk_score embedded), calls onSimulate(simPositions, drop)
export function SimulationSlider({ positions, onSimulate }) {
  const [drop, setDrop] = useState(0);
  const [active, setActive] = useState(false);

  const simulate = useCallback((pct) => {
    if (!positions?.length) return;
    const factor = 1 - pct / 100;
    const simPositions = positions.map(p => {
      const simPos = {
        ...p,
        collateral_ratio: p.collateral_ratio != null
          ? parseFloat((p.collateral_ratio * factor).toFixed(3))
          : null,
        value_usd: p.value_usd != null
          ? parseFloat((p.value_usd * factor).toFixed(2))
          : null,
      };
      const ratio = simPos.collateral_ratio || 2.0;
      const threshold = simPos.liquidation_threshold || 1.2;
      const gap = ratio - threshold;
      let level, score, action;
      if (gap <= 0)        { level = 'critical'; score = 1.0;  action = 'move_to_stablecoin'; }
      else if (gap < 0.05) { level = 'critical'; score = 0.95; action = 'move_to_stablecoin'; }
      else if (gap < 0.15) { level = 'high';     score = 0.75; action = 'reduce_position'; }
      else if (gap < 0.40) { level = 'medium';   score = 0.45; action = 'hold'; }
      else                  { level = 'low';      score = 0.15; action = 'hold'; }

      return {
        ...simPos,
        risk_score: {
          ...(p.risk_score || {}),
          level, score,
          recommended_action: action,
          reasons: [
            `Simulated collateral ratio ${ratio.toFixed(2)} vs threshold ${threshold.toFixed(2)}`,
            gap <= 0 ? 'LIQUIDATION THRESHOLD BREACHED' : `Buffer: ${(gap * 100).toFixed(1)}%`,
          ],
        },
      };
    });
    onSimulate(simPositions, pct);
  }, [positions, onSimulate]);

  const handleChange = (e) => {
    const val = Number(e.target.value);
    setDrop(val);
    setActive(val > 0);
    simulate(val);
  };

  const handleReset = () => {
    setDrop(0);
    setActive(false);
    onSimulate(null, 0);
  };

  const getColor = () => {
    if (drop >= 20) return '#ef4444';
    if (drop >= 10) return '#f59e0b';
    if (drop >= 5)  return '#fbbf24';
    return '#10b981';
  };

  return (
    <div style={{
      background: active ? 'rgba(239,68,68,0.05)' : 'var(--bg-card)',
      border: `1px solid ${active ? 'rgba(239,68,68,0.25)' : 'var(--border-dim)'}`,
      borderRadius: '12px',
      padding: '16px 20px',
      marginBottom: '16px',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: active ? '#ef4444' : 'var(--text-muted)',
            letterSpacing: '0.1em',
            marginBottom: '2px',
          }}>
            {active ? '⚡ SIMULATION MODE ACTIVE' : 'PRICE DROP SIMULATOR'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Drag to simulate NEAR price drop and see live risk impact
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: getColor(),
            minWidth: '64px',
            textAlign: 'right',
            transition: 'color 0.2s',
          }}>
            -{drop}%
          </div>
          {active && (
            <button onClick={handleReset} style={{
              background: 'transparent',
              border: '1px solid var(--border-normal)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}>RESET</button>
          )}
        </div>
      </div>

      <input
        type="range" min="0" max="50" step="1" value={drop}
        onChange={handleChange}
        style={{ width: '100%', accentColor: getColor() }}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '6px',
        fontSize: '10px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
      }}>
        <span>0% (live)</span>
        <span style={{ color: '#f59e0b' }}>10% HIGH</span>
        <span style={{ color: '#ef4444' }}>20% CRITICAL</span>
        <span style={{ color: '#ef4444' }}>50% LIQUIDATED</span>
      </div>

      {active && drop >= 10 && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: '#ef4444',
        }}>
          ⚠ At -{drop}% price drop, {
            drop >= 30 ? 'ALL positions' :
            drop >= 20 ? '2 positions' : '1 position'
          } would face liquidation. RiskSentinel would autonomously execute protective actions.
        </div>
      )}
    </div>
  );
}
