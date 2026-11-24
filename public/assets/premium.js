/* Astro Shree — Premium Reports: unlocked instantly after payment (signed token on this device) */
(function () {
  'use strict';
  const App = window.App, { $, $$, esc, T, LS, toast, log } = App;
  const J = () => window.Jyotish, AS = () => window.AS;
  const TYPES = {
    kundli: { ic: '🪐', en: 'Premium Kundli Report', hi: 'प्रीमियम कुंडली रिपोर्ट', d: ['Career, marriage, health, dasha, year ahead & remedies', 'करियर, विवाह, स्वास्थ्य, दशा, आने वाला साल और उपाय'], from: 'prashn' },
    numerology: { ic: '🔢', en: 'Premium Numerology Report', hi: 'प्रीमियम अंक ज्योतिष रिपोर्ट', d: ['Lo Shu insights, name correction, lucky numbers & year ahead', 'लो शू, नाम सुधार, शुभ अंक और आने वाला साल'], from: 'num_name' },
    tarot: { ic: '🔮', en: 'Premium Celtic Cross Tarot', hi: 'प्रीमियम केल्टिक क्रॉस टैरो', d: ['10-card deep reading for your question', 'आपके सवाल पर 10 कार्ड की गहरी रीडिंग'], from: 'tarot_one' }
  };

  /* ---------- tokens ---------- */
  App.tokens = () => LS.get('as_tokens', []);
  App.addToken = (token, unlocks, booking) => { if (!token) return; const t = App.tokens().filter(x => x.token !== token); t.push({ token, unlocks: unlocks || [], booking, at: Date.now() }); LS.set('as_tokens', t.slice(-20)); };
  App.tokenFor = type => { const t = App.tokens().slice().reverse().find(x => (x.unlocks || []).includes('*') || (x.unlocks || []).includes(type)); return t && t.token; };
  App.unlocked = type => !!App.tokenFor(type);

  // check bookings that were pending (approved later by admin) — runs on start and on the My Reports page
  App.checkPending = async function (silent) {
    const list = LS.get('as_bookings', []), have = new Set(App.tokens().map(t => t.booking)); let got = 0;
    for (const bk of list.filter(b => b.order && b.claim && !have.has(b.id) && Date.now() - b.t < 30 * 864e5).slice(-5)) {
      try { const r = await fetch(AS_API + '/api/pay', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'upi_status', order_id: bk.order, claim: bk.claim }) });
        const j = await r.json(); if (j && j.token) { App.addToken(j.token, j.unlocks, j.booking); got++; } } catch (e) { }
    }
    if (got && !silent) toast('🎉 ' + T('Payment approved! Your Premium Report is unlocked — open "My Reports".', 'भुगतान स्वीकृत! आपकी प्रीमियम रिपोर्ट खुल गई — "मेरी रिपोर्ट" खोलें।'), 6000);
    return got;
  };

  /* ---------- tiny markdown ---------- */
  function md(text) {
    const lines = esc(text).split('\n'); let out = '', inList = false;
    const inline = s => s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
    lines.forEach(l => {
      const t = l.trim();
      if (/^[-•*]\s+/.test(t)) { if (!inList) { out += '<ul>'; inList = true; } out += `<li>${inline(t.replace(/^[-•*]\s+/, ''))}</li>`; return; }
      if (inList) { out += '</ul>'; inList = false; }
      if (/^#{1,3}\s+/.test(t)) out += `<h3>${inline(t.replace(/^#{1,3}\s+/, ''))}</h3>`; else if (t) out += `<p>${inline(t)}</p>`;
    });
    return out + (inList ? '</ul>' : '');
  }

  /* ---------- data for each report ---------- */
  function kundliData() {
    const k = LS.get('as_me'); if (!k || !k.planets) return null;
    const s = App.chartSummary(k);
    s.dashas = (k.dashas || []).filter(d => new Date(d.end) > new Date()).slice(0, 3).map(d => `${d.lord} ${String(d.start).slice(0, 10)} → ${String(d.end).slice(0, 10)}`);
    s.gender = k.gender === 'f' ? 'female' : 'male'; s.gana = k.gana; s.nadi = k.nadi; return s;
  }
  function numData(name, dob) {
    const n = AS().numerology(dob, name), py = AS().personalYear(dob, new Date().getFullYear() + (new Date().getMonth() >= 10 ? 1 : 0));
    return { name, dob, mulank: n.mulank, bhagyank: n.bhagyank, name_number: n.name, name_in_harmony: n.nameOk, lo_shu_counts: n.grid.slice(1), missing: n.missing, planes: n.planes.map(p => p.en), personal_year_next: py, lucky: n.luckyNumbers };
  }
  const CELTIC = [['Present', 'वर्तमान'], ['Challenge', 'चुनौती'], ['Foundation', 'नींव'], ['Recent past', 'हाल का अतीत'], ['Possible outcome', 'संभावित परिणाम'], ['Near future', 'निकट भविष्य'], ['You', 'आप'], ['Environment', 'वातावरण'], ['Hopes & fears', 'आशा व डर'], ['Final outcome', 'अंतिम परिणाम']];

  async function generate(type, data, out) {
    const token = App.tokenFor(type); if (!token) return;
    out.innerHTML = `<div class="card center"><span class="loading"></span> ${T('Creating your Premium Report… (30–60 seconds)', 'आपकी प्रीमियम रिपोर्ट बन रही है… (30–60 सेकंड)')}</div>`; out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    try {
      const r = await fetch(AS_API + '/api/report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type, token, data, lang: App.lang, visitor_id: App.vid }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Error');
      const rep = { type, text: j.text, at: Date.now(), title: data && (data.name || data.question) || '' };
      LS.set('as_reports', [rep].concat(LS.get('as_reports', [])).slice(0, 12)); if (App._paintSaved) App._paintSaved(); log('lead', { meta: { premium_report_view: type } });
      showReport(out, rep);
    } catch (e) { out.innerHTML = `<div class="card center" style="color:var(--bad)">🙏 ${esc(e.message)}</div>`; }
  }
  function showReport(out, rep) {
    const t = TYPES[rep.type];
    out.innerHTML = `<div class="card report"><div class="row between no-print"><span class="kicker">${t.ic} ${T(t.en, t.hi)}</span><div class="row"><button class="btn btn-ghost btn-sm" onclick="print()">🖨️ ${T('Print / PDF', 'प्रिंट / PDF')}</button><button class="btn btn-ghost btn-sm" data-wa>💬 ${T('Discuss with Manasvi ji', 'मानसवी जी से चर्चा')}</button></div></div>
      <div class="print-head"><img src="images/logo-full-light.svg" alt="Astro Shree" style="width:240px;margin:0 auto 10px"></div>
      <h2 style="margin-top:6px">${esc(rep.title || T(t.en, t.hi))}</h2><div class="tiny muted">${App.fmtDate(new Date(rep.at))}</div><div class="md">${md(rep.text)}</div>
      <p class="tiny muted" style="margin-top:16px">${T('Guidance based on traditional principles; results vary and are not guaranteed. Not a substitute for medical, legal or financial advice.', 'पारंपरिक सिद्धांतों पर आधारित मार्गदर्शन; परिणाम अलग हो सकते हैं, गारंटी नहीं। चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।')}</p></div>`;
    $('[data-wa]', out).onclick = () => window.open(App.waLink(`Radhe Radhe 🙏 I received my ${t.en}. I want to discuss it.`), '_blank', 'noopener');
  }

  /* ---------- My Reports page ---------- */
  App.routes.my = async function (v) {
    const me = LS.get('as_me');
    v.innerHTML = App.phead('📜 ' + T('My Premium Reports', 'मेरी प्रीमियम रिपोर्ट'), T('Book any reading and your Premium Report unlocks instantly on this phone — plus Manasvi ji\'s personal guidance on WhatsApp.', 'कोई भी रीडिंग बुक करें — प्रीमियम रिपोर्ट इसी फ़ोन पर तुरंत खुल जाती है, साथ में मानसवी जी का व्यक्तिगत मार्गदर्शन WhatsApp पर।')) +
      `<section class="sec-sm"><div class="wrap"><div class="grid g3" id="myCards"></div><div id="myWork" style="margin-top:20px"></div><div id="myOut" style="margin-top:20px"></div>
      <div class="grid g2" style="margin-top:26px"><div class="card"><h3>🗂️ ${T('Saved reports', 'सेव रिपोर्ट')}</h3><div id="mySaved"></div></div>
      <div class="card"><h3>🔑 ${T('Restore access', 'एक्सेस वापस पाएँ')}</h3><p class="small muted">${T('Paid on another phone or cleared your browser? Enter the WhatsApp number and UTR you paid with.', 'दूसरे फ़ोन से भुगतान किया या ब्राउज़र साफ़ हुआ? भुगतान वाला WhatsApp नंबर और UTR डालें।')}</p>
        <div class="fgrid"><input class="inp" id="rsPhone" inputmode="tel" placeholder="${T('WhatsApp number', 'WhatsApp नंबर')}" value="${esc((LS.get('as_who') || {}).phone || '')}"><input class="inp" id="rsUtr" placeholder="UTR"></div><button class="btn btn-violet btn-sm" style="margin-top:10px" id="rsGo">${T('Restore', 'वापस पाएँ')}</button></div></div></div></section>`;
    const paintCards = () => {
      $('#myCards').innerHTML = Object.entries(TYPES).map(([k, t]) => { const ok = App.unlocked(k); return `<div class="card premium-card ${ok ? 'ok' : ''}"><div class="row between"><span style="font-size:2rem">${t.ic}</span><span class="pill ${ok ? 'g' : 'y'}">${ok ? '✓ ' + T('Unlocked', 'खुली है') : '🔒 ' + T('Locked', 'बंद')}</span></div>
        <h3 style="margin-top:8px">${T(t.en, t.hi)}</h3><p class="small muted">${T(t.d[0], t.d[1])}</p>
        ${ok ? `<button class="btn btn-gold btn-block" data-gen="${k}">✨ ${T('Create my report', 'मेरी रिपोर्ट बनाएँ')}</button>` : `<button class="btn btn-violet btn-block" data-book="${t.from}">${T('Unlock — book from', 'खोलें — बुकिंग सिर्फ़')} ₹${App.after(t.from)}</button><div class="tiny muted center" style="margin-top:6px">${T('Any ' + k + ' or combo booking unlocks it', 'कोई भी ' + T2(k) + ' या कॉम्बो बुकिंग से खुलेगी')}</div>`}</div>`; }).join('');
      $$('[data-gen]', v).forEach(b => b.onclick = () => work(b.dataset.gen));
    };
    const T2 = k => ({ kundli: 'ज्योतिष', numerology: 'अंक ज्योतिष', tarot: 'टैरो' }[k]);
    const work = type => {
      const w = $('#myWork'), out = $('#myOut'); out.innerHTML = '';
      if (type === 'kundli') {
        const d = kundliData();
        if (!d) { w.innerHTML = `<div class="card center"><p>${T('First make your free Kundli — the report is written from your chart.', 'पहले अपनी फ़्री कुंडली बनाएँ — रिपोर्ट आपकी कुंडली से लिखी जाएगी।')}</p><a class="btn btn-gold" href="#/kundli">🪐 ${T('Make Kundli', 'कुंडली बनाएँ')}</a></div>`; return; }
        w.innerHTML = `<div class="card"><p>🪐 ${T('Report for', 'रिपोर्ट')}: <b>${esc(d.name || '')}</b> · ${esc(d.birth || '')} — <a href="#/kundli">${T('change', 'बदलें')}</a></p><button class="btn btn-gold" id="go">✨ ${T('Generate Premium Kundli Report', 'प्रीमियम कुंडली रिपोर्ट बनाएँ')}</button></div>`;
        $('#go').onclick = () => generate('kundli', d, out);
      } else if (type === 'numerology') {
        w.innerHTML = `<div class="card"><div class="fgrid"><div><label class="f">${T('Full name', 'पूरा नाम')}</label><input class="inp" id="nn" value="${esc(me && me.name || '')}"></div><div><label class="f">${T('Date of birth', 'जन्म तिथि')}</label><input class="inp" type="date" id="nd" value="${esc(me && me.input ? me.input.date : '')}"></div></div><button class="btn btn-gold" style="margin-top:12px" id="go">✨ ${T('Generate Premium Numerology Report', 'प्रीमियम अंक ज्योतिष रिपोर्ट बनाएँ')}</button></div>`;
        $('#go').onclick = () => { const name = $('#nn').value.trim(), dob = $('#nd').value; if (!name || !dob) return toast(T('Please enter name and date of birth', 'कृपया नाम और जन्म तिथि डालें')); generate('numerology', numData(name, dob), out); };
      } else {
        w.innerHTML = `<div class="card center"><input class="inp" id="tq" style="display:block;max-width:560px;margin:0 auto 12px" placeholder="${T('Your question (love, career, decision…)', 'आपका सवाल (प्रेम, करियर, निर्णय…)')}"><button class="btn btn-violet" id="draw">🔀 ${T('Shuffle & draw 10 cards', 'फेंटें और 10 कार्ड निकालें')}</button><div class="celtic" id="cc"></div><button class="btn btn-gold hide" id="go" style="margin-top:14px">✨ ${T('Read my cards', 'मेरे कार्ड पढ़ें')}</button></div>`;
        let cards = [];
        $('#draw').onclick = () => { cards = AS().drawCards(10); $('#cc').innerHTML = cards.map((c, i) => `<div class="cc-item"><div class="mini-card ${c.reversed ? 'rev' : ''}"><span>${c.sym}</span><b>${T(c.en, c.hi)}</b>${c.reversed ? `<i>${T('Reversed', 'उल्टा')}</i>` : ''}</div><small>${i + 1}. ${T(CELTIC[i][0], CELTIC[i][1])}</small></div>`).join(''); $('#go').classList.remove('hide'); };
        $('#go').onclick = () => generate('tarot', { question: $('#tq').value.trim(), cards: cards.map((c, i) => `${i + 1}. ${CELTIC[i][0]}: ${c.en}${c.reversed ? ' (reversed)' : ''}`) }, out);
      }
      w.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    const paintSaved = () => { const s = LS.get('as_reports', []); $('#mySaved').innerHTML = s.length ? s.map((r, i) => `<div class="vrow"><span>${TYPES[r.type].ic}</span><span style="flex:1">${T(TYPES[r.type].en, TYPES[r.type].hi)}${r.title ? ' · ' + esc(r.title).slice(0, 40) : ''}<div class="tiny muted">${App.fmtDate(new Date(r.at))}</div></span><button class="btn btn-ghost btn-sm" data-open="${i}">${T('Open', 'खोलें')}</button></div>`).join('') : `<p class="muted small">${T('No reports yet.', 'अभी कोई रिपोर्ट नहीं।')}</p>`;
      $$('[data-open]', v).forEach(b => b.onclick = () => { showReport($('#myOut'), s[+b.dataset.open]); $('#myOut').scrollIntoView({ behavior: 'smooth' }); }); };
    $('#rsGo').onclick = async () => {
      try { const r = await fetch(AS_API + '/api/pay', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'restore', phone: $('#rsPhone').value, utr: $('#rsUtr').value }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Error');
        App.addToken(j.token, j.unlocks, j.booking); toast('✅ ' + T('Access restored!', 'एक्सेस वापस मिल गया!')); paintCards(); } catch (e) { toast(e.message, 5000); }
    };
    App._paintSaved = paintSaved; paintCards(); paintSaved();
    if (await App.checkPending(true)) { paintCards(); toast('🎉 ' + T('Payment approved — report unlocked!', 'भुगतान स्वीकृत — रिपोर्ट खुल गई!')); }
  };

  document.addEventListener('DOMContentLoaded', () => setTimeout(() => App.checkPending(false), 2500));
})();
