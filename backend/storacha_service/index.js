import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

import express from 'express';
import { execFile } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createHash } from 'crypto';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const app = express();
app.use(express.json({ limit: '10mb' }));

const SPACE_DID = process.env.W3UP_SPACE_DID || '';

function mockCid(content) {
  return 'bafyreib' + createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex')
    .slice(0, 38);
}

/**
 * Upload a JSON file using the w3 CLI (already authenticated on this machine).
 * The CLI handles UCAN auth internally via ~/.config/w3up/
 */
async function uploadViaW3Cli(content, filename) {
  const tmpPath = join(tmpdir(), filename);
  await writeFile(tmpPath, JSON.stringify(content, null, 2), 'utf8');
  try {
    // w3 up <file> --no-wrap => returns the CID on stdout
    // On Windows npm globals use .cmd wrapper; shell:true handles cross-platform
    const { stdout } = await execFileAsync('w3', ['up', tmpPath, '--no-wrap'], {
      timeout: 30000,
      shell: true,
      env: { ...process.env }
    });
    // w3 up outputs: "⁂ https://w3s.link/ipfs/<CID>"  — extract just the CID
    const raw = stdout.trim().split('\n').pop().trim();
    const match = raw.match(/\/ipfs\/([a-zA-Z0-9]+)/);
    const cid = match ? match[1] : raw.replace(/[^a-zA-Z0-9]/g, '').slice(0, 59);
    return cid;
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}

// POST /upload  { content: {...}, filename: "audit-xxx.json" }
app.post('/upload', async (req, res) => {
  const { content, filename } = req.body;
  const name = filename || `audit-${Date.now()}.json`;

  if (!SPACE_DID) {
    const cid = mockCid(content);
    return res.json({ cid, mock: true, reason: 'W3UP_SPACE_DID not set' });
  }

  try {
    const cid = await uploadViaW3Cli(content, name);
    console.log(`[StorachaService] Uploaded to Filecoin => ${cid}`);
    res.json({ cid, mock: false });
  } catch (err) {
    console.error('[StorachaService] Upload error:', err.message);
    res.json({ cid: mockCid(content), mock: true, reason: err.message });
  }
});

app.get('/health', (_, res) => res.json({
  status: 'ok',
  space_did: SPACE_DID || 'not configured',
  ready: !!SPACE_DID,
}));

const PORT = process.env.STORACHA_SERVICE_PORT || 3002;
app.listen(PORT, () => console.log(`[StorachaService] Listening on port ${PORT}`));
