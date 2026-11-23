/* Astro-Shree admin dashboard (owner only) */
(function () {
  'use strict';
  const $ = (s, el) => (el || document).querySelector(s), $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const SVC = { prashn: 'Ek Prashn', milan: 'Kundli Milan', kundli_report: 'Kundli report', call: '1:1 Call', sampoorna: 'Sampoorna', num_name: 'Name number', num_report: 'Numerology report', num_baby: 'Baby/Business name', tarot_one: 'Tarot 1Q', tarot_celtic: 'Celtic Cross', tarot_live: 'Live Tarot' };
  const fmt = d => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  let pw = sessionStorage.getItem('as_admin') || '', tab = 'overview', query = '';
  const app = $('#app');
  async function api(action, extra) {
    const r = await fetch('/api/admin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ password: pw, action }, extra || {})) });
    const j = await r.json(); if (r.status === 401) { pw = ''; sessionStorage.removeItem('as_admin'); login(j.error); throw new Error(j.error); } if (!r.ok) throw new Error(j.error || 'Error'); return j;
  }
  const toast = m => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 3000); };
  const csv = (rows, cols, name) => { const s = [cols.join(',')].concat(rows.map(r => cols.map(c => { let v = r[c]; if (v && typeof v === 'object') v = JSON.stringify(v); return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(','))).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + s], { type: 'text/csv' })); a.download = name + '.csv'; a.click(); };
  const waTo = (phone, text) => { const p = String(phone || '').replace(/\D/g, '').slice(-10); return p.length === 10 ? `https://wa.me/91${p}?text=${encodeURIComponent(text)}` : ''; };

  function login(err) {
    app.innerHTML = `<div class="card" style="max-width:420px;margin:60px auto"><h2>🔐 Admin login</h2>${err ? `<p style="color:var(--bad)">${esc(err)}</p>` : ''}<input class="inp" type="password" id="pw" placeholder="Admin password"><button class="btn btn-gold btn-block" style="margin-top:12px" id="go">Login</button></div>`;
    const go = () => { pw = $('#pw').value; sessionStorage.setItem('as_admin', pw); render(); }; $('#go').onclick = go; $('#pw').onkeydown = e => { if (e.key === 'Enter') go(); };
  }
  function shell() {
    app.innerHTML = `<div class="tabs" style="justify-content:flex-start">${[['overview', '📊 Overview'], ['bookings', '🙏 Bookings'], ['leads', '👥 Leads'], ['activity', '🪐 Activity'], ['reviews', '💬 Reviews']].map(t => `<button data-t="${t[0]}" class="${tab === t[0] ? 'on' : ''}">${t[1]}</button>`).join('')}</div><div id="pane"><span class="loading"></span></div>`;
    $$('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; render(); });
  }
  async function render() {
    if (!pw) return login(); shell(); const pane = $('#pane');
    try {
      if (tab === 'overview') {
        const { rows, payments } = await api('stats'), since = Date.now() - 30 * 864e5, r30 = rows.filter(r => +new Date(r.created_at) > since);
        const cnt = e => r30.filter(r => r.event === e).length, uniq = new Set(r30.map(r => r.visitor_id)).size;
        const paid = payments.filter(p => p.status === 'paid'), rev = paid.reduce((s, p) => s + p.amount_paise / 100, 0), pend = payments.filter(p => p.status === 'pending').length;
        const days = [...Array(14)].map((_, i) => { const d = new Date(Date.now() - (13 - i) * 864e5).toISOString().slice(0, 10); return [d.slice(5), rows.filter(r => r.created_at.slice(0, 10) === d && r.event === 'page').length, rows.filter(r => r.created_at.slice(0, 10) === d && r.event === 'kundli').length]; });
        const mx = Math.max(1, ...days.map(d => d[1]));
        const pages = {}; r30.filter(r => r.event === 'page').forEach(r => { pages[r.page || 'home'] = (pages[r.page || 'home'] || 0) + 1; });
        let sets = { auto_approve: true }; try { sets = (await api('settings')).settings || sets; } catch (e) { }
        pane.innerHTML = `<div class="card" style="margin-bottom:14px;display:flex;gap:18px;flex-wrap:wrap;align-items:center;justify-content:space-between">
          <label class="check" style="margin:0;font-size:1rem"><input type="checkbox" id="autoAp" ${sets.auto_approve ? 'checked' : ''}> <span><b>⚡ Auto-approve payments</b><br><span class="small muted">ON: when the AI check passes, the booking is confirmed and the Premium Report unlocks instantly. OFF: every payment waits for your ✓.</span></span></label>
          <button class="btn btn-gold" id="unlockAll">🔓 Unlock all Premium Reports on this device</button></div>
        ${pend ? `<div class="card" style="background:#fff8e6;margin-bottom:14px">⏳ <b>${pend} booking${pend > 1 ? 's' : ''} waiting for payment approval.</b> Check your UPI app and approve in Bookings.</div>` : ''}
          <div class="grid g4">${[[uniq, 'Visitors (30d)'], [cnt('kundli'), 'Kundlis (30d)'], [cnt('milan'), 'Milans (30d)'], [cnt('tarot'), 'Tarot draws (30d)'], [cnt('game'), 'Games played (30d)'], [cnt('chat'), 'AI chats (30d)'], [r30.filter(r => r.consent).length, 'New leads (30d)'], ['₹' + rev.toLocaleString('en-IN'), 'Revenue (90d)'], [paid.length, 'Paid bookings (90d)'], [pend, 'Pending approval']].map(k => `<div class="card"><div class="k">${k[0]}</div><div class="muted small">${k[1]}</div></div>`).join('')}</div>
          <div class="grid g2" style="margin-top:16px"><div class="card"><h3>Last 14 days (page views · kundlis)</h3><div style="display:flex;align-items:flex-end;gap:6px;height:160px">${days.map(d => `<div style="flex:1;text-align:center"><div title="${d[1]} views, ${d[2]} kundlis" style="height:${d[1] / mx * 130}px;background:linear-gradient(#f59e0b,#f97316);border-radius:6px 6px 0 0"></div><div class="tiny muted">${d[0]}</div></div>`).join('')}</div></div>
          <div class="card"><h3>Top pages (30d)</h3><table class="t">${Object.entries(pages).sort((a, b) => b[1] - a[1]).slice(0, 10).map(p => `<tr><td>${esc(p[0])}</td><td><b>${p[1]}</b></td></tr>`).join('')}</table></div></div>`;
        $('#autoAp').onchange = async e => { try { await api('set_setting', { key: 'auto_approve', value: e.target.checked }); toast(e.target.checked ? 'Auto-approve ON' : 'Auto-approve OFF — you approve every payment'); } catch (er) { toast(er.message); } };
        $('#unlockAll').onclick = async () => { try { const j = await api('owner_token'); const t = JSON.parse(localStorage.getItem('as_tokens') || '[]'); t.push({ token: j.token, unlocks: j.unlocks, booking: 'owner', at: Date.now() }); localStorage.setItem('as_tokens', JSON.stringify(t)); toast('🔓 All Premium Reports unlocked on this device'); } catch (e) { toast(e.message); } };
      }
      if (tab === 'bookings') {
        const { rows } = await api('payments');
        pane.innerHTML = `<div class="row between"><h3>Bookings (${rows.length})</h3><button class="btn btn-ghost btn-sm" id="exp">⬇️ CSV</button></div><div class="card scroll"><table class="t"><tr><th>When</th><th>#</th><th>Status</th><th>Service</th><th>₹</th><th>Customer</th><th>Details</th><th>UTR / check</th><th>Actions</th></tr>
          ${rows.map(p => { const d = p.details || {}, ok = p.status === 'paid'; return `<tr style="${p.status === 'pending' ? 'background:#fff8e6' : ''}"><td class="small">${fmt(p.created_at)}</td><td>${p.id}</td><td><span class="pill ${ok ? 'g' : p.status === 'rejected' ? 'r' : 'y'}">${esc(p.status)}</span>${p.fulfilled ? ' <span class="pill g">delivered</span>' : ''}</td>
            <td>${esc(SVC[p.service] || p.service)}</td><td>${p.amount_paise / 100}</td><td><b>${esc(p.name)}</b><br><span class="small">${esc(p.phone)}</span></td>
            <td class="small" style="max-width:280px">${d.dob ? `🎂 ${esc(d.dob)} ${esc(d.tob || '')} ${esc(d.place || '')}<br>` : ''}${d.partner ? `💞 ${esc(d.partner)}<br>` : ''}${d.extra ? `📝 ${esc(d.extra)}<br>` : ''}${d.question ? `❓ ${esc(d.question)}<br>` : ''}${d.slot ? `🕐 ${esc(d.slot)}` : ''}</td>
            <td class="small"><code>${esc(p.payment_id)}</code><br>${p.verdict ? (p.verdict.auto ? '🤖 auto-verified' : '⚠️ ' + esc((p.verdict.reasons || []).join('; '))) : ''}<br><button class="btn btn-ghost btn-sm" data-shot="${p.id}">📷</button></td>
            <td style="white-space:nowrap">${!ok ? `<button class="btn btn-green btn-sm" data-a="approve" data-id="${p.id}">✓</button> ` : ''}${p.status !== 'rejected' ? `<button class="btn btn-ghost btn-sm" data-a="reject" data-id="${p.id}">✕</button> ` : ''}${ok ? `<button class="btn btn-ghost btn-sm" data-a="fulfil" data-id="${p.id}" data-v="${!p.fulfilled}">${p.fulfilled ? '↺' : '✔ delivered'}</button> ` : ''}
              ${waTo(p.phone, `Radhe Radhe ${p.name || ''} 🙏 This is Manasvi from Astro-Shree about your booking #${p.id} (${SVC[p.service] || p.service}).`) ? `<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${waTo(p.phone, `Radhe Radhe ${p.name || ''} 🙏 This is Manasvi from Astro-Shree about your booking #${p.id} (${SVC[p.service] || p.service}).`)}">💬</a>` : ''}</td></tr>`; }).join('')}</table></div>`;
        $('#exp').onclick = () => csv(rows, ['id', 'created_at', 'status', 'service', 'amount_paise', 'name', 'phone', 'email', 'payment_id', 'details', 'fulfilled'], 'astro-bookings');
        $$('[data-a]').forEach(b => b.onclick = async () => { if (b.dataset.a !== 'fulfil' && !confirm(b.dataset.a === 'approve' ? 'Money received in your UPI app? Approve?' : 'Reject this payment?')) return; try { await api(b.dataset.a, { id: b.dataset.id, value: b.dataset.v === 'true' }); toast('Updated'); render(); } catch (e) { toast(e.message); } });
        $$('[data-shot]').forEach(b => b.onclick = async () => { try { const j = await api('shot', { id: b.dataset.shot }); if (!j.screenshot) return toast('No screenshot'); const m = document.createElement('div'); m.className = 'modal-bg'; m.innerHTML = '<img style="max-width:min(480px,95vw);max-height:92vh;border-radius:12px;background:#fff">'; m.firstChild.src = j.screenshot; m.onclick = () => m.remove(); document.body.appendChild(m); } catch (e) { toast(e.message); } });
      }
      if (tab === 'leads' || tab === 'activity') {
        const leads = tab === 'leads', { rows } = await api('list', { leads, limit: 1000, q: query });
        pane.innerHTML = `<div class="row between"><h3>${leads ? 'Leads — people who agreed to be contacted' : 'Recent activity'} (${rows.length})</h3><div class="row"><input class="inp" id="q" placeholder="Search name / phone / city" style="width:240px" value="${esc(query)}"><button class="btn btn-ghost btn-sm" id="exp">⬇️ CSV</button></div></div>
          <div class="card scroll"><table class="t"><tr><th>When</th><th>Event</th><th>Name</th><th>Phone</th><th>City</th><th>Birth / details</th><th></th></tr>${rows.filter(r => leads || r.event !== 'page').map(r => `<tr><td class="small">${fmt(r.created_at)}</td><td><span class="pill">${esc(r.event)}</span></td><td>${esc(r.name || '')}</td><td>${esc(r.phone || '')}</td><td>${esc(r.city || r.country || '')}</td>
            <td class="small">${r.birth ? esc(`${r.birth.date || ''} ${r.birth.time || ''} ${r.birth.place || ''}`) : ''} ${r.meta ? '<span class="muted">' + esc(JSON.stringify(r.meta)).slice(0, 140) + '</span>' : ''}</td><td>${r.phone ? `<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${waTo(r.phone, `Radhe Radhe ${r.name || ''} 🙏 This is Manasvi from Astro-Shree.`)}">💬</a>` : ''}</td></tr>`).join('')}</table></div>`;
        $('#q').onchange = e => { query = e.target.value; render(); }; $('#exp').onclick = () => csv(rows, ['created_at', 'event', 'name', 'phone', 'email', 'city', 'birth', 'meta', 'country'], leads ? 'astro-leads' : 'astro-activity');
      }
      if (tab === 'reviews') {
        const { rows } = await api('reviews');
        pane.innerHTML = `<h3>Reviews (${rows.length}) — only approved ones show on the website</h3><div class="grid g3">${rows.map(r => `<div class="card"><div class="row between"><b>${esc(r.name)}</b><span class="pill ${r.status === 'approved' ? 'g' : r.status === 'hidden' ? 'r' : 'y'}">${esc(r.status)}</span></div><div class="stars-row">${'★'.repeat(r.rating)}</div><p>${esc(r.text)}</p><div class="small muted">${esc(r.city || '')} · ${fmt(r.created_at)}</div>
          <div class="row" style="margin-top:8px">${r.status !== 'approved' ? `<button class="btn btn-green btn-sm" data-r="approved" data-id="${r.id}">Approve</button>` : ''}${r.status !== 'hidden' ? `<button class="btn btn-ghost btn-sm" data-r="hidden" data-id="${r.id}">Hide</button>` : ''}</div></div>`).join('') || '<p class="muted">No reviews yet.</p>'}</div>`;
        $$('[data-r]').forEach(b => b.onclick = async () => { try { await api('review_status', { id: b.dataset.id, status: b.dataset.r }); render(); } catch (e) { toast(e.message); } });
      }
    } catch (e) { if (pw) pane.innerHTML = `<div class="card" style="color:var(--bad)">${esc(e.message)}</div>`; }
  }
  $('#out').onclick = () => { pw = ''; sessionStorage.removeItem('as_admin'); login(); };
  render();
})();
