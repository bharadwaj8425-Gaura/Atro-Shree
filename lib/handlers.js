// Astro-Shree — backend API
// /api/config · /api/log · /api/chat · /api/pay · /api/reviews · /api/admin · /api/quick
// Web-standard code: Cloudflare Pages Functions (free) or Node 18+ via server.js. Secrets only from env.

const enc = new TextEncoder();
const EV = 'astro_events', PT = 'astro_payments', RV = 'astro_reviews', ST = 'astro_settings';
const EVENTS = new Set(['visit', 'page', 'kundli', 'milan', 'panchang', 'numerology', 'tarot', 'rashifal', 'game', 'chat', 'vault', 'lead', 'share', 'booking_start']);

// Service catalog — the server is the source of truth for prices (override with env PRICES="prashn=51,milan=101,...")
const CATALOG = {
  prashn: { price: 51, label: 'Ek Prashn (one question)', cat: 'jyotish' },
  milan: { price: 101, label: 'Kundli Milan analysis', cat: 'jyotish' },
  kundli_report: { price: 151, label: 'Janam Kundli detailed report', cat: 'jyotish' },
  call: { price: 251, label: 'One-to-One call (20 min)', cat: 'jyotish' },
  sampoorna: { price: 501, label: 'Sampoorna Darshan (Kundli + Numerology + Tarot + 30 min call)', cat: 'combo' },
  num_name: { price: 51, label: 'Name Number check', cat: 'numerology' },
  num_report: { price: 151, label: 'Complete Numerology report', cat: 'numerology' },
  num_baby: { price: 251, label: 'Baby / Business name numerology', cat: 'numerology' },
  tarot_one: { price: 51, label: 'One-question Tarot', cat: 'tarot' },
  tarot_celtic: { price: 151, label: 'Celtic Cross Tarot (10 cards)', cat: 'tarot' },
  tarot_live: { price: 251, label: 'Live Tarot call (20 min)', cat: 'tarot' }
};

// which Premium Report each paid service unlocks instantly ('*' = all)
const UNLOCKS = { prashn: ['kundli'], milan: ['kundli'], kundli_report: ['kundli'], call: ['kundli'], sampoorna: ['*'], num_name: ['numerology'], num_report: ['numerology'], num_baby: ['numerology'], tarot_one: ['tarot'], tarot_celtic: ['tarot'], tarot_live: ['tarot'] };
const REPORTS = ['kundli', 'numerology', 'tarot'];

/* ---------------- helpers ---------------- */
const json = (o, status = 200, extra = {}) => new Response(JSON.stringify(o), { status, headers: Object.assign({ 'content-type': 'application/json', 'cache-control': 'no-store' }, extra) });
const empty = (status = 204) => new Response(null, { status, headers: { 'cache-control': 'no-store' } });
const str = (v, n) => (v == null || v === '' ? null : String(v).slice(0, n));
const buckets = new Map();
function limited(key, max, windowMs) { const now = Date.now(); const a = (buckets.get(key) || []).filter(t => now - t < windowMs); a.push(now); buckets.set(key, a); if (buckets.size > 5000) buckets.clear(); return a.length > max; }
function safeEq(a, b) { a = String(a); b = String(b); if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
const hex = u => [...u].map(b => b.toString(16).padStart(2, '0')).join('');
function b64u(u) { let s = ''; for (const b of u) s += String.fromCharCode(b); return btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_'); }
async function hmac(secret, msg) { const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(msg))); }
function fromB64u(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const bin = atob(s); return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))); }
async function sha256hex(s) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)))); }
async function body(request) { const t = await request.text(); if (t.length > 3_000_000) throw new Error('too large'); return t ? JSON.parse(t) : {}; }
const randId = n => b64u(crypto.getRandomValues(new Uint8Array(n)));
const digits = v => String(v || '').replace(/\D/g, '');
function jsonCap(v, max) { if (v == null) return null; try { const s = JSON.stringify(v); return s.length > max ? null : JSON.parse(s); } catch (e) { return null; } }
const escH = x => String(x == null ? '' : x).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

function cfg(env) {
  const prices = {}; Object.keys(CATALOG).forEach(k => { prices[k] = CATALOG[k].price; });
  String(env.PRICES || '').split(',').forEach(p => { const [k, v] = p.split('=').map(s => (s || '').trim()); if (CATALOG[k] && +v > 0) prices[k] = Math.round(+v); });
  return {
    gemKey: env.GEMINI_API_KEY || '', gemModel: env.GEMINI_MODEL || 'gemini-3.8-flash', gemBase: (env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/+$/, ''),
    supaUrl: (env.SUPABASE_URL || '').replace(/\/+$/, ''), supaKey: env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || '',
    admin: env.ADMIN_PASSWORD || '', salt: env.IP_SALT || 'as-salt', tokSecret: env.TOKEN_SECRET || ('astok|' + (env.ADMIN_PASSWORD || '') + '|' + (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || '')),
    waPhone: (env.NOTIFY_WHATSAPP || '918484013977').replace(/\D/g, ''), waKey: env.CALLMEBOT_APIKEY || '', waBase: (env.CALLMEBOT_BASE_URL || 'https://api.callmebot.com').replace(/\/+$/, ''),
    siteUrl: (env.SITE_URL || 'https://astro-shree.com').replace(/\/+$/, ''), apiUrl: (env.API_URL || env.SITE_URL || 'https://astro-shree.com').replace(/\/+$/, ''), quickPage: env.QUICK_PAGE || '',
    upiId: env.UPI_ID === 'off' ? '' : (env.UPI_ID || '8484013977@ybl'), upiName: env.UPI_NAME || 'Astro Shree',
    upiPayee: (env.UPI_PAYEE_NAME || '').toLowerCase(), upiLast4: digits(env.UPI_ACCOUNT_LAST4).slice(-4),
    chatPerDay: +(env.CHAT_FREE_PER_DAY || 7), prices,
    offerPct: env.OFFER_PCT == null || env.OFFER_PCT === '' ? 20 : Math.max(0, Math.min(90, +env.OFFER_PCT || 0)), offerTill: env.OFFER_TILL || '2026-12-31', offerName: env.OFFER_NAME || 'Launch Offer',
    coupons: Object.fromEntries(String(env.COUPONS == null ? 'SHUBH11=11,SAPTAH21=21' : env.COUPONS).split(',').map(x => x.split('=').map(y => (y || '').trim())).filter(x => x[0] && +x[1] > 0).map(x => [x[0].toUpperCase(), Math.round(+x[1])]))
  };
}
const offerActive = c => c.offerPct > 0 && Date.now() <= Date.parse(c.offerTill + 'T23:59:59+05:30');
const endOne = x => { const r = Math.round(x); return r > 20 ? Math.round((r - 1) / 10) * 10 + 1 : r; };
// price after launch offer and optional coupon (never below ₹21)
function quote(c, service, coupon) {
  const base = c.prices[service]; if (!base) return null;
  const after = offerActive(c) ? endOne(base * (1 - c.offerPct / 100)) : base;
  const code = String(coupon || '').trim().toUpperCase(), off = code && c.coupons[code] ? c.coupons[code] : 0;
  return { base, after, coupon: off ? code : null, couponOff: off, couponInvalid: !!code && !off, final: Math.max(21, after - off) };
}
const aiOn = c => !!c.gemKey;
const supaOn = c => !!(c.supaUrl && c.supaKey);
const upiOn = c => !!(c.upiId && supaOn(c));

async function supa(c, path, opts = {}) {
  const r = await fetch(`${c.supaUrl}/rest/v1/${path}`, { method: opts.method || 'GET', headers: Object.assign({ apikey: c.supaKey, 'content-type': 'application/json' }, /^sb_/.test(c.supaKey) ? {} : { Authorization: `Bearer ${c.supaKey}` }, opts.headers || {}), body: opts.body ? JSON.stringify(opts.body) : undefined });
  const t = await r.text(); let d = null; try { d = t ? JSON.parse(t) : null; } catch (e) { d = t; }
  if (!r.ok) throw new Error((d && d.message) || ('Database error ' + r.status));
  if (opts.count) { const cr = r.headers.get('content-range') || ''; return +(cr.split('/')[1] || 0); }
  return d;
}

/* ---------------- access tokens (signed, stored on the customer's device) ---------------- */
async function signToken(c, obj) { const b = b64u(enc.encode(JSON.stringify(obj))); return b + '.' + b64u(await hmac(c.tokSecret, b)); }
async function verifyToken(c, tok) { try { const [b, sg] = String(tok || '').split('.'); if (!b || !sg || !safeEq(sg, b64u(await hmac(c.tokSecret, b)))) return null; return JSON.parse(fromB64u(b)); } catch (e) { return null; } }
const tokenFor = (c, row) => signToken(c, { u: (UNLOCKS[row.service] || []), b: row.id, s: row.service, p: digits(row.phone).slice(-10), t: Date.now() });
async function rowStillPaid(c, id) { if (!supaOn(c) || !/^\d+$/.test(String(id))) return true; try { const r = await supa(c, `${PT}?select=status&id=eq.${id}`); return !r || !r[0] || r[0].status !== 'rejected'; } catch (e) { return true; } }

/* ---------------- settings (auto-approve switch) ---------------- */
let setCache = { t: 0, v: null };
async function settings(c) {
  if (setCache.v && Date.now() - setCache.t < 60000) return setCache.v;
  const v = { auto_approve: true };
  if (supaOn(c)) { try { (await supa(c, `${ST}?select=key,value`) || []).forEach(r => { v[r.key] = r.value; }); } catch (e) { } }
  setCache = { t: Date.now(), v }; return v;
}

/* ---------------- Gemini ---------------- */
async function gemini(c, { system, contents, json: wantJson, images, temperature, maxTokens, timeoutMs }) {
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), timeoutMs || 45000);
  try {
    if (images && images.length) { const parts = images.map(i => ({ inline_data: { mime_type: i.media_type, data: i.data } })); contents[contents.length - 1].parts = parts.concat(contents[contents.length - 1].parts); }
    const models = [...new Set([c.gemModel, 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'])]; let r, j;
    for (const m of models) {
      const old = /^gemini-2\./.test(m);
      // newest models reject temperature & some thinking options → try simpler configs on a 400
      const variants = old ? [{ t: 1, th: { thinkingBudget: 0 } }, { t: 1 }, {}] : [{ th: { thinkingLevel: 'low' } }, {}, { t: 1 }];
      for (const vr of variants) {
        const gc = { maxOutputTokens: maxTokens || 1024 };
        if (vr.t) gc.temperature = temperature == null ? 0.6 : temperature;
        if (wantJson) gc.responseMimeType = 'application/json';
        if (vr.th) gc.thinkingConfig = vr.th;
        const payload = { contents, generationConfig: gc }; if (system) payload.systemInstruction = { parts: [{ text: system }] };
        r = await fetch(`${c.gemBase}/v1beta/models/${encodeURIComponent(m)}:generateContent`, { method: 'POST', signal: ctrl.signal, headers: { 'content-type': 'application/json', 'x-goog-api-key': c.gemKey }, body: JSON.stringify(payload) });
        j = await r.json().catch(() => ({}));
        if (!r.ok) console.error('Gemini try', m, JSON.stringify(vr), r.status, String((j.error && j.error.message) || '').slice(0, 200));
        if (r.status !== 400 || /api key/i.test((j.error && j.error.message) || '')) break;
      }
      // next model if this one is missing, retired, over quota or overloaded
      if (r.ok || !([400, 404, 429, 500, 503].includes(r.status))) break;
      if (r.status === 400 && /api key/i.test((j.error && j.error.message) || '')) break;
    }
    if (!r.ok) { console.error('Gemini error', r.status, String((j.error && j.error.message) || '').slice(0, 300)); const e = new Error((j.error && j.error.message) || 'AI error ' + r.status); e.status = r.status; throw e; }
    const txt = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(x => x.text || '').join('').trim();
    return wantJson ? JSON.parse(txt.replace(/^```(?:json)?|```$/g, '').trim()) : txt;
  } finally { clearTimeout(timer); }
}

/* ---------------- owner WhatsApp notification (CallMeBot, free, optional) ---------------- */
async function notifyOwner(c, text) {
  if (!c.waKey || !c.waPhone) return false;
  try { const r = await fetch(`${c.waBase}/whatsapp.php?phone=${c.waPhone}&apikey=${encodeURIComponent(c.waKey)}&text=${encodeURIComponent(text)}`); return r.ok; } catch (e) { return false; }
}
const later = (meta, p) => { if (meta && meta.waitUntil) meta.waitUntil(p); else p.catch(() => {}); };
async function quickSig(c, id, a) { return hex(await hmac(c.tokSecret, 'q|' + id + '|' + a)).slice(0, 32); }
async function quickLinks(c, id) { if (c.quickPage) return { approve: `${c.quickPage}?a=approve&id=${id}&s=${await quickSig(c, id, 'approve')}`, reject: `${c.quickPage}?a=reject&id=${id}&s=${await quickSig(c, id, 'reject')}` }; return { approve: `${c.apiUrl}/api/quick/approve/${id}/${await quickSig(c, id, 'approve')}`, reject: `${c.apiUrl}/api/quick/reject/${id}/${await quickSig(c, id, 'reject')}` }; }

/* ---------------- /api/config ---------------- */
let statCache = { t: 0, v: null };
async function configHandler(c) {
  let stats = statCache.v;
  if (supaOn(c) && Date.now() - statCache.t > 5 * 60000) {
    try {
      const [k, m, t] = await Promise.all(['kundli', 'milan', 'tarot'].map(e => supa(c, `${EV}?select=id&event=eq.${e}`, { method: 'HEAD', headers: { Prefer: 'count=exact', Range: '0-0' }, count: true }).catch(() => 0)));
      stats = { kundli: k, milan: m, tarot: t }; statCache = { t: Date.now(), v: stats };
    } catch (e) { /* ignore */ }
  }
  return json({ ai: aiOn(c), upi: upiOn(c) ? { id: c.upiId, name: c.upiName } : null, prices: c.prices, offer: { active: offerActive(c), pct: c.offerPct, till: c.offerTill, name: c.offerName }, data: supaOn(c), stats: stats || null, chatPerDay: c.chatPerDay });
}

/* ---------------- /api/log ---------------- */
async function logHandler(request, c, meta) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!supaOn(c)) return empty();
  if (limited('log:' + meta.ip, 200, 10 * 60 * 1000)) return json({ error: 'Too many events' }, 429);
  let b; try { b = await body(request); } catch (e) { return json({ error: 'Bad JSON' }, 400); }
  if (!EVENTS.has(b.event)) return json({ error: 'Unknown event' }, 400);
  const consent = b.consent === true;
  const row = {
    event: b.event, visitor_id: str(b.visitor_id, 64), consent, lang: str(b.lang, 4),
    name: consent ? str(b.name, 120) : null, phone: consent ? str(b.phone, 20) : null, email: consent ? str(b.email, 160) : null,
    city: consent ? str(b.city, 120) : null, birth: consent ? jsonCap(b.birth, 2000) : null,
    meta: jsonCap(b.meta, 6000),
    ip_hash: (await sha256hex(c.salt + meta.ip)).slice(0, 24), country: str(meta.country, 8), user_agent: str(request.headers.get('user-agent'), 200)
  };
  try { await supa(c, EV, { method: 'POST', body: row, headers: { Prefer: 'return=minimal' } }); return empty(); } catch (e) { return json({ error: 'Could not save' }, 500); }
}

/* ---------------- /api/chat (AI Jyotish) ---------------- */
const CHAT_SYSTEM = `You are "Shree AI", the friendly Vedic astrology assistant on the Astro-Shree website, run by astrologer Manasvi Bharadwaj.
Style: warm, respectful, simple words, short paragraphs, at most ~160 words. Use 1–2 fitting emojis at most. Greet with "Radhe Radhe" only at the start of a conversation.
Language: reply in the language the user writes in. If the user writes Hindi or Hinglish, reply in Hindi (Devanagari) with common English words where natural. If the preferred site language is "hi", prefer Hindi.
Knowledge: answer from Vedic (Jyotish) principles — rashi, lagna, nakshatra, dasha, gochar, remedies like mantra, daan, fasting, seva. Numerology (Chaldean, Lo Shu) and Tarot questions are welcome too. If birth-chart data is provided, use it concretely (lagna, moon sign, nakshatra, current dasha, manglik status).
Honesty & safety: astrology is guidance, not certainty — never guarantee outcomes. Never predict death, accidents, serious illness or exact dates of tragedy. For health, legal or money decisions, tell them to also consult a qualified professional. Never recommend an expensive gemstone or ritual as a must; suggest simple, free remedies first and say gemstones need a personal chart check. If someone sounds distressed or unsafe, be kind and suggest talking to someone they trust or a helpline (India: Tele-MANAS 14416).
Do not claim to be human or to be Manasvi ji. When a question needs a personal deep reading (marriage timing, career decision, health worries, kundli doshas), you may suggest booking with Manasvi ji (Ek Prashn ₹{PRASHN}, call ₹{CALL}) — at most once in a conversation, naturally, never pushy.`;
async function chatHandler(request, c, meta) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!aiOn(c)) return json({ error: 'AI is not set up yet (GEMINI_API_KEY missing).' }, 503);
  if (limited('chat:' + meta.ip, 25, 60 * 60 * 1000)) return json({ error: 'Too many questions. Please try again in a while 🙏', limit: true }, 429);
  let b; try { b = await body(request); } catch (e) { return json({ error: 'Bad request' }, 400); }
  const msgs = Array.isArray(b.messages) ? b.messages.slice(-12) : [];
  while (msgs.length && msgs[0] && msgs[0].role === 'ai') msgs.shift();
  if (!msgs.length || msgs.some(m => typeof m.text !== 'string' || m.text.length > 1500)) return json({ error: 'Message missing or too long' }, 400);
  const contents = msgs.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] }));
  let ctx = `Preferred site language: ${b.lang === 'hi' ? 'hi' : 'en'}. Today (IST): ${new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10)}.`;
  if (b.chart && typeof b.chart === 'object') ctx += `\nUser's birth chart (computed by the site, Lahiri ayanamsa): ${JSON.stringify(b.chart).slice(0, 2500)}`;
  contents[0].parts[0].text = `[Context — not from user]\n${ctx}\n\n[User]\n${contents[0].parts[0].text}`;
  try {
    const text = await gemini(c, { system: CHAT_SYSTEM.replace('{PRASHN}', c.prices.prashn).replace('{CALL}', c.prices.call), contents, temperature: 0.7, maxTokens: 700, timeoutMs: 40000 });
    if (!text) return json({ error: 'AI could not answer. Please rephrase 🙏' }, 502);
    return json({ text });
  } catch (e) { console.error('chat failed', e.name, String(e.message || '').slice(0, 300)); return json({ error: e.name === 'AbortError' ? 'AI took too long. Please try again.' : 'AI is busy right now. Please try again.' }, e.status === 429 ? 429 : 502); }
}

/* ---------------- /api/reviews ---------------- */
async function reviewsHandler(request, c, meta) {
  if (!supaOn(c)) return json({ rows: [] });
  if (request.method === 'GET') {
    try { return json({ rows: (await supa(c, `${RV}?select=id,created_at,name,city,rating,text,service&status=eq.approved&order=id.desc&limit=30`)) || [] }, 200, { 'cache-control': 'public, max-age=300' }); }
    catch (e) { return json({ rows: [] }); }
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (limited('review:' + meta.ip, 4, 24 * 3600 * 1000)) return json({ error: 'Thank you! You have already shared reviews today.' }, 429);
  let b; try { b = await body(request); } catch (e) { return json({ error: 'Bad request' }, 400); }
  const name = str(b.name, 60), text = str(b.text, 800), rating = Math.max(1, Math.min(5, Math.round(+b.rating || 5)));
  if (!name || !text || text.length < 10) return json({ error: 'Please write your name and a few words.' }, 400);
  try {
    await supa(c, RV, { method: 'POST', headers: { Prefer: 'return=minimal' }, body: { name, text, rating, city: str(b.city, 60), service: str(b.service, 40), phone: str(b.phone, 20), visitor_id: str(b.visitor_id, 64), status: 'pending', ip_hash: (await sha256hex(c.salt + meta.ip)).slice(0, 24) } });
    return json({ ok: true });
  } catch (e) { return json({ error: 'Could not save. Please try again.' }, 500); }
}

/* ---------------- UTR check (UPI RRN: 12 digits) ---------------- */
function utrCheck(utr) {
  if (!/^\d{12}$/.test(utr)) return { ok: false, error: 'UTR / UPI Ref. No. must be exactly 12 digits. Copy it from your payment app (PhonePe: "UTR", Google Pay: "UPI transaction ID", Paytm: "UPI Ref. No.").' };
  const d = [...utr].map(Number), distinct = new Set(d).size;
  let up = true, down = true; for (let i = 1; i < 12; i++) { if ((d[i - 1] + 1) % 10 !== d[i]) up = false; if ((d[i - 1] + 9) % 10 !== d[i]) down = false; }
  if (distinct < 4 || up || down || /(\d)\1{6,}/.test(utr)) return { ok: false, error: 'This does not look like a real UTR number. Please copy the 12-digit UTR from your payment app.' };
  // Soft hint only (never blocks): most UPI RRNs start with the year's last digit + day-of-year (YDDD).
  const flags = []; const ist = new Date(Date.now() + 330 * 60000), y = ist.getUTCFullYear();
  const doy = Math.floor((Date.UTC(y, ist.getUTCMonth(), ist.getUTCDate()) - Date.UTC(y, 0, 1)) / 864e5) + 1;
  const ry = d[0], rd = +utr.slice(1, 4); let age = null;
  if (ry === y % 10) age = doy - rd; else if (ry === (y - 1) % 10) age = doy + (Date.UTC(y, 0, 1) - Date.UTC(y - 1, 0, 1)) / 864e5 - rd;
  if (age === null || age < -1 || age > 3) flags.push('UTR date-code does not look like the last 3 days — double-check this one');
  return { ok: true, flags };
}

/* ---------------- /api/pay (UPI QR + UTR, auto-approve) ---------------- */
async function payHandler(request, c, meta) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (limited('pay:' + meta.ip, 40, 10 * 60 * 1000)) return json({ error: 'Too many requests, please wait a few minutes.' }, 429);
  let b; try { b = await body(request); } catch (e) { return json({ error: 'Bad JSON' }, 400); }
  if (b.action === 'quote') { const q = quote(c, String(b.service || ''), b.coupon); return q ? json(q) : json({ error: 'Please choose a service' }, 400); }
  if (!upiOn(c)) return json({ error: 'Online payment is not switched on yet. Please WhatsApp us.' }, 400);
  try {
    if (b.action === 'upi_request') {
      if (limited('upireq:' + meta.ip, 8, 60 * 60 * 1000)) return json({ error: 'Too many submissions. Please contact us on WhatsApp.' }, 429);
      const service = String(b.service || ''); if (!CATALOG[service]) return json({ error: 'Please choose a service' }, 400);
      const name = str(b.name, 120), phone = str(b.phone, 20), email = str(b.email, 160), utr = String(b.utr || '').replace(/\s/g, '').toUpperCase();
      if (!name) return json({ error: 'Please enter your name' }, 400);
      if (digits(phone).length < 10) return json({ error: 'Please enter your WhatsApp number' }, 400);
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'Please check your email' }, 400);
      const uc = utrCheck(utr); if (!uc.ok) return json({ error: uc.error }, 400);
      const shot = String(b.screenshot || ''); const sm = shot.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/); // optional now
      const dup = await supa(c, `${PT}?select=id&payment_id=eq.${encodeURIComponent(utr)}&limit=1`);
      if (dup && dup.length) return json({ error: 'This UTR number has already been used for a booking. Please check the number, or WhatsApp us if it was yours.' }, 409);
      const q = quote(c, service, b.coupon), amountRs = q.final;
      // No bank API is connected, so a UPI payment cannot be confirmed from the UTR alone.
      // Auto-approve = unique, valid-looking UTR unlocks instantly; the owner is alerted and can reject (which revokes access).
      const reasons = uc.flags.slice(); let ok = true;
      if (!(await settings(c)).auto_approve) { ok = false; reasons.push('auto-approve is OFF — please check & approve'); }
      const v = null;
      const claim = randId(24), order_id = 'as_' + randId(9);
      const row = { order_id, payment_id: utr, status: ok ? 'paid' : 'pending', paid_at: ok ? new Date().toISOString() : null, service, amount_paise: amountRs * 100,
        name, phone, email: email ? email.toLowerCase() : null, visitor_id: str(b.visitor_id, 64), details: jsonCap(b.details, 8000),
        screenshot: sm && sm[2].length <= 700_000 ? shot : null, verdict: { auto: ok, mode: 'utr', reasons, ai: v }, meta: { claim: await sha256hex(claim), ip_country: meta.country, lang: str(b.lang, 4), base: q.base, coupon: q.coupon, offer: q.after !== q.base ? c.offerPct : 0 } };
      let ins; try { ins = await supa(c, PT, { method: 'POST', headers: { Prefer: 'return=representation' }, body: row }); } catch (e) { if (/duplicate|unique/i.test(e.message)) return json({ error: 'This UTR number has already been used for a booking.' }, 409); throw e; }
      const id = ins && ins[0] && ins[0].id;
      if (id) {
        const L = await quickLinks(c, id), d = row.details || {};
        const msg = `${ok ? '✅ *New booking — auto-approved on UTR*' : '⏳ *New booking — payment needs your OK*'}\n${CATALOG[service].label} · ₹${amountRs}${q.coupon ? ' (coupon ' + q.coupon + ')' : ''}\n${name} · ${phone}\n${d.dob ? 'DOB ' + d.dob + ' ' + (d.tob || '') + ' ' + (d.place || '') + '\n' : ''}${d.question ? 'Q: ' + String(d.question).slice(0, 300) + '\n' : ''}UTR ${utr}\n${reasons.length ? '⚠️ ' + reasons.join('; ') + '\n' : ''}${ok ? 'Check ₹' + amountRs + ' arrived in PhonePe with this UTR. If NOT, reject (access is removed): ' + L.reject : '✓ Approve: ' + L.approve + '\n✕ Reject: ' + L.reject}`;
        later(meta, notifyOwner(c, msg));
      }
      return json({ ok: true, order_id, claim, booking: id, amount: amountRs, status: ok ? 'paid' : 'pending', reasons: ok ? [] : reasons, token: ok && id ? await tokenFor(c, { id, service, phone }) : null, unlocks: UNLOCKS[service] });
    }
    if (b.action === 'upi_status') {
      if (!/^as_[\w-]+$/.test(String(b.order_id || '')) || !b.claim) return json({ error: 'Bad request' }, 400);
      const rows = await supa(c, `${PT}?select=id,status,meta,service,phone&order_id=eq.${b.order_id}&limit=1`);
      const r = rows && rows[0]; if (!r || !r.meta || !safeEq(r.meta.claim || '', await sha256hex(String(b.claim)))) return json({ error: 'Not found' }, 404);
      return json({ status: r.status, booking: r.id, token: r.status === 'paid' ? await tokenFor(c, r) : null, unlocks: UNLOCKS[r.service] });
    }
    if (b.action === 'restore') {
      if (limited('restore:' + meta.ip, 10, 60 * 60 * 1000)) return json({ error: 'Too many attempts. Please WhatsApp us.' }, 429);
      const utr = String(b.utr || '').replace(/\s/g, '').toUpperCase(), p10 = digits(b.phone).slice(-10);
      if (!/^\d{12}$/.test(utr) || p10.length !== 10) return json({ error: 'Enter your WhatsApp number and the 12-digit UTR number.' }, 400);
      const rows = await supa(c, `${PT}?select=id,status,service,phone&payment_id=eq.${encodeURIComponent(utr)}&limit=1`); const r = rows && rows[0];
      if (!r || digits(r.phone).slice(-10) !== p10) return json({ error: 'No booking found for these details.' }, 404);
      if (r.status !== 'paid') return json({ error: r.status === 'pending' ? 'Your payment is still being verified. Please wait a little.' : 'This payment was not approved. Please WhatsApp us.' }, 400);
      return json({ status: 'paid', booking: r.id, token: await tokenFor(c, r), unlocks: UNLOCKS[r.service] });
    }
    return json({ error: 'Unknown action' }, 400);
  } catch (e) { return json({ error: 'Could not save your booking. Please try again or WhatsApp us.' }, 502); }
}

/* ---------------- /api/report (Premium Report, unlocked by payment) ---------------- */
const REPORT_PROMPT = {
  kundli: `Write a detailed, warm PREMIUM JANAM KUNDLI REPORT for this person from the chart data below (Vedic, Lahiri). Sections with "## " headings:
## Overview (lagna, moon sign, nakshatra — personality in 4-5 lines)
## Career & Money
## Love & Marriage (include Manglik status meaning, gentle)
## Health & Energy (general wellbeing only — no diagnosis)
## Family & Home
## Current Dasha — what this period brings (use the running mahadasha/antardasha and the dates)
## Year Ahead ({YEAR}) — month-wise themes in a short list
## Strengths & Lucky Factors (colour, day, number, direction)
## Simple Remedies (mantra, daan, fasting day, seva — free or low-cost; gemstones only "after personal check")
Use "- " bullets where useful and **bold** for key words. 700-1000 words.`,
  numerology: `Write a detailed, warm PREMIUM NUMEROLOGY REPORT from the data below (Chaldean name number, Lo Shu grid). Sections with "## " headings:
## Your Core Numbers (Mulank, Bhagyank, Name number — meaning)
## Lo Shu Grid Insights (present planes, missing numbers and what they mean)
## Name Harmony (is the name number in harmony? if not, suggest 2-3 respelling ideas that move the total towards a friendly number, keeping the name recognisable)
## Lucky Numbers, Colours, Days & Directions
## Mobile / Vehicle / House Number Guidance
## Personal Year {YEAR} — month-wise themes
## Remedies for Missing Numbers
Use "- " bullets and **bold**. 600-900 words.`,
  tarot: `Write a PREMIUM CELTIC CROSS TAROT READING for the cards below (positions 1-10: Present, Challenge, Foundation/Past, Recent past, Possible outcome, Near future, Self, Environment, Hopes & fears, Final outcome). For the user's question (if given). Sections with "## " headings: one per position (card name + upright/reversed + meaning for this person), then ## Overall Message and ## Guidance & Next Steps. Use **bold**. 600-900 words. Be hopeful but honest; no fear-mongering.`
};
async function reportHandler(request, c, meta) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!aiOn(c)) return json({ error: 'Premium reports are not set up yet (GEMINI_API_KEY missing).' }, 503);
  let b; try { b = await body(request); } catch (e) { return json({ error: 'Bad request' }, 400); }
  const type = String(b.type || ''); if (!REPORTS.includes(type)) return json({ error: 'Unknown report' }, 400);
  const tok = await verifyToken(c, b.token); const u = tok && Array.isArray(tok.u) ? tok.u : [];
  if (!tok || !(u.includes('*') || u.includes(type))) return json({ error: 'Payment required', need: type }, 402);
  if (!tok.o && !(await rowStillPaid(c, tok.b))) return json({ error: 'This payment was not approved. Please WhatsApp us.' }, 402);
  if (!tok.o && limited('report:' + (tok.b || meta.ip), 6, 24 * 3600 * 1000)) return json({ error: 'Daily report limit reached for this booking. Please try tomorrow 🙏' }, 429);
  const data = JSON.stringify(b.data || {}).slice(0, 6000);
  const lang = b.lang === 'hi' ? 'Write the whole report in simple Hindi (Devanagari), keeping astrology terms natural.' : 'Write in simple English (Indian audience; Hindi astrology terms are fine).';
  const year = new Date(Date.now() + 330 * 60000).getUTCFullYear() + (new Date(Date.now() + 330 * 60000).getUTCMonth() >= 10 ? 1 : 0);
  try {
    const text = await gemini(c, { system: 'You are the senior Vedic astrologer, numerologist and tarot reader of Astro Shree (guided by Manasvi Bharadwaj). Be warm, specific, practical and honest. Never predict death, accidents, serious illness or exact tragedies; never give medical, legal or financial instructions; never guarantee outcomes; never push expensive remedies.', contents: [{ role: 'user', parts: [{ text: `${REPORT_PROMPT[type].replace(/\{YEAR\}/g, year)}\n${lang}\n\nDATA:\n${data}` }] }], temperature: 0.7, maxTokens: 4096, timeoutMs: 90000 });
    if (!text) return json({ error: 'Could not create the report. Please try again.' }, 502);
    later(meta, supaOn(c) ? supa(c, EV, { method: 'POST', headers: { Prefer: 'return=minimal' }, body: { event: 'lead', visitor_id: str(b.visitor_id, 64), consent: false, meta: { premium_report: type, booking: tok.b || 'owner' } } }).catch(() => { }) : Promise.resolve());
    return json({ text, type });
  } catch (e) { return json({ error: e.name === 'AbortError' ? 'Report took too long. Please try again.' : 'AI is busy. Please try again in a minute.' }, 502); }
}

/* ---------------- /api/admin ---------------- */
const clean = q => String(q || '').replace(/[^\p{L}\p{N}@.+\- ]/gu, '').trim().slice(0, 60);
async function adminHandler(request, c, meta) {
  const H = { 'x-robots-tag': 'noindex' };
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, H);
  if (c.admin.length < 8) return json({ error: 'Admin is not set up: add ADMIN_PASSWORD (8+ characters).' }, 500, H);
  if (!supaOn(c)) return json({ error: 'Database is not set up: add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' }, 500, H);
  let b; try { b = await body(request); } catch (e) { return json({ error: 'Bad JSON' }, 400, H); }
  if (!safeEq(b.password || '', c.admin)) { if (limited('adminfail:' + meta.ip, 8, 15 * 60 * 1000)) return json({ error: 'Too many wrong attempts. Try again in 15 minutes.' }, 429, H); return json({ error: 'Wrong password' }, 401, H); }
  const id = String(b.id || ''); const badId = () => !/^\d+$/.test(id);
  try {
    if (b.action === 'stats') {
      const since = new Date(Date.now() - 90 * 864e5).toISOString();
      const rows = await supa(c, `${EV}?select=created_at,event,visitor_id,consent,country,lang,page:meta->>page&created_at=gte.${since}&order=created_at.desc&limit=30000`);
      const pays = await supa(c, `${PT}?select=created_at,status,service,amount_paise&created_at=gte.${since}&order=created_at.desc&limit=5000`).catch(() => []);
      return json({ rows: rows || [], payments: pays || [] }, 200, H);
    }
    if (b.action === 'list') {
      let q = `${EV}?select=id,created_at,event,visitor_id,consent,name,phone,email,city,birth,meta,country,lang&order=id.desc&limit=${Math.min(1000, Math.max(1, +b.limit || 300))}`;
      if (b.event && /^[a-z_]+$/.test(b.event)) q += `&event=eq.${b.event}`;
      if (b.leads) q += `&consent=is.true&phone=not.is.null`;
      if (b.before && /^\d+$/.test(String(b.before))) q += `&id=lt.${b.before}`;
      const s = clean(b.q); if (s) { const p = encodeURIComponent(`*${s}*`); q += `&or=(name.ilike.${p},email.ilike.${p},phone.ilike.${p},city.ilike.${p})`; }
      return json({ rows: (await supa(c, q)) || [] }, 200, H);
    }
    if (b.action === 'payments') return json({ rows: (await supa(c, `${PT}?select=id,created_at,paid_at,order_id,payment_id,status,service,amount_paise,name,phone,email,details,verdict,fulfilled&order=id.desc&limit=1000`)) || [] }, 200, H);
    if (b.action === 'shot') { if (badId()) return json({ error: 'Bad id' }, 400, H); const r = await supa(c, `${PT}?select=screenshot&id=eq.${id}`); return json({ screenshot: (r && r[0] && r[0].screenshot) || null }, 200, H); }
    if (b.action === 'approve' || b.action === 'reject' || b.action === 'fulfil') {
      if (badId()) return json({ error: 'Bad id' }, 400, H);
      const patch = b.action === 'approve' ? { status: 'paid', paid_at: new Date().toISOString() } : b.action === 'reject' ? { status: 'rejected' } : { fulfilled: b.value !== false };
      const rows = await supa(c, `${PT}?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: patch });
      if (!rows || !rows.length) return json({ error: 'Booking not found' }, 404, H);
      const row = Object.assign({}, rows[0]); delete row.screenshot; return json({ ok: true, row }, 200, H);
    }
    if (b.action === 'settings') return json({ settings: await settings(c) }, 200, H);
    if (b.action === 'set_setting') {
      if (!['auto_approve'].includes(b.key)) return json({ error: 'Unknown setting' }, 400, H);
      await supa(c, `${ST}?on_conflict=key`, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: { key: b.key, value: !!b.value, updated_at: new Date().toISOString() } });
      setCache = { t: 0, v: null }; return json({ ok: true, settings: await settings(c) }, 200, H);
    }
    if (b.action === 'owner_token') return json({ token: await signToken(c, { u: ['*'], o: 1, t: Date.now() }), unlocks: ['*'] }, 200, H);
    if (b.action === 'reviews') return json({ rows: (await supa(c, `${RV}?select=*&order=id.desc&limit=500`)) || [] }, 200, H);
    if (b.action === 'review_status') {
      if (badId() || !['approved', 'hidden', 'pending'].includes(b.status)) return json({ error: 'Bad request' }, 400, H);
      await supa(c, `${RV}?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: { status: b.status } }); return json({ ok: true }, 200, H);
    }
    if (b.action === 'delete_person') {
      const p = []; if (b.phone && digits(b.phone).length >= 10) p.push(`phone.ilike.*${digits(b.phone).slice(-10)}*`); if (b.visitor_id && /^[\w-]+$/.test(b.visitor_id)) p.push(`visitor_id.eq.${b.visitor_id}`);
      if (!p.length) return json({ error: 'Nothing to delete' }, 400, H);
      await supa(c, `${EV}?or=(${p.join(',')})`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }); return json({ ok: true }, 200, H);
    }
    return json({ error: 'Unknown action' }, 400, H);
  } catch (e) { return json({ error: 'Database error: ' + e.message }, 502, H); }
}

/* ---------------- /api/quick (one-tap approve / reject from WhatsApp) ---------------- */
const page = (title, inner) => new Response(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><body style="font-family:system-ui,sans-serif;background:#fff8ee;display:grid;place-items:center;min-height:100vh;margin:0"><div style="background:#fff;padding:28px;border-radius:18px;box-shadow:0 10px 40px #0001;max-width:420px;width:90%;text-align:center">${inner}</div>`, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
async function quickHandler(request, c) {
  const u = new URL(request.url), seg = u.pathname.replace(/\/+$/, '').split('/').slice(3);
  const a = seg[0] || '', id = seg[1] || '', sig = seg[2] || '';
  if (!/^\d+$/.test(id) || !['approve', 'reject'].includes(a) || !safeEq(sig, await quickSig(c, id, a))) return page('Invalid link', '<h2>Invalid or expired link</h2>');
  const rows = await supa(c, `${PT}?select=id,status,name,phone,amount_paise,payment_id,service&id=eq.${id}`); const r = rows && rows[0];
  if (!r) return page('Not found', '<h2>Booking not found</h2>');
  const info = `<p style="color:#555">${escH(r.name)} · ${escH(r.phone)}<br>${escH((CATALOG[r.service] || {}).label || r.service)} · ₹${(r.amount_paise || 0) / 100}<br>UTR <b>${escH(r.payment_id)}</b><br>Current status: <b>${escH(r.status)}</b></p>`;
  if (request.method !== 'POST') return page('Confirm', `<h2>${a === 'approve' ? '✓ Approve' : '✕ Reject'} this payment?</h2>${info}<form method="post"><button style="margin-top:10px;padding:14px 22px;border:0;border-radius:12px;font-size:16px;font-weight:700;background:${a === 'approve' ? '#16a34a' : '#dc2626'};color:#fff;width:100%">${a === 'approve' ? 'Yes, money received — approve' : 'Reject — money not received'}</button></form>`);
  await supa(c, `${PT}?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: a === 'approve' ? { status: 'paid', paid_at: new Date().toISOString() } : { status: 'rejected' } });
  const p10 = digits(r.phone).slice(-10);
  const wa = p10.length === 10 ? `https://wa.me/91${p10}?text=${encodeURIComponent(a === 'approve' ? `Radhe Radhe ${r.name || ''} 🙏 Your Astro-Shree booking (#${r.id}) is confirmed ✅. Manasvi ji will connect with you soon.` : `Radhe Radhe ${r.name || ''} 🙏 We could not find your payment for booking #${r.id} (UTR ${r.payment_id}). Please reply with the correct 12-digit UTR number.`)}` : '';
  return page('Done', `<h2>${a === 'approve' ? '✅ Approved' : '❌ Rejected'}</h2>${info.replace(/Current status: <b>[^<]*<\/b>/, 'Status: <b>' + (a === 'approve' ? 'paid' : 'rejected') + '</b>')}${wa ? `<a href="${wa}" style="display:block;margin-top:12px;padding:12px;border-radius:12px;background:#25d366;color:#fff;text-decoration:none;font-weight:700">💬 Tell the customer on WhatsApp</a>` : ''}`);
}

// JSON version of the one-tap links (used by quick.html, so it works where the API cannot serve HTML pages)
async function quickJson(request, c) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!supaOn(c)) return json({ error: 'Database is not set up' }, 500);
  let b; try { b = await body(request); } catch (e) { return json({ error: 'Bad request' }, 400); }
  const a = String(b.a || ''), id = String(b.id || ''), sig = String(b.s || '');
  if (!/^\d+$/.test(id) || !['approve', 'reject'].includes(a) || !safeEq(sig, await quickSig(c, id, a))) return json({ error: 'Invalid or expired link' }, 403);
  const rows = await supa(c, `${PT}?select=id,status,name,phone,amount_paise,payment_id,service&id=eq.${id}`); const r = rows && rows[0];
  if (!r) return json({ error: 'Booking not found' }, 404);
  const info = { id: r.id, name: r.name, phone: r.phone, service: (CATALOG[r.service] || {}).label || r.service, amount: (r.amount_paise || 0) / 100, utr: r.payment_id, status: r.status };
  if (!b.confirm) return json({ action: a, info });
  await supa(c, `${PT}?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: a === 'approve' ? { status: 'paid', paid_at: new Date().toISOString() } : { status: 'rejected' } });
  const p10 = digits(r.phone).slice(-10);
  const wa = p10.length === 10 ? `https://wa.me/91${p10}?text=${encodeURIComponent(a === 'approve' ? `Radhe Radhe ${r.name || ''} 🙏 Your Astro-Shree booking (#${r.id}) is confirmed ✅. Manasvi ji will connect with you soon.` : `Radhe Radhe ${r.name || ''} 🙏 We could not find your payment for booking #${r.id} (UTR ${r.payment_id}). Please reply with the correct 12-digit UTR number.`)}` : '';
  info.status = a === 'approve' ? 'paid' : 'rejected';
  return json({ done: true, action: a, info, wa });
}

/* ---------------- router ---------------- */
export async function handle(request, env, meta = {}) {
  const c = cfg(env || {}), path = new URL(request.url).pathname.replace(/\/+$/, '');
  meta = { ip: meta.ip || 'x', country: meta.country || null, waitUntil: meta.waitUntil };
  try {
    if (path === '/api/config') return await configHandler(c);
    if (path === '/api/log') return await logHandler(request, c, meta);
    if (path === '/api/chat') return await chatHandler(request, c, meta);
    if (path === '/api/pay') return await payHandler(request, c, meta);
    if (path === '/api/reviews') return await reviewsHandler(request, c, meta);
    if (path === '/api/report') return await reportHandler(request, c, meta);
    if (path === '/api/admin') return await adminHandler(request, c, meta);
    if (path === '/api/quick') return await quickJson(request, c);
    if (path.startsWith('/api/quick/')) { try { return await quickHandler(request, c); } catch (e) { return page('Error', '<h2>Could not update</h2><p>Open /admin → Bookings and approve there.</p>'); } }
    return json({ error: 'Not found' }, 404);
  } catch (e) { return json({ error: 'Server error' }, 500); }
}
export { CATALOG, quote, cfg, signToken, verifyToken };
