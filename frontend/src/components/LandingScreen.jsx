import { useState, useEffect } from 'react';

const NEAR_WALLET_URL = 'https://testnet.mynearwallet.com';
const SENDER_EXTENSION_URL = 'https://chrome.google.com/webstore/detail/sender-wallet/epapihdplajcdnnkdeiahlgigofloibg';

export default function LandingScreen({ onLaunch }) {
  const [wallet, setWallet] = useState('madhanj.testnet');
  const [hovered, setHovered] = useState(false);
  const [connectHovered, setConnectHovered] = useState(false);
  const [hasExtension, setHasExtension] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Check for NEAR wallet extension and handle redirect-back
  useEffect(() => {
    // Check if Sender or NEAR extension is available
    if (typeof window !== 'undefined' && (window.near || window.sender)) {
      setHasExtension(true);
    }
    // Handle redirect back from MyNearWallet (account_id in URL params)
    const params = new URLSearchParams(window.location.search);
    const accountId = params.get('account_id');
    if (accountId) {
      window.history.replaceState({}, '', window.location.pathname);
      onLaunch(accountId);
    }
  }, [onLaunch]);

  const handleConnectExtension = async () => {
    setConnecting(true);
    try {
      const near = window.near || window.sender;
      if (near?.requestSignIn) {
        await near.requestSignIn({ contractId: 'near', methodNames: [] });
        const account = await near.getAccountId?.();
        if (account) { onLaunch(account); return; }
      }
      // Fallback: try accounts()
      const accounts = await near?.accounts?.();
      if (accounts?.[0]) { onLaunch(accounts[0].accountId || accounts[0]); return; }
    } catch (e) { /* fall through */ }
    setConnecting(false);
  };

  const handleConnectWebWallet = () => {
    const successUrl = encodeURIComponent(window.location.href.split('?')[0]);
    window.location.href = `${NEAR_WALLET_URL}/?success_url=${successUrl}`;
  };

  const features = [
    { icon: '🧠', label: 'Groq Llama 3.3 70B', color: '#f59e0b' },
    { icon: '🌐', label: 'NEAR Protocol Live', color: '#00d4ff' },
    { icon: '🔒', label: 'Lit Protocol ECDSA', color: '#a78bfa' },
    { icon: '📦', label: 'Filecoin CIDs', color: '#10b981' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow orb */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Shield icon */}
      <div style={{
        fontSize: '64px',
        marginBottom: '24px',
        filter: 'drop-shadow(0 0 24px rgba(0,212,255,0.5))',
        animation: 'pulse-dot 3s ease-in-out infinite',
      }}>🛡️</div>

      {/* Title */}
      <h1 style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '42px',
        fontWeight: 800,
        color: '#fff',
        margin: '0 0 8px',
        letterSpacing: '-0.03em',
        textAlign: 'center',
      }}>
        Risk<span style={{ color: '#00d4ff' }}>Sentinel</span>
      </h1>

      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        color: '#4a5568',
        marginBottom: '40px',
        textAlign: 'center',
        maxWidth: '480px',
      }}>
        Autonomous DeFi risk monitoring with verifiable AI decisions on Filecoin
      </p>

      {/* Feature pills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '40px',
        maxWidth: '520px',
      }}>
        {features.map((f, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '6px 14px',
            borderRadius: '20px',
            border: `1px solid ${f.color}30`,
            background: `${f.color}08`,
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: f.color,
          }}>
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </div>
        ))}
      </div>

      {/* Connect wallet button */}
      <div style={{ width: '100%', maxWidth: '440px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {hasExtension ? (
          <button
            onClick={handleConnectExtension}
            disabled={connecting}
            onMouseEnter={() => setConnectHovered(true)}
            onMouseLeave={() => setConnectHovered(false)}
            style={{
              width: '100%',
              padding: '12px',
              background: connectHovered ? 'rgba(0,212,255,0.15)' : 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.35)',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: '#00d4ff',
              cursor: connecting ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
            }}
          >
            {connecting ? 'Connecting...' : '⚡ Connect NEAR Extension'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleConnectWebWallet}
              onMouseEnter={() => setConnectHovered(true)}
              onMouseLeave={() => setConnectHovered(false)}
              style={{
                flex: 1,
                padding: '10px',
                background: connectHovered ? 'rgba(0,212,255,0.12)' : 'rgba(0,212,255,0.06)',
                border: '1px solid rgba(0,212,255,0.25)',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#00d4ff',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🌐 MyNearWallet
            </button>
            <a
              href={SENDER_EXTENSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                padding: '10px',
                background: 'rgba(167,139,250,0.06)',
                border: '1px solid rgba(167,139,250,0.2)',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#a78bfa',
                textDecoration: 'none',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              ↗ Install Sender
            </a>
          </div>
        )}
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: '#2d3748',
        }}>— or enter wallet manually —</div>
      </div>

      {/* Wallet input */}
      <div style={{
        display: 'flex',
        gap: '0',
        width: '100%',
        maxWidth: '440px',
        marginBottom: '16px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(0,212,255,0.25)',
        boxShadow: '0 0 24px rgba(0,212,255,0.08)',
      }}>
        <span style={{
          padding: '12px 14px',
          background: 'rgba(0,212,255,0.08)',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: '#00d4ff',
          borderRight: '1px solid rgba(0,212,255,0.15)',
          whiteSpace: 'nowrap',
        }}>
          wallet://
        </span>
        <input
          type="text"
          value={wallet}
          onChange={e => setWallet(e.target.value)}
          placeholder="yourname.near"
          style={{
            flex: 1,
            padding: '12px 14px',
            background: '#0d1529',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            color: '#e2e8f0',
            width: '100%',
          }}
          onKeyDown={e => { if (e.key === 'Enter' && wallet.trim()) onLaunch(wallet.trim()); }}
        />
      </div>

      {/* Launch button */}
      <button
        onClick={() => wallet.trim() && onLaunch(wallet.trim())}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: '14px 48px',
          background: hovered
            ? 'linear-gradient(135deg, #00d4ff, #0095cc)'
            : 'linear-gradient(135deg, #00b8d9, #0080b3)',
          border: 'none',
          borderRadius: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          fontWeight: 700,
          color: '#0a0f1e',
          cursor: 'pointer',
          letterSpacing: '0.06em',
          transition: 'all 0.2s ease',
          transform: hovered ? 'translateY(-2px)' : 'none',
          boxShadow: hovered ? '0 8px 28px rgba(0,212,255,0.35)' : '0 4px 14px rgba(0,212,255,0.2)',
        }}
      >
        LAUNCH DASHBOARD →
      </button>

      <p style={{
        marginTop: '24px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: '#2d3748',
        textAlign: 'center',
      }}>
        Uses demo positions for NEAR testnet wallets
      </p>
    </div>
  );
}
