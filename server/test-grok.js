import 'dotenv/config';
import https from 'https';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

const apiUrl = process.env.GROK_API_URL;
const apiKey = process.env.GROK_API_KEY;
const model = process.env.GROK_MODEL || 'grok-1';

if (!apiUrl || !apiKey) {
  console.error('GROK_API_URL and GROK_API_KEY must be set in your .env file');
  process.exit(1);
}

const payload = {
  model,
  input: 'Quick connectivity test from local test-grok.js',
  max_tokens: 128,
};

async function tryFetch() {
  try {
    console.log('[test-grok] attempting fetch to', apiUrl);
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('[test-grok] fetch status', res.status);
    const text = await res.text();
    console.log('[test-grok] fetch body:', text);
    return;
  } catch (err) {
    console.error('[test-grok] fetch failed:', err && (err.stack || err.message || err));
    console.log('[test-grok] trying https.request fallback');
  }

  // https fallback
  try {
    const parsed = new URL(apiUrl);
    const bodyText = JSON.stringify(payload);
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 443,
      path: parsed.pathname + (parsed.search || ''),
      method: 'POST',
      servername: parsed.hostname,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyText),
        Host: parsed.host,
      },
    };

    const result = await new Promise((resolve, reject) => {
      const req = https.request(opts, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`status ${res.statusCode}: ${data}`));
          }
        });
      });
      req.on('error', (e) => reject(e));
      req.write(bodyText);
      req.end();
    });

    console.log('[test-grok] https fallback response:', result);
  } catch (err) {
    console.log('[test-grok] https fallback failed:', err && (err.stack || err.message || err));
    console.log('[test-grok] attempting axios fallback (respecting GROK_INSECURE_SKIP_TLS and proxy env vars)');
    try {
      const insecure = process.env.GROK_INSECURE_SKIP_TLS === 'true';
      const parsed = new URL(apiUrl);

      const proxyUrl = process.env.GROK_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
      let agent;
      if (proxyUrl) {
        console.log('[test-grok] using proxy agent:', proxyUrl);
        agent = new HttpsProxyAgent(proxyUrl);
      } else {
        agent = new https.Agent({ rejectUnauthorized: !insecure, servername: parsed.hostname });
      }

      const axiosConfig = { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, httpsAgent: agent, timeout: 20000 };
      if (proxyUrl) axiosConfig.proxy = false;

      const r = await axios.post(apiUrl, payload, axiosConfig);
      console.log('[test-grok] axios response status', r.status);
      console.log('[test-grok] axios body:', JSON.stringify(r.data));
    } catch (err2) {
      console.error('[test-grok] axios fallback failed:', err2 && (err2.stack || err2.message || err2));
      process.exit(1);
    }
  }
}

tryFetch();
