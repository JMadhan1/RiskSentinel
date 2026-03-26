import { useState, useEffect, useRef } from 'react';

export default function NearPriceTicker({ price }) {
  const prevPrice = useRef(null);
  const [direction, setDirection] = useState(null); // 'up' | 'down' | null
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (price == null) return;
    if (prevPrice.current !== null && price !== prevPrice.current) {
      setDirection(price > prevPrice.current ? 'up' : 'down');
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
    }
    prevPrice.current = price;
  }, [price]);

  const color = direction === 'up' ? '#10b981' : direction === 'down' ? '#ef4444' : '#00d4ff';
  const arrow = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '◆';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      padding: '4px 12px',
      borderRadius: '6px',
      border: `1px solid ${flash ? color : 'rgba(0,212,255,0.2)'}`,
      background: flash
        ? `${color}18`
        : 'rgba(0,212,255,0.05)',
      transition: 'all 0.3s ease',
      cursor: 'default',
      userSelect: 'none',
    }}>
      <span style={{ color: '#8899aa', fontSize: '11px', letterSpacing: '0.05em' }}>NEAR/USD</span>
      <span style={{ color: flash ? color : '#00d4ff', fontWeight: 700, transition: 'color 0.3s' }}>
        ${price != null ? price.toFixed(4) : '—'}
      </span>
      <span style={{ color, fontSize: '10px', transition: 'color 0.3s' }}>{arrow}</span>
    </div>
  );
}
