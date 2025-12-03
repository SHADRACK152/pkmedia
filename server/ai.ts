// rely on Node's global fetch (node 18+), lib DOM included in tsconfig
import https from 'https';
import axios from 'axios';
import { URL } from 'url';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dns from 'dns/promises';
import tls from 'tls';

export interface GrokOptions {
  apiUrl?: string;
  apiKey?: string;
  model?: string;
}

export async function callGrok(message: string, history?: Array<{ role: string; text: string }>, options?: GrokOptions): Promise<string> {
  const apiUrl = options?.apiUrl || process.env.GROK_API_URL;
  const apiKey = options?.apiKey || process.env.GROK_API_KEY;
  const model = options?.model || process.env.GROK_MODEL || 'grok-1';

  if (!apiKey) {
    throw new Error('Grok API key is not configured');
  }
  if (!apiUrl) {
    throw new Error('Grok API URL is not configured');
  }

  // Generic completion request. Different providers have different payloads.
  // If you have a specific console.grok API shape, update this payload accordingly.
  const features = `I can help users with:
  - Viewing latest articles and categories
  - Finding articles by category or search
  - Explaining how to register and update settings
  - Explaining admin features and comment moderation (admins only)
  - Providing contact information and support resources
  - Helping users report problems or flag content
  - General small talk, philosophy, and civic-minded suggestions
  `;

  const systemPrompt = `You are PKBoot, a friendly, helpful, civic-minded and thoughtful assistant for a news website called PKMedia. Be concise but warm; offer next steps and commands the user can use. If the user asks about "what can you do", list the features below.
  Features:\n${features}`;

  // Build a conversation-aware prompt by including recent history (if provided)
  let conversationText = '';
  if (history && history.length) {
    conversationText = history
      .slice(-8)
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');
  }

  const payload = {
    model,
    input: systemPrompt + (conversationText ? `\n\nConversation:\n${conversationText}` : '') + `\n\nUser: ${message}`,
    max_tokens: 512,
  } as any;

  // sanitize replies from LLM providers to avoid them echoing the system prompt
  function sanitizeReply(text: string | undefined | null) {
    if (!text) return "";
    let t = text.toString();
    // remove exact system prompt if provider echoed it back
    if (t.includes(systemPrompt)) {
      t = t.replace(systemPrompt, '');
    }
    // remove common assistant intro repeats like "PKBoot" greetings
    t = t.replace(/^\s*(PKBoot[:\-–—]*\s*)+/i, '');
    t = t.replace(/^\s*(You are PKBoot[^\n]*\n?)+/i, '');
    return t.trim();
  }

  const insecureEnv = process.env.GROK_INSECURE_SKIP_TLS === 'true';

  // If developer asked to skip TLS verification, set Node env to ease some Windows/OpenSSL interop issues in dev.
  if (insecureEnv) {
    try {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      console.warn('[grok] GROK_INSECURE_SKIP_TLS is true — disabling NODE_TLS_REJECT_UNAUTHORIZED (dev only)');
    } catch (e) {
      console.warn('[grok] failed to set NODE_TLS_REJECT_UNAUTHORIZED:', String(e));
    }
  }

  // Attempt the fetch and provide richer diagnostics on failure
  let response: Response;
  try {
    // Run a quick DNS + TLS probe to gather more diagnostics for handshake issues
    try {
      const uprobe = new URL(apiUrl!);
      const probePort = uprobe.port ? parseInt(uprobe.port, 10) : 443;
      const probeHost = uprobe.hostname;
      try {
        const addresses = await dns.lookup(probeHost, { all: true });
        console.log('[grok-diagnostics] dns.lookup result:', addresses.map(a => a.address));
      } catch (dnsErr: any) {
        console.warn('[grok-diagnostics] dns.lookup failed:', dnsErr && (dnsErr.code || dnsErr.message || dnsErr));
      }

      // TLS probe: attempt a socket TLS handshake to capture the early handshake error
      await new Promise<void>((resolve, reject) => {
        const socket = tls.connect({ host: probeHost, port: probePort, servername: probeHost, rejectUnauthorized: false, timeout: 8000 }, () => {
          try {
            const cipher = socket.getCipher?.();
            const proto = socket.alpnProtocol || socket.getProtocol?.() || 'unknown';
            console.log('[grok-diagnostics] tls connected:', { authorized: socket.authorized, authorizationError: socket.authorizationError, cipher, proto });
            socket.end();
            resolve();
          } catch (e) {
            socket.destroy();
            reject(e);
          }
        });

        socket.on('error', (e) => {
          console.warn('[grok-diagnostics] tls probe error:', e && (e.code || e.message || String(e)));
          socket.destroy();
          reject(e);
        });

        socket.on('timeout', () => {
          console.warn('[grok-diagnostics] tls probe timeout');
          socket.destroy();
          reject(new Error('tls-probe-timeout'));
        });
      }).catch((e) => {
        // Do not fail the whole request path; just log diagnostic info
        console.warn('[grok-diagnostics] tls probe ended with error:', e && (e.code || e.message || String(e)));
      });
    } catch (probeErr: any) {
      console.warn('[grok-diagnostics] probe failed:', probeErr && (probeErr.message || probeErr));
    }

    // Log a masked version of the URL for debugging (don't log secret keys)
    try {
      const u = new URL(apiUrl!);
      console.log('[grok] calling', `${u.protocol}//${u.hostname}${u.pathname}`);
    } catch (e) {
      console.log('[grok] calling (invalid-url)');
    }

    // If a proxy is present, Node's global fetch/undici may not use it automatically.
    // If a proxy is configured, skip the fetch (undici) attempt and use axios with a proxy agent
    // because axios + https-proxy-agent integrates cleanly on Windows.
      const proxyEnv = process.env.GROK_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
    if (proxyEnv) {
      console.log('[grok] proxy detected, will use axios + proxy agent for request');
      throw new Error('proxy-present-skip-fetch');
    }

    response = await fetch(apiUrl!, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    // Log the full error for debugging (stack may contain useful info)
    console.error('[grok] fetch error calling Grok API:', err && (err.stack || err.message || err));

    // Try a Node https fallback in case undici/fetch fails due to TLS/proxy differences
    try {

      const parsed = new URL(apiUrl!);
      const bodyText = JSON.stringify(payload);

      const insecure = insecureEnv;
      console.log('[grok] https fallback; insecure=', insecure);

      // Force a minimum TLS version to avoid older protocol negotiation problems on some Windows stacks
      const agent = new https.Agent({ rejectUnauthorized: !insecure, servername: parsed.hostname, minVersion: 'TLSv1.2' as any });

      const reqOptions: https.RequestOptions = {
        hostname: parsed.hostname,
        port: parsed.port ? parseInt(parsed.port, 10) : 443,
        path: parsed.pathname + (parsed.search || ''),
        method: 'POST',
        // ensure SNI is set correctly for TLS handshake
        servername: parsed.hostname,
        agent,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyText),
          Host: parsed.hostname,
        },
      };

      const result = await new Promise<string>((resolve, reject) => {
        const req = https.request(reqOptions, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(data);
            } else {
              reject(new Error(`Grok API (https) responded ${res.statusCode}: ${data}`));
            }
          });
        });

        req.on('error', (e) => reject(e));
        req.write(bodyText);
        req.end();
      });

      const fb = JSON.parse(result);

      if (fb && typeof fb === 'object') {
        if (typeof fb.choices === 'object' && Array.isArray(fb.choices) && fb.choices[0]?.text) {
          return sanitizeReply(fb.choices[0].text);
        }
        if (typeof fb.output === 'string') {
          return sanitizeReply(fb.output);
        }
        if (typeof fb.result === 'string') {
          return sanitizeReply(fb.result);
        }
        return sanitizeReply(JSON.stringify(fb));
      }

      return '';
    } catch (err2: any) {
      console.error('[grok] https fallback failed:', err2 && (err2.stack || err2.message || err2));

      // As a last resort, try axios with a configurable TLS option (dev-only)
      try {
        console.log('[grok] attempting axios fallback (respecting GROK_INSECURE_SKIP_TLS env flag)');
        const parsed = new URL(apiUrl!);
        const insecure = insecureEnv;

        // If a proxy is configured, create a proxy agent and use it as the httpsAgent
        const proxyUrl = process.env.GROK_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
        let agent: https.Agent;
        if (proxyUrl) {
          console.log('[grok] creating HttpsProxyAgent for proxy:', proxyUrl);
          // HttpsProxyAgent returns an agent compatible with axios when cast
          agent = new HttpsProxyAgent(proxyUrl) as unknown as https.Agent;
        } else {
          agent = new https.Agent({ rejectUnauthorized: !insecure, servername: parsed.hostname, minVersion: 'TLSv1.2' as any, keepAlive: true });
        }

        const axiosConfig: any = {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          httpsAgent: agent,
          timeout: 60000,
        };

        // When using HttpsProxyAgent, tell axios to not use the built-in proxy handling
        if (proxyUrl) axiosConfig.proxy = false;

        const axiosRes = await axios.post(apiUrl!, payload, axiosConfig);

        const axBody = axiosRes.data;
        if (axBody && typeof axBody === 'object') {
          if (typeof axBody.choices === 'object' && Array.isArray(axBody.choices) && axBody.choices[0]?.text) {
            return sanitizeReply(axBody.choices[0].text);
          }
          if (typeof axBody.output === 'string') return sanitizeReply(axBody.output);
          if (typeof axBody.result === 'string') return sanitizeReply(axBody.result);
          return sanitizeReply(JSON.stringify(axBody));
        }

        return '';
      } catch (err3: any) {
        console.error('[grok] axios fallback failed:', err3 && (err3.stack || err3.message || err3));
        throw new Error(`fetch failed when calling Grok API: ${err && (err.message || String(err))}; https fallback failed: ${err2 && (err2.message || String(err2))}; axios fallback failed: ${err3 && (err3.message || String(err3))}`);
      }
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Grok API responded with ${response.status}: ${text}`);
  }

  const body = await response.json();

  // Not all providers return the same schema. Attempt a few common ones.
  if (body && typeof body === 'object') {
    if (typeof body.choices === 'object' && Array.isArray(body.choices) && body.choices[0]?.text) {
      return sanitizeReply(body.choices[0].text);
    }
    if (typeof body.output === 'string') {
      return sanitizeReply(body.output);
    }
    if (typeof body.result === 'string') {
      return sanitizeReply(body.result);
    }
    // fallback: return the JSON string
    return sanitizeReply(JSON.stringify(body));
  }

  return '';
}
