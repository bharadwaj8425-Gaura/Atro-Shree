// Astro-Shree backend on Supabase Edge Functions.
// Deploy: supabase functions deploy astro-api --no-verify-jwt   (or via MCP), i.e. deploy function "astro-api" with verify_jwt = false
// (the API does its own checks: admin password, signed tokens, signed one-tap links).
// Secrets (Supabase → Edge Functions → Secrets): GEMINI_API_KEY, ADMIN_PASSWORD, optional TOKEN_SECRET, CALLMEBOT_APIKEY, UPI_PAYEE_NAME…
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.
import { handle } from '../../../lib/handlers.js'; // MCP deploy uses the same file via jsDelivr (pinned commit)

const SELF = 'https://ibrlngakmbqconakhqyt.supabase.co/functions/v1/astro-api';
const SITE = 'https://bharadwaj8425-gaura.github.io/Atro-Shree';
const cors: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  const u = new URL(req.url), i = u.pathname.indexOf('/api/');
  const path = i >= 0 ? u.pathname.slice(i) : '/api/config';
  const inner = new Request('https://astro.local' + path + u.search, {
    method: req.method, headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
  });
  const env: Record<string, string> = Deno.env.toObject();
  env.API_URL ||= SELF;
  env.QUICK_PAGE ||= (env.SITE_URL || SITE).replace(/\/+$/, '') + '/quick.html';
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('cf-connecting-ip') || 'x';
  // deno-lint-ignore no-explicit-any
  const ER = (globalThis as any).EdgeRuntime;
  const res = await handle(inner, env, {
    ip, country: req.headers.get('cf-ipcountry'),
    waitUntil: (p: Promise<unknown>) => { if (ER && ER.waitUntil) ER.waitUntil(p); else p.catch(() => {}); },
  });
  const h = new Headers(res.headers); for (const k in cors) h.set(k, cors[k]);
  return new Response(res.body, { status: res.status, headers: h });
});
