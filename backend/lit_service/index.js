require('dotenv').config({ path: '../.env' });
const express = require('express');
const ethers = require('ethers');
const crypto = require('crypto');

const app = express();
app.use(express.json());

function mockSignature(body) {
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(body))
    .digest('hex');
  return `lit_sig_${hash.slice(0, 32)}`;
}

// POST /sign  { content: {...} }
// Signs with ECDSA secp256k1 — verifiable on-chain via ecrecover
app.post('/sign', async (req, res) => {
  const { content } = req.body;
  const privateKey = process.env.ETHEREUM_PRIVATE_KEY;

  if (!privateKey) {
    console.log('[LitService] No ETHEREUM_PRIVATE_KEY — returning deterministic mock');
    return res.json({
      signature: mockSignature(content),
      fallback: true,
      reason: 'ETHEREUM_PRIVATE_KEY not set',
    });
  }

  try {
    const contentHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(content))
    );
    const wallet = new ethers.Wallet(privateKey);
    const signature = await wallet.signMessage(ethers.utils.arrayify(contentHash));
    console.log(`[LitService] Signed with ECDSA (${wallet.address})`);
    return res.json({
      signature,
      dataSigned: contentHash,
      signerAddress: wallet.address,
      method: 'ecdsa_secp256k1',
    });
  } catch (err) {
    console.error('[LitService] ECDSA sign error:', err.message);
    return res.json({
      signature: mockSignature(content),
      fallback: true,
      reason: err.message,
    });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok', method: 'ecdsa_secp256k1' }));

const PORT = process.env.LIT_SERVICE_PORT || 3001;
app.listen(PORT, () => console.log(`[LitService] Running on port ${PORT} (ECDSA mode)`));
