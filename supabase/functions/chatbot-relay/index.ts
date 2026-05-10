/**
 * chatbot-relay
 *
 * Public-facing proxy in front of the n8n chatbot webhook.
 *
 * Why this exists: the previous architecture had the frontend posting the
 * user's message directly to https://app.n8n-tech.cloud/webhook/triexpert-bot
 * with the URL hardcoded in the bundle. Even when we moved the URL to a
 * Vite env var (Sprint 1) and added an X-Webhook-Token header, both the
 * URL and the token were still shipped to every visitor in the JS bundle.
 *
 * This edge function is the proper boundary:
 *
 *   browser ──▶ chatbot-relay (this function)
 *                 │
 *                 ├─ origin allowlist
 *                 ├─ payload validation
 *                 ├─ in-memory per-IP rate limit
 *                 ├─ HMAC-SHA256 sign body with N8N_HMAC_SECRET
 *                 │
 *                 ▼
 *               n8n webhook (validates X-Signature against same secret)
 *
 * The shared secret never leaves the edge function runtime. The frontend
 * only needs to be able to reach Supabase (which it already does for
 * everything else).
 *
 * Required env (set via `supabase secrets set` or in the dashboard):
 *   N8N_CHAT_WEBHOOK_URL   — full URL of the n8n webhook (e.g. https://app.n8n-tech.cloud/webhook/triexpert-bot)
 *   N8N_HMAC_SECRET        — random ≥32-byte string, must match the one configured in n8n
 *   ALLOWED_ORIGINS        — comma-separated allowlist (e.g. https://triexpertservice.com,https://www.triexpertservice.com)
 *
 * The n8n side must:
 *   1. Read X-Signature: sha256=<hex> from the incoming request
 *   2. Recompute HMAC-SHA256(rawBody, N8N_HMAC_SECRET)
 *   3. Reject (401) if it does not match
 */

const N8N_WEBHOOK_URL = Deno.env.get('N8N_CHAT_WEBHOOK_URL') ?? '';
const N8N_HMAC_SECRET = Deno.env.get('N8N_HMAC_SECRET') ?? '';
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const MAX_MESSAGE_LENGTH = 2000;
const MAX_BODY_BYTES = 8 * 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;

// In-memory limiter — adequate for the current traffic (a few req/min).
// Edge function instances may run in parallel, so the cap is "per warm
// instance, per IP". For real abuse protection migrate to a Supabase
// table or KV store; that is tracked as a follow-up in Outline.
const buckets = new Map<string, { count: number; windowStart: number }>();

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now - b.windowStart > RATE_LIMIT_WINDOW_MS) {
    buckets.set(ip, { count: 1, windowStart: now });
    return true;
  }
  b.count += 1;
  return b.count <= RATE_LIMIT_MAX;
}

function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
    Vary: 'Origin',
  };
}

function clientIp(req: Request): string {
  // Supabase edge functions sit behind a proxy; X-Forwarded-For is the
  // original client. Take the first entry.
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('cf-connecting-ip') ?? 'unknown';
}

async function hmacSha256Hex(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface ChatRequestBody {
  message: string;
  session_id: string;
  language?: string;
  source?: string;
  page_url?: string;
}

function isValidBody(b: unknown): b is ChatRequestBody {
  if (!b || typeof b !== 'object') return false;
  const o = b as Record<string, unknown>;
  if (typeof o.message !== 'string' || o.message.trim().length === 0) return false;
  if (o.message.length > MAX_MESSAGE_LENGTH) return false;
  if (typeof o.session_id !== 'string' || o.session_id.length === 0 || o.session_id.length > 128) return false;
  if (o.language !== undefined && typeof o.language !== 'string') return false;
  if (o.source !== undefined && typeof o.source !== 'string') return false;
  if (o.page_url !== undefined && typeof o.page_url !== 'string') return false;
  return true;
}

function jsonResponse(status: number, body: unknown, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  const cors = corsHeadersFor(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' }, cors);
  }

  // Origin allowlist — block before doing any work.
  const origin = req.headers.get('Origin') ?? '';
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return jsonResponse(403, { error: 'Origin not allowed' }, cors);
  }

  // Server config sanity check
  if (!N8N_WEBHOOK_URL || !N8N_HMAC_SECRET) {
    return jsonResponse(500, { error: 'Server not configured' }, cors);
  }

  const ip = clientIp(req);
  if (!rateLimitOk(ip)) {
    return jsonResponse(429, { error: 'Rate limit exceeded' }, cors);
  }

  // Read body with a hard size cap
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return jsonResponse(413, { error: 'Payload too large' }, cors);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' }, cors);
  }

  if (!isValidBody(parsed)) {
    return jsonResponse(400, { error: 'Invalid body' }, cors);
  }

  // Rebuild a canonical body so the signed bytes are exactly what we
  // forward — protects against the n8n side seeing a different payload
  // than what was signed.
  const canonical = JSON.stringify({
    message: parsed.message,
    session_id: parsed.session_id,
    language: parsed.language ?? 'en',
    source: parsed.source ?? 'website_chat',
    page_url: parsed.page_url ?? '',
    relayed_at: new Date().toISOString(),
  });

  const signature = await hmacSha256Hex(N8N_HMAC_SECRET, canonical);

  let upstream: Response;
  try {
    upstream = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': `sha256=${signature}`,
      },
      body: canonical,
      // Avoid hanging the edge worker indefinitely if n8n is slow.
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    return jsonResponse(502, { error: 'Upstream unreachable' }, cors);
  }

  const upstreamText = await upstream.text();
  // Forward upstream content type when reasonable; default JSON.
  const contentType = upstream.headers.get('Content-Type') ?? 'application/json';

  return new Response(upstreamText, {
    status: upstream.ok ? 200 : 502,
    headers: { ...cors, 'Content-Type': contentType },
  });
});
