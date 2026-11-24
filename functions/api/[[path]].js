// Cloudflare Pages Function: every /api/* request goes to the shared handler.
import { handle } from '../../lib/handlers.js';

export async function onRequest(context) {
  const r = context.request;
  return handle(r, context.env, {
    ip: r.headers.get('cf-connecting-ip') || 'x',
    country: r.headers.get('cf-ipcountry') || (r.cf && r.cf.country) || null,
    waitUntil: p => context.waitUntil(p)
  });
}
