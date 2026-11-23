/* Astro-Shree — core: language, router, layout, home, seva (UPI booking), Shree AI chat, policies */
(function () {
  'use strict';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const $ = (s, el) => (el || document).querySelector(s), $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  let lang = LS.get('as_lang', (navigator.language || '').startsWith('hi') ? 'hi' : 'en');
  const T = (en, hi) => (lang === 'hi' && hi ? hi : en);
  const vid = (() => { let v = LS.get('as_vid'); if (!v) { v = 'v' + Math.random().toString(36).slice(2) + Date.now().toString(36); LS.set('as_vid', v); } return v; })();
  const WA = '918484013977', PHONE = '+91 84840 13977', INSTA = 'https://www.instagram.com/astro_shree25_/';
  const DEFAULT_UPI = { id: '8484013977@ybl', name: 'Astro Shree' }; // PhonePe UPI ID
  const waLink = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const todayKey = () => { try { return new Date().toLocaleDateString('en-CA', { timeZone: (window.App && App.tz) || 'Asia/Kolkata' }); } catch (e) { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; } }; // date in the user's city (IST by default)
  const fmtTime = d => d ? d.toLocaleTimeString(lang === 'hi' ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit', timeZone: App.tz || 'Asia/Kolkata' }) : '—';
  const fmtDate = (d, o) => d ? d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', Object.assign({ day: 'numeric', month: 'short', year: 'numeric', timeZone: App.tz || 'Asia/Kolkata' }, o || {})) : '—';
  function toast(msg, ms) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), ms || 3200); }
  function log(event, extra) { try { const b = Object.assign({ event, visitor_id: vid, lang }, extra || {}); fetch('/api/log', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b), keepalive: true }).catch(() => { }); } catch (e) { } }

  /* ---------------- services catalog ---------------- */
  const SERVICES = [
    { id: 'prashn', cat: 'jyotish', ic: '🙏', en: 'Ek Prashn — One Question', hi: 'एक प्रश्न — एक उत्तर', price: 51, time: ['Answer on WhatsApp in 24 hrs', '24 घंटे में WhatsApp पर उत्तर'],
      pts: [['Any one question — career, marriage, money, health', 'कोई एक सवाल — करियर, विवाह, धन, स्वास्थ्य'], ['Checked on your kundli by Manasvi ji', 'मानसवी जी आपकी कुंडली देखकर उत्तर देंगी'], ['Simple remedy included', 'सरल उपाय सहित']] },
    { id: 'milan', cat: 'jyotish', ic: '💞', en: 'Shubh Milan — Kundli Matching', hi: 'शुभ मिलन — कुंडली मिलान', price: 101, time: ['Report in 24–48 hrs', '24–48 घंटे में रिपोर्ट'],
      pts: [['Full 36-gun Ashtakoota + Manglik check', 'पूरा 36 गुण मिलान + मांगलिक जाँच'], ['Nadi / Bhakoot dosha & remedies', 'नाड़ी / भकूट दोष और उपाय'], ['Marriage-life guidance', 'वैवाहिक जीवन मार्गदर्शन']] },
    { id: 'kundli_report', cat: 'jyotish', ic: '📜', en: 'Janam Patrika Vishleshan', hi: 'जन्म पत्रिका विश्लेषण', price: 151, time: ['Detailed report in 48 hrs', '48 घंटे में विस्तृत रिपोर्ट'],
      pts: [['Career, marriage, health, wealth', 'करियर, विवाह, स्वास्थ्य, धन'], ['Current & next dasha explained', 'वर्तमान और अगली दशा का फल'], ['Personal remedies & lucky items', 'व्यक्तिगत उपाय और शुभ वस्तुएँ']] },
    { id: 'call', cat: 'jyotish', ic: '📞', en: 'Divya Samvad — 1:1 Call (20 min)', hi: 'दिव्य संवाद — 1:1 कॉल (20 मिनट)', price: 251, time: ['Slot fixed on WhatsApp', 'WhatsApp पर समय तय'],
      pts: [['Talk directly with Manasvi ji', 'मानसवी जी से सीधी बात'], ['Ask multiple questions', 'कई सवाल पूछें'], ['Audio or video call', 'ऑडियो या वीडियो कॉल']], hot: true },
    { id: 'sampoorna', cat: 'combo', ic: '👑', en: 'Sampoorna Jeevan Darshan', hi: 'सम्पूर्ण जीवन दर्शन', price: 501, time: ['Report + 30 min call', 'रिपोर्ट + 30 मिनट कॉल'],
      pts: [['Kundli + Numerology + Tarot — all three', 'कुंडली + अंक ज्योतिष + टैरो — तीनों'], ['30-minute personal call', '30 मिनट व्यक्तिगत कॉल'], ['Year-ahead guidance & remedies', 'आने वाले साल का मार्गदर्शन व उपाय'], ['Best value — save ₹300+', 'सबसे बढ़िया — ₹300+ की बचत']], best: true },
    { id: 'num_name', cat: 'numerology', ic: '🔤', en: 'Naam Ank Jaanch — Name Number Check', hi: 'नाम अंक जाँच', price: 51, time: ['Reply in 24 hrs', '24 घंटे में उत्तर'],
      pts: [['Is your name spelling lucky?', 'क्या आपके नाम की स्पेलिंग शुभ है?'], ['Mulank–Bhagyank harmony check', 'मूलांक–भाग्यांक तालमेल'], ['1–2 corrected spellings', '1–2 सुधरी स्पेलिंग']] },
    { id: 'num_report', cat: 'numerology', ic: '🔢', en: 'Complete Numerology Report', hi: 'सम्पूर्ण अंक ज्योतिष रिपोर्ट', price: 151, time: ['Report in 48 hrs', '48 घंटे में रिपोर्ट'],
      pts: [['Lo Shu grid & missing-number remedies', 'लो शू ग्रिड और गायब अंकों के उपाय'], ['Lucky mobile, vehicle, house numbers', 'शुभ मोबाइल, वाहन, मकान नंबर'], ['Personal year forecast', 'व्यक्तिगत वर्ष भविष्यफल']], hot: true },
    { id: 'num_baby', cat: 'numerology', ic: '👶', en: 'Baby / Business Name Numerology', hi: 'बच्चे / व्यापार का शुभ नाम', price: 251, time: ['5 names in 48 hrs', '48 घंटे में 5 नाम'],
      pts: [['5 lucky name suggestions', '5 शुभ नाम सुझाव'], ['Based on DOB / founding date', 'जन्म / स्थापना तिथि अनुसार'], ['Nakshatra first letter included', 'नक्षत्र अक्षर सहित']] },
    { id: 'tarot_one', cat: 'tarot', ic: '🃏', en: 'Ek Sawaal Tarot', hi: 'एक सवाल टैरो', price: 51, time: ['Reading on WhatsApp in 24 hrs', '24 घंटे में WhatsApp पर रीडिंग'],
      pts: [['One clear question', 'एक स्पष्ट सवाल'], ['3-card reading with card photos', 'कार्ड फ़ोटो सहित 3-कार्ड रीडिंग'], ['Guidance & next step', 'मार्गदर्शन और अगला कदम']] },
    { id: 'tarot_celtic', cat: 'tarot', ic: '✨', en: 'Celtic Cross — Love / Career', hi: 'केल्टिक क्रॉस — प्रेम / करियर', price: 151, time: ['Detailed reading in 48 hrs', '48 घंटे में विस्तृत रीडिंग'],
      pts: [['10-card deep spread', '10 कार्ड की गहरी रीडिंग'], ['Past, present, hidden influences, outcome', 'भूत, वर्तमान, छिपे प्रभाव, परिणाम'], ['Voice-note explanation', 'वॉयस नोट में समझाया जाएगा']], hot: true },
    { id: 'tarot_live', cat: 'tarot', ic: '🔮', en: 'Live Tarot Call (20 min)', hi: 'लाइव टैरो कॉल (20 मिनट)', price: 251, time: ['Slot fixed on WhatsApp', 'WhatsApp पर समय तय'],
      pts: [['Cards drawn live on video', 'वीडियो पर लाइव कार्ड'], ['Ask follow-up questions', 'आगे के सवाल पूछें'], ['Energy cleansing tips', 'ऊर्जा शुद्धि के उपाय']] }
  ];

  const App = window.App = { LS, $, $$, esc, T, toast, log, vid, waLink, WA, PHONE, INSTA, SERVICES, routes: {}, cfg: { prices: {} }, todayKey, fmtTime, fmtDate, tz: 'Asia/Kolkata', get lang() { return lang; } };
  App.price = id => (App.cfg.prices && App.cfg.prices[id]) || (SERVICES.find(s => s.id === id) || {}).price;

  /* ---------------- layout ---------------- */
  const NAV = [['', '🏠', 'Home', 'होम'], ['kundli', '🪐', 'Kundli', 'कुंडली'], ['milan', '💞', 'Milan', 'मिलान'], ['panchang', '📅', 'Panchang', 'पंचांग'], ['rashifal', '♈', 'Rashifal', 'राशिफल'],
    ['numerology', '🔢', 'Numerology', 'अंक ज्योतिष'], ['tarot', '🃏', 'Tarot', 'टैरो'], ['games', '🎮', 'Games', 'गेम्स'], ['chat', '🤖', 'Shree AI', 'श्री AI'], ['seva', '🙏', 'Book', 'बुक करें', 'hot']];
  function renderChrome(route) {
    $('#menu').innerHTML = NAV.map(n => `<a href="#/${n[0]}" class="${n[4] || ''} ${route === n[0] ? 'on' : ''}">${n[1]} ${T(n[2], n[3])}</a>`).join('');
    $('#langBtn').textContent = lang === 'hi' ? 'English' : 'हिंदी';
    document.documentElement.lang = lang; document.body.classList.toggle('hi', lang === 'hi'); if (App.offerBar) App.offerBar();
    $('#foot').innerHTML = `<div class="grid g4">
      <div><img src="images/logo-full.svg" alt="Astro Shree — Know your hidden destiny" style="width:220px;margin-bottom:8px"><p>${T('Vedic astrology, numerology & tarot with love and honesty — by Manasvi Bharadwaj.', 'प्रेम और ईमानदारी के साथ वैदिक ज्योतिष, अंक ज्योतिष और टैरो — मानसवी भारद्वाज द्वारा।')}</p>
        <a href="${waLink('Radhe Radhe 🙏')}" target="_blank" rel="noopener">💬 WhatsApp ${PHONE}</a><a href="${INSTA}" target="_blank" rel="noopener">📸 Instagram @astro_shree25_</a></div>
      <div><h4>${T('Free Tools', 'फ़्री टूल्स')}</h4><a href="#/kundli">${T('Janam Kundli', 'जन्म कुंडली')}</a><a href="#/milan">${T('Kundli Milan', 'कुंडली मिलान')}</a><a href="#/panchang">${T('Aaj ka Panchang', 'आज का पंचांग')}</a><a href="#/rashifal">${T('Daily Rashifal', 'दैनिक राशिफल')}</a><a href="#/numerology">${T('Numerology', 'अंक ज्योतिष')}</a><a href="#/tarot">${T('Tarot', 'टैरो')}</a></div>
      <div><h4>${T('Explore', 'और देखें')}</h4><a href="#/games">🎮 ${T('Divine Games', 'दिव्य गेम्स')}</a><a href="#/chat">🤖 Shree AI</a><a href="#/vault">👨‍👩‍👧 ${T('Family Kundli Vault', 'परिवार कुंडली तिजोरी')}</a><a href="#/vrat">🪔 ${T('Vrat Calendar', 'व्रत कैलेंडर')}</a><a href="#/blessings">🙏 ${T('Divine Blessings', 'दिव्य आशीर्वाद')}</a><a href="#/seva">💎 ${T('Book a Reading', 'रीडिंग बुक करें')}</a></div>
      <div><h4>${T('Policies', 'नीतियाँ')}</h4><a href="#/privacy">${T('Privacy Policy', 'गोपनीयता नीति')}</a><a href="#/terms">${T('Terms & Refund', 'नियम व रिफ़ंड')}</a><a href="#/seva">${T('Pricing', 'मूल्य')}</a></div></div>
      <div class="disc">© ${new Date().getFullYear()} Astro-Shree — Manasvi Bharadwaj. ${T('Astrology, numerology and tarot offer guidance based on traditional principles; results vary from person to person and are not guaranteed. They do not replace medical, legal or financial advice. Games are for entertainment.', 'ज्योतिष, अंक ज्योतिष और टैरो पारंपरिक सिद्धांतों पर आधारित मार्गदर्शन हैं; परिणाम व्यक्ति अनुसार अलग हो सकते हैं और गारंटी नहीं है। ये चिकित्सा, कानूनी या आर्थिक सलाह का विकल्प नहीं हैं। गेम्स केवल मनोरंजन हेतु हैं।')}</div>`;
  }
  App.phead = (title, sub) => `<section class="phead"><div class="wrap"><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div></section>`;
  App.ctaBook = (id, line) => { const s = SERVICES.find(x => x.id === id); return `<div class="cta-box no-print"><div><h3>${s.ic} ${T(s.en, s.hi)} — ${App.priceHTML(id)}</h3><div class="small" style="color:#ddd6fe">${line || T(s.time[0], s.time[1])}</div></div><button class="btn btn-gold" data-book="${id}">${T('Book now', 'अभी बुक करें')} →</button></div>`; };

  /* ---------------- router ---------------- */
  let current = null;
  function route() {
    const h = location.hash.replace(/^#\/?/, ''), [name, ...rest] = h.split('/');
    const r = App.routes[name] ? name : '';
    current = r; renderChrome(r);
    const view = $('#view'); view.innerHTML = '';
    if (r !== 'games' && App.stopFx) App.stopFx();
    try { App.routes[r](view, rest); } catch (e) { console.error(e); view.innerHTML = `<div class="wrap sec center"><h2>🙏 ${T('Something went wrong', 'कुछ गड़बड़ हुई')}</h2><p class="muted">${esc(e.message)}</p><a class="btn btn-gold" href="#/">${T('Go Home', 'होम पर जाएँ')}</a></div>`; }
    $('#menu').classList.remove('open'); window.scrollTo(0, 0);
    log('page', { meta: { page: r || 'home' } });
  }
  App.rerender = () => route();
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-book]'); if (b) { e.preventDefault(); App.book(b.dataset.book, b.dataset.note); }
  });

  /* ---------------- place input (local list + worldwide search) ---------------- */
  App.placeField = function (wrap, saved) {
    wrap.classList.add('suggest');
    wrap.innerHTML = `<input class="inp" placeholder="${T('Type city e.g. Mathura, Delhi, London', 'शहर लिखें जैसे मथुरा, दिल्ली, लंदन')}" autocomplete="off"><div class="list hide"></div><div class="tiny muted pl"></div>`;
    const inp = $('input', wrap), list = $('.list', wrap), info = $('.pl', wrap); let val = saved || null, timer;
    const show = v => { info.textContent = v ? `📍 ${v.name}${v.country ? ', ' + v.country : ''} · ${v.lat.toFixed(2)}, ${v.lon.toFixed(2)} · ${v.tz}` : ''; };
    if (val) { inp.value = val.name; show(val); }
    const pick = v => { val = v; inp.value = v.name; list.classList.add('hide'); show(v); };
    const render = items => { list.innerHTML = items.map((c, i) => `<div data-i="${i}">📍 ${esc(c.name)}${c.admin ? ', ' + esc(c.admin) : ''}${c.country ? ' <span class="muted small">' + esc(c.country) + '</span>' : ''}</div>`).join('') || `<div class="muted">${T('No match — try another spelling', 'नहीं मिला — दूसरी स्पेलिंग आज़माएँ')}</div>`; list.classList.remove('hide'); $$('[data-i]', list).forEach(d => d.onclick = () => pick(items[+d.dataset.i])); };
    inp.oninput = () => {
      val = null; show(null); const q = inp.value.trim().toLowerCase(); clearTimeout(timer); if (q.length < 2) { list.classList.add('hide'); return; }
      const local = window.AS_CITIES.filter(c => c.name.toLowerCase().startsWith(q)).slice(0, 6); render(local);
      if (q.length >= 3) timer = setTimeout(async () => {
        try { const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(inp.value.trim())}&count=8&language=en&format=json`); const j = await r.json();
          const more = (j.results || []).map(x => ({ name: x.name, admin: x.admin1, country: x.country, lat: x.latitude, lon: x.longitude, tz: x.timezone }));
          const seen = new Set(local.map(c => c.name + c.lat.toFixed(1))); render(local.concat(more.filter(m => !seen.has(m.name + m.lat.toFixed(1)))).slice(0, 10)); } catch (e) { }
      }, 350);
    };
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) list.classList.add('hide'); });
    return () => val;
  };

  /* ---------------- OFFERS ---------------- */
  const LOCAL_COUPONS = { SHUBH11: 11, SAPTAH21: 21 };
  App.offer = () => { const o = App.cfg.offer || { pct: 20, till: '2026-12-31', name: 'Launch Offer' }; const active = o.active != null ? o.active : (o.pct > 0 && Date.now() <= Date.parse(o.till + 'T23:59:59+05:30')); return Object.assign({}, o, { active }); };
  const endOne = x => { const r = Math.round(x); return r > 20 ? Math.round((r - 1) / 10) * 10 + 1 : r; };
  App.after = id => { const b = App.price(id), o = App.offer(); return o.active ? endOne(b * (1 - o.pct / 100)) : b; };
  App.priceHTML = id => { const b = App.price(id), a = App.after(id); return a < b ? `<s class="mrp">₹${b}</s> ₹${a} <span class="offtag">-${App.offer().pct}%</span>` : `₹${b}`; };
  App.daysLeft = () => Math.max(0, Math.ceil((Date.parse(App.offer().till + 'T23:59:59+05:30') - Date.now()) / 864e5));
  App.localQuote = (id, coupon) => { const base = App.price(id), after = App.after(id), code = String(coupon || '').trim().toUpperCase(), off = LOCAL_COUPONS[code] || 0; return { base, after, coupon: off ? code : null, couponOff: off, couponInvalid: !!code && !off, final: Math.max(21, after - off) }; };
  App.quote = async (id, coupon) => { try { const r = await fetch('/api/pay', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'quote', service: id, coupon }) }); if (!r.ok) throw 0; return await r.json(); } catch (e) { return App.localQuote(id, coupon); } };
  App.winCoupon = (code, why) => { const w = LS.get('as_coupons', []); if (!w.some(c => c.code === code)) { w.push({ code, why, t: Date.now() }); LS.set('as_coupons', w); } LS.set('as_coupon', code); };
  function offerBar() {
    let bar = $('#offerbar'); const o = App.offer();
    if (!o.active || LS.get('as_bar_hide') === todayKey()) { if (bar) bar.remove(); return; }
    if (!bar) { bar = document.createElement('div'); bar.id = 'offerbar'; bar.className = 'offerbar no-print'; document.body.insertBefore(bar, document.body.firstChild); }
    bar.innerHTML = `<span>🎉 <b>${T(o.name, 'लॉन्च ऑफ़र')}: ${o.pct}% OFF</b> ${T('on all readings', 'सभी रीडिंग पर')} · ${T('ends in', 'समाप्ति में')} <b>${App.daysLeft()} ${T('days', 'दिन')}</b> · 🎡 ${T('Spin & win extra ₹11 off', 'घुमाएँ और ₹11 अतिरिक्त छूट जीतें')}</span> <a href="#/seva">${T('Book now', 'अभी बुक करें')} →</a><button aria-label="close">✕</button>`;
    $('button', bar).onclick = () => { LS.set('as_bar_hide', todayKey()); bar.remove(); };
  }
  App.offerBar = offerBar;

  /* ---------------- HOME ---------------- */
  function wheelSVG() {
    const J = window.Jyotish; let s = '<svg viewBox="0 0 400 400" class="wheel" aria-hidden="true"><defs><linearGradient id="gw" x1="0" x2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs>';
    s += '<circle cx="200" cy="200" r="196" fill="none" stroke="url(#gw)" stroke-width="3"/><circle cx="200" cy="200" r="150" fill="none" stroke="#fbbf24" stroke-opacity=".5"/>';
    for (let i = 0; i < 12; i++) { const a = (i * 30 - 90) * Math.PI / 180, a2 = ((i * 30 + 15) - 90) * Math.PI / 180;
      s += `<line x1="${200 + 150 * Math.cos(a)}" y1="${200 + 150 * Math.sin(a)}" x2="${200 + 196 * Math.cos(a)}" y2="${200 + 196 * Math.sin(a)}" stroke="#fbbf24" stroke-opacity=".6"/>`;
      s += `<text x="${200 + 173 * Math.cos(a2)}" y="${200 + 173 * Math.sin(a2)}" fill="#fde68a" font-size="24" text-anchor="middle" dominant-baseline="central">${J.RASHI[i].sym}</text>`; }
    return s + '</svg>';
  }
  function orb() {
    const planets = [[46, 9, '#60a5fa', 9], [55, 14, '#f9a8d4', 12], [64, 20, '#f87171', 10], [73, 30, '#fbbf24', 18, 1], [82, 44, '#a78bfa', 15, 1]];
    return `<div class="orb">${wheelSVG()}${planets.map((p, i) => `<div class="orbit" style="width:${p[0]}%;height:${p[0]}%;animation-duration:${p[1]}s;animation-delay:-${i * 3}s"><i class="pl ${p[4] ? 'ring' : ''}" style="--pc:${p[2]};width:${p[3]}px;height:${p[3]}px"></i></div>`).join('')}
      <div class="orb-core"><img src="images/logo.svg" alt="Astro-Shree"></div><div class="glow"></div></div>`;
  }
  function starfield(canvas) {
    const ctx = canvas.getContext('2d'); let w, h, stars = [], raf, shoot = null;
    const size = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; stars = Array.from({ length: Math.min(240, Math.floor(w * h / 4500)) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + .2, t: Math.random() * 6, s: Math.random() * .02 + .005 })); };
    const draw = () => {
      if (!canvas.isConnected) return cancelAnimationFrame(raf); ctx.clearRect(0, 0, w, h);
      stars.forEach(s => { s.t += s.s; ctx.globalAlpha = .3 + .7 * Math.abs(Math.sin(s.t)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); });
      if (!shoot && Math.random() < .006) shoot = { x: Math.random() * w * .7, y: Math.random() * h * .4, l: 0 };
      if (shoot) { shoot.l += 14; ctx.globalAlpha = Math.max(0, 1 - shoot.l / 320); const g = ctx.createLinearGradient(shoot.x + shoot.l, shoot.y + shoot.l * .45, shoot.x + shoot.l - 90, shoot.y + shoot.l * .45 - 40); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(shoot.x + shoot.l, shoot.y + shoot.l * .45); ctx.lineTo(shoot.x + shoot.l - 90, shoot.y + shoot.l * .45 - 40); ctx.stroke(); if (shoot.l > 320) shoot = null; }
      raf = requestAnimationFrame(draw); };
    size(); draw(); addEventListener('resize', size, { once: true });
  }
  App.starfield = starfield;
  App.routes[''] = function (v) {
    const J = window.Jyotish, AS = window.AS, me = LS.get('as_me'), city = LS.get('as_city') || window.AS_CITIES[0], o = App.offer();
    const streak = LS.get('as_streak') || { n: 0 }, st = App.cfg.stats;
    let pan = null, vrats = []; try { pan = J.panchang(todayKey(), city.lat, city.lon, city.tz); App.tz = city.tz; vrats = J.vratCalendar(todayKey(), 45, city.lat, city.lon, city.tz); } catch (e) { }
    const tk = pan ? [`📅 ${fmtDate(new Date(), { weekday: 'long', year: undefined })}`, `🌙 ${T(pan.tithi.paksha, pan.tithi.pakshaHi)} ${T(pan.tithi.en, pan.tithi.hi)}`, `⭐ ${T('Nakshatra', 'नक्षत्र')} ${T(pan.nakshatra.en, pan.nakshatra.hi)}`, `☀️ ${T('Sunrise', 'सूर्योदय')} ${fmtTime(pan.sunrise)}`, `🌇 ${T('Sunset', 'सूर्यास्त')} ${fmtTime(pan.sunset)}`, `🚫 ${T('Rahu Kaal', 'राहुकाल')} ${fmtTime(pan.rahuKaal.start)}–${fmtTime(pan.rahuKaal.end)}`, pan.abhijit ? `✅ ${T('Abhijit', 'अभिजीत')} ${fmtTime(pan.abhijit.start)}–${fmtTime(pan.abhijit.end)}` : '', vrats[0] ? `${vrats[0].ic} ${T('Next', 'अगला')}: ${T(vrats[0].en, vrats[0].hi)} · ${fmtDate(new Date(vrats[0].date + 'T12:00:00'), { year: undefined })}` : ''].filter(Boolean) : [];
    v.innerHTML = `
    <section class="hero hero2"><canvas id="stars"></canvas><div class="wrap">
      <div class="hero-txt">
        <span class="kicker" style="color:#fbbf24">✨ ${T('Know your hidden destiny', 'अपना छुपा भाग्य जानें')} · ${T('Jyotish · Numerology · Tarot', 'ज्योतिष · अंक · टैरो')}</span>
        <h1>${T('Know your stars.', 'सितारे बोलेंगे,')}<br><span class="gold-text">${T('Shape your destiny.', 'भाग्य बदलेगा।')}</span></h1>
        <p class="lead">${T('Free Kundli, Panchang, Numerology, Tarot & daily divine games — and personal guidance whenever you need it.', 'फ़्री कुंडली, पंचांग, अंक ज्योतिष, टैरो और रोज़ के दिव्य गेम्स — और ज़रूरत पड़ने पर व्यक्तिगत मार्गदर्शन।')}</p>
        <div class="row hero-cta"><a class="btn btn-gold btn-lg" href="#/kundli">🪐 ${T('Free Kundli', 'फ़्री कुंडली')}</a><a class="btn btn-violet btn-lg" href="#/games">🎮 ${T('Play & Win', 'खेलें और जीतें')}</a></div>
        ${o.active ? `<a class="hero-offer" href="#/seva">🎉 ${T(o.name, 'लॉन्च ऑफ़र')} — <b>${o.pct}% OFF</b> ${T('all readings', 'सभी रीडिंग')} · ${T('from', 'सिर्फ़')} ₹${App.after('prashn')}</a>` : ''}
      </div>
      <div class="hero-art">${orb()}</div>
    </div>
    <div class="wrap bhagya"><div class="bh-card"><div class="row between"><b>🔮 ${T('Aaj ka Bhagya — tap your rashi', 'आज का भाग्य — अपनी राशि चुनें')}</b><span class="tiny" style="color:#c4b5fd">${T('Based on today\'s Moon transit', 'आज के चंद्र गोचर पर आधारित')}</span></div>
      <div class="bh-chips">${J.RASHI.map((r, i) => `<button data-bh="${i}" class="${me && me.moonSign === i ? 'mine' : ''}"><span>${r.sym}</span>${T(r.en, r.hi)}</button>`).join('')}</div><div id="bhOut"></div></div></div></section>

    ${tk.length ? `<div class="ticker no-print"><div class="tk-track">${tk.concat(tk).map(x => `<span>${x}</span>`).join('')}</div></div>` : ''}

    <section class="sec"><div class="wrap center"><span class="kicker">🧭 ${T('Start here — 100% free', 'यहाँ से शुरू करें — 100% फ़्री')}</span><h2 class="title">${T('What would you like to know today?', 'आज आप क्या जानना चाहेंगे?')}</h2>
      <div class="tiles">${[
        ['kundli', '🪐', 'My Kundli', 'मेरी कुंडली', 'Chart, dasha, manglik', 'चार्ट, दशा, मांगलिक', '#f59e0b'],
        ['milan', '💞', 'Match Making', 'कुंडली मिलान', '36 gun milan', '36 गुण मिलान', '#ec4899'],
        ['panchang', '📅', 'Panchang', 'पंचांग', 'Tithi, Rahu kaal', 'तिथि, राहुकाल', '#22c55e'],
        ['numerology', '🔢', 'Numerology', 'अंक ज्योतिष', 'Lucky numbers', 'शुभ अंक', '#3b82f6'],
        ['tarot', '🃏', 'Tarot', 'टैरो', 'Card of the day', 'आज का कार्ड', '#a855f7'],
        ['chat', '🤖', 'Ask Shree AI', 'श्री AI से पूछें', 'Instant answers', 'तुरंत उत्तर', '#06b6d4'],
        ['vrat', '🪔', 'Vrat Calendar', 'व्रत कैलेंडर', 'Ekadashi, Purnima…', 'एकादशी, पूर्णिमा…', '#f97316'],
        ['vault', '👨‍👩‍👧', 'Family Vault', 'परिवार तिजोरी', 'Whole family', 'पूरा परिवार', '#9f1239']
      ].map(x => `<a class="tile" href="#/${x[0]}" style="--c:${x[6]}"><span class="ti">${x[1]}</span><b>${T(x[2], x[3])}</b><small>${T(x[4], x[5])}</small></a>`).join('')}</div></div></section>

    <section class="sec offers"><div class="wrap"><div class="center"><span class="kicker" style="color:#fbbf24">🎁 ${T('Offers & Prizes', 'ऑफ़र्स और इनाम')}</span><h2 class="title" style="color:#fff">${T('More blessings, less price', 'ज़्यादा आशीर्वाद, कम दाम')}</h2></div>
      <div class="grid g4">
        <div class="offer-card"><div class="oc-ic">🎉</div><h3>${o.active ? o.pct + '% OFF' : T('Shagun prices', 'शगुन मूल्य')}</h3><p>${o.active ? T(`${o.name} on every reading`, 'हर रीडिंग पर लॉन्च ऑफ़र') + ` — <b>${App.daysLeft()} ${T('days left', 'दिन बाकी')}</b>` : T('Readings from ₹51', '₹51 से रीडिंग')}</p><a class="btn btn-gold btn-sm" href="#/seva">${T('Grab offer', 'ऑफ़र लें')}</a></div>
        <div class="offer-card"><div class="oc-ic">🎡</div><h3>${T('Spin & Win', 'घुमाओ और जीतो')}</h3><p>${T('Spin the Kismat Wheel daily — win a <b>₹11 off</b> coupon', 'रोज़ किस्मत का पहिया घुमाएँ — <b>₹11 छूट</b> कूपन जीतें')}</p><a class="btn btn-gold btn-sm" href="#/games">${T('Spin now', 'अभी घुमाएँ')}</a></div>
        <div class="offer-card"><div class="oc-ic">🔥</div><h3>${T('Streak Rewards', 'स्ट्रीक इनाम')}</h3><p>${T('Play 3 days in a row → ₹11 off · 7 days → <b>₹21 off</b>', '3 दिन लगातार खेलें → ₹11 छूट · 7 दिन → <b>₹21 छूट</b>')}</p><div class="tiny" style="color:#fde68a">${T('Your streak', 'आपकी स्ट्रीक')}: ${streak.n || 0} 🔥</div></div>
        <div class="offer-card"><div class="oc-ic">👑</div><h3>${T('Combo saving', 'कॉम्बो बचत')}</h3><p>${T('Kundli + Numerology + Tarot + 30 min call', 'कुंडली + अंक + टैरो + 30 मिनट कॉल')} — <b>${App.priceHTML('sampoorna')}</b></p><button class="btn btn-gold btn-sm" data-book="sampoorna">${T('Book combo', 'कॉम्बो बुक करें')}</button></div>
      </div>${LS.get('as_coupons', []).length ? `<p class="center" style="color:#fde68a;margin-top:16px">🎟️ ${T('Your coupons', 'आपके कूपन')}: ${LS.get('as_coupons', []).map(c => `<b class="coupon">${esc(c.code)}</b>`).join(' ')}</p>` : ''}</div></section>

    <section class="sec"><div class="wrap grid g2" style="align-items:stretch">
      <div class="card year-card"><span class="kicker">✨ ${T('New Year special', 'नए साल का विशेष')}</span><h2>${T('How will 2027 be for you?', '2027 आपके लिए कैसा रहेगा?')}</h2><p class="muted small">${T('Enter your date of birth — numerology reveals your Personal Year.', 'जन्म तिथि डालें — अंक ज्योतिष बताएगा आपका व्यक्तिगत वर्ष।')}</p>
        <div class="row"><input class="inp" type="date" id="yDob" style="flex:1;min-width:170px" value="${esc(me && me.input ? me.input.date : '')}"><button class="btn btn-violet" id="yGo">${T('Reveal', 'देखें')} ✨</button></div><div id="yOut"></div></div>
      <div class="card"><span class="kicker">🪔 ${T('Upcoming vrat & festivals', 'आने वाले व्रत व त्योहार')}</span><h2>${T('Vrat Calendar', 'व्रत कैलेंडर')}</h2>
        <div class="vlist">${vrats.slice(0, 5).map(x => `<div class="vrow"><span class="vd"><b>${new Date(x.date + 'T12:00:00').getDate()}</b>${fmtDate(new Date(x.date + 'T12:00:00'), { day: undefined, year: undefined, month: 'short' })}</span><span>${x.ic} ${T(x.en, x.hi)}</span></div>`).join('') || '—'}</div>
        <a class="btn btn-ghost btn-sm" style="margin-top:12px" href="#/vrat">${T('Full calendar', 'पूरा कैलेंडर')} →</a></div></div></section>

    <section class="sec-sm"><div class="wrap"><div class="games-banner"><div class="floaters"><span style="top:10%;right:6%">🎲</span><span style="bottom:12%;right:22%;animation-delay:1s">🃏</span><span style="top:18%;right:34%;animation-delay:2s">🎡</span><span style="bottom:8%;right:4%;animation-delay:.5s">🪔</span></div>
      <span class="streak">🔥 ${streak.n || 0} ${T('day streak', 'दिन की स्ट्रीक')}</span>
      <h2 style="margin-top:14px">🎮 ${T('14 Divine Games — play daily, win coupons', '14 दिव्य गेम्स — रोज़ खेलें, कूपन जीतें')}</h2>
      <p style="max-width:560px;color:#fde68a">${T('Kismat Wheel, Diya Jalao, Love Match, Lucky Number, Angel Number, Mantra Jaap and more.', 'किस्मत का पहिया, दीया जलाओ, लव मैच, शुभ अंक, एंजेल नंबर, मंत्र जाप और भी बहुत कुछ।')}</p>
      <a class="btn btn-gold btn-lg" href="#/games">${T('Play now', 'अभी खेलें')} →</a></div></div></section>

    <section class="sec"><div class="wrap center"><span class="kicker">🙏 ${T('Personal guidance', 'व्यक्तिगत मार्गदर्शन')}</span><h2 class="title">${T('Talk to an astrologer', 'ज्योतिषी से बात करें')}</h2><p class="sub">${T('Pay by any UPI app · confirmation on WhatsApp', 'किसी भी UPI ऐप से भुगतान · WhatsApp पर पुष्टि')}</p>
      <div class="grid g3" style="text-align:left">${['prashn', 'call', 'sampoorna'].map(svcCard).join('')}</div>
      <a class="btn btn-violet" style="margin-top:22px" href="#/seva">${T('See all 11 services', 'सभी 11 सेवाएँ देखें')} →</a></div></section>

    <section class="sec" style="background:#fff7ed"><div class="wrap about2"><img src="images/logo.svg" alt="" class="about-emblem">
      <div><span class="kicker">${T('About Astro-Shree', 'एस्ट्रो-श्री के बारे में')}</span><h2 class="title">${T('Guided by Manasvi Bharadwaj', 'मानसवी भारद्वाज द्वारा मार्गदर्शन')}</h2>
      <p>${T('5 years of Vedic astrology practice — Kundli, Kundali Matching, Numerology, Tarot, past analysis and future predictions. An ethical, compassionate approach that helps you understand your karma and make informed choices.', '5 वर्षों का वैदिक ज्योतिष अनुभव — कुंडली, कुंडली मिलान, अंक ज्योतिष, टैरो, भूतकाल विश्लेषण और भविष्यवाणी। नैतिक और करुणामय दृष्टिकोण जो आपको अपने कर्म को समझने और सही निर्णय लेने में मदद करता है।')}</p>
      <div class="row"><button class="btn btn-gold" data-book="call">📞 ${T('Book a call', 'कॉल बुक करें')}</button><a class="btn btn-ghost" href="${INSTA}" target="_blank" rel="noopener">📸 Instagram</a><a class="btn btn-ghost" href="#/blessings">🙏 ${T('Divine Blessings', 'दिव्य आशीर्वाद')}</a></div></div></div></section>

    <section class="sec dark"><div class="wrap grid g2" style="align-items:center">
      <div><span class="kicker" style="color:#fbbf24">📲 ${T('Free on WhatsApp', 'WhatsApp पर फ़्री')}</span><h2 class="title">${T('Get your Rashifal & vrat reminders on WhatsApp', 'राशिफल और व्रत रिमाइंडर WhatsApp पर पाएँ')}</h2><p class="muted">${T('Ekadashi, Purnima and important muhurat alerts, plus your rashi updates — free.', 'एकादशी, पूर्णिमा और ज़रूरी मुहूर्त अलर्ट, साथ में आपकी राशि के अपडेट — फ़्री।')}</p></div>
      <div class="card"><div class="fgrid"><div><label class="f" style="color:#ddd6fe">${T('Name', 'नाम')}</label><input class="inp" id="sbName" value="${esc(me && me.name || '')}"></div><div><label class="f" style="color:#ddd6fe">${T('Rashi', 'राशि')}</label><select class="inp" id="sbRashi">${J.RASHI.map((r, i) => `<option value="${i}" ${me && me.moonSign === i ? 'selected' : ''}>${r.sym} ${T(r.en, r.hi)}</option>`).join('')}</select></div></div>
        <label class="f" style="color:#ddd6fe">${T('WhatsApp number', 'WhatsApp नंबर')}</label><input class="inp" id="sbPhone" inputmode="tel" value="${esc((LS.get('as_who') || {}).phone || '')}">
        <label class="check" style="color:#ddd6fe"><input type="checkbox" id="sbOk"> ${T('I agree to receive updates from Astro-Shree on WhatsApp. I can stop anytime.', 'मैं एस्ट्रो-श्री से WhatsApp पर अपडेट पाने के लिए सहमत हूँ। कभी भी बंद कर सकता/सकती हूँ।')}</label>
        <button class="btn btn-gold btn-block" style="margin-top:12px" id="sbGo">✅ ${T('Subscribe free', 'फ़्री सब्सक्राइब करें')}</button></div></div></section>

    <section class="sec"><div class="wrap"><div class="center"><span class="kicker">💬 ${T('Anubhav', 'अनुभव')}</span><h2 class="title">${T('What our clients say', 'हमारे क्लाइंट्स क्या कहते हैं')}</h2></div>
      <div class="grid g3" id="reviews"><div class="center muted"><span class="loading"></span></div></div>
      <details class="card" style="max-width:640px;margin:22px auto 0"><summary style="cursor:pointer;font-weight:700">✍️ ${T('Share your experience', 'अपना अनुभव साझा करें')}</summary>
        <div class="fgrid"><div><label class="f">${T('Name', 'नाम')}</label><input class="inp" id="rvName"></div><div><label class="f">${T('City', 'शहर')}</label><input class="inp" id="rvCity"></div></div>
        <label class="f">${T('Rating', 'रेटिंग')}</label><div class="stars-row" id="rvStars" style="font-size:1.8rem;cursor:pointer">★★★★★</div>
        <label class="f">${T('Your words', 'आपके शब्द')}</label><textarea class="inp" id="rvText" rows="3"></textarea>
        <button class="btn btn-violet" style="margin-top:12px" id="rvSend">${T('Submit review', 'समीक्षा भेजें')}</button><p class="tiny muted">${T('Reviews appear after a quick check.', 'जाँच के बाद समीक्षा दिखेगी।')}</p></details></div></section>

    <section class="sec" style="background:#fff7ed"><div class="wrap faq" style="max-width:820px"><div class="center"><h2 class="title">❓ ${T('Common questions', 'आम सवाल')}</h2></div>
      ${[['How accurate is the free kundli?', 'फ़्री कुंडली कितनी सटीक है?', 'Planet positions use a modern astronomical engine with Lahiri ayanamsa — the standard of Indian panchangs. Accuracy depends most on your exact birth time.', 'ग्रहों की गणना आधुनिक खगोलीय इंजन और लाहिड़ी अयनांश से होती है — भारतीय पंचांगों का मानक। सटीकता सबसे ज़्यादा सही जन्म समय पर निर्भर है।'],
        ['How do I pay and use a coupon?', 'भुगतान और कूपन कैसे इस्तेमाल करें?', 'Choose a service, enter your coupon (e.g. SHUBH11) in the booking form, scan the UPI QR, then upload the screenshot with the UTR number. You get confirmation on WhatsApp.', 'सेवा चुनें, बुकिंग फ़ॉर्म में कूपन (जैसे SHUBH11) डालें, UPI QR स्कैन करें, फिर UTR नंबर के साथ स्क्रीनशॉट अपलोड करें। WhatsApp पर पुष्टि मिलेगी।'],
        ['Is my data safe?', 'क्या मेरा डेटा सुरक्षित है?', 'Your birth details stay in your browser unless you choose to save or book. We never sell your data.', 'आपका जन्म विवरण आपके ब्राउज़र में ही रहता है, जब तक आप सेव या बुक न करें। हम डेटा कभी नहीं बेचते।']
      ].map(q => `<details><summary>${T(q[0], q[1])}</summary><p class="muted">${T(q[2], q[3])}</p></details>`).join('')}</div></section>`;
    starfield($('#stars'));
    // Aaj ka Bhagya
    const bh = i => { const moonNow = J.moonSignNow(new Date()), d = AS.rashifal(i, moonNow, todayKey()), r = J.RASHI[i];
      $$('[data-bh]', v).forEach(b => b.classList.toggle('on', +b.dataset.bh === i));
      $('#bhOut').innerHTML = `<div class="bh-res"><div class="bh-score"><span>${r.sym}</span><div class="stars-row">${'★'.repeat(d.stars)}${'☆'.repeat(5 - d.stars)}</div></div><div style="flex:1"><b>${T(r.en, r.hi)} · ${T('Today', 'आज')}</b><p style="margin:4px 0">${T(d.text.en, d.text.hi)}</p><span class="tiny">🎨 ${T(d.color[0], d.color[1])} · 🔢 ${d.number} · ❤️ ${d.love}/5 · 💰 ${d.money}/5</span></div>
        <div class="row" style="flex-direction:column;gap:6px"><a class="btn btn-gold btn-sm" href="#/rashifal/${i}">${T('Full rashifal', 'पूरा राशिफल')}</a><button class="btn btn-sm btn-dark" id="bhShare">📤 ${T('Share', 'शेयर')}</button></div></div>`;
      $('#bhShare').onclick = () => App.share(`${r.sym} ${T(r.en, r.hi)} — ${T('Aaj ka Bhagya', 'आज का भाग्य')} ${'⭐'.repeat(d.stars)}\n${T(d.text.en, d.text.hi)}\n🎨 ${T(d.color[0], d.color[1])} · 🔢 ${d.number}`, 'bhagya');
      log('rashifal', { meta: { rashi: i, from: 'home' } }); };
    $$('[data-bh]', v).forEach(b => b.onclick = () => bh(+b.dataset.bh));
    if (me && me.moonSign != null) bh(me.moonSign);
    // 2027 predictor
    $('#yGo').onclick = () => { const dob = $('#yDob').value; if (!dob) return toast(T('Please enter date of birth', 'कृपया जन्म तिथि डालें'));
      const n = AS.personalYear(dob, 2027), p = AS.PY_TXT[n];
      $('#yOut').innerHTML = `<div class="result"><div style="font-size:2.4rem;font-family:Cinzel,serif">${n}</div><b>${T(p.t[0], p.t[1])}</b><p style="margin:6px 0;font-weight:500">${T(p.en, p.hi)}</p><span class="small">🗓️ ${T('Best months', 'सबसे शुभ महीने')}: ${T(p.best[0], p.best[1])}</span>
        <div class="row" style="margin-top:10px"><button class="btn btn-sm btn-violet" id="yShare">📤 ${T('Share', 'शेयर करें')}</button><button class="btn btn-sm btn-gold" data-book="num_report">${T('Full 2027 report', 'पूरी 2027 रिपोर्ट')} — ${App.priceHTML('num_report')}</button></div></div>`;
      $('#yShare').onclick = () => App.share(`✨ ${T('My 2027 Personal Year', 'मेरा 2027 व्यक्तिगत वर्ष')}: ${n} — ${T(p.t[0], p.t[1])}\n${T(p.en, p.hi)}`, 'year2027');
      log('numerology', { meta: { year2027: n } }); };
    // WhatsApp subscribe
    $('#sbGo').onclick = () => { const name = $('#sbName').value.trim(), phone = $('#sbPhone').value.trim();
      if (phone.replace(/\D/g, '').length < 10) return toast(T('Please enter your WhatsApp number', 'कृपया WhatsApp नंबर डालें'));
      if (!$('#sbOk').checked) return toast(T('Please tick the consent box', 'कृपया सहमति बॉक्स चुनें'));
      LS.set('as_who', Object.assign(LS.get('as_who') || {}, { name, phone }));
      log('lead', { consent: true, name, phone, meta: { type: 'whatsapp_rashifal', rashi: +$('#sbRashi').value } });
      toast(T('🙏 Subscribed! You will get updates on WhatsApp.', '🙏 सब्सक्राइब हो गया! WhatsApp पर अपडेट मिलेंगे।'), 4000); $('#sbGo').disabled = true; };
    loadReviews();
    let stars = 5; const paint = () => { $('#rvStars').textContent = '★'.repeat(stars) + '☆'.repeat(5 - stars); };
    $('#rvStars').onclick = e => { const r = e.target.getBoundingClientRect(); stars = Math.max(1, Math.min(5, Math.ceil((e.clientX - r.left) / (r.width / 5)))); paint(); };
    $('#rvSend').onclick = async () => {
      const b = { name: $('#rvName').value.trim(), city: $('#rvCity').value.trim(), text: $('#rvText').value.trim(), rating: stars, visitor_id: vid };
      if (!b.name || b.text.length < 10) return toast(T('Please write your name and a few words 🙏', 'कृपया नाम और कुछ शब्द लिखें 🙏'));
      try { const r = await fetch('/api/reviews', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }); const j = await r.json(); if (!r.ok) throw new Error(j.error); toast(T('Thank you! 🙏 Your review will appear soon.', 'धन्यवाद! 🙏 आपकी समीक्षा जल्द दिखेगी।')); $('#rvText').value = ''; }
      catch (e) { toast(e.message || 'Error'); }
    };
  };
  async function loadReviews() {
    const box = $('#reviews'); if (!box) return;
    try { const r = await fetch('/api/reviews'); const j = await r.json(); const rows = j.rows || [];
      box.innerHTML = rows.length ? rows.slice(0, 9).map(x => `<div class="card review"><div class="stars-row">${'★'.repeat(x.rating || 5)}</div><p style="margin:0">“${esc(x.text)}”</p><div class="who">— ${esc(x.name)}${x.city ? ', ' + esc(x.city) : ''}</div></div>`).join('')
        : `<div class="card center" style="grid-column:1/-1"><p class="muted">${T('Be the first to share your Astro-Shree experience 🙏', 'अपना एस्ट्रो-श्री अनुभव साझा करने वाले पहले व्यक्ति बनें 🙏')}</p></div>`;
    } catch (e) { box.innerHTML = `<div class="card center" style="grid-column:1/-1"><p class="muted">${T('Be the first to share your Astro-Shree experience 🙏', 'अपना एस्ट्रो-श्री अनुभव साझा करने वाले पहले व्यक्ति बनें 🙏')}</p></div>`; }
  }
  function svcCard(id) {
    const s = SERVICES.find(x => x.id === id);
    return `<div class="card svc">${s.best ? `<span class="ribbon">${T('BEST VALUE', 'सबसे बढ़िया')}</span>` : s.hot ? `<span class="ribbon" style="background:var(--violet)">${T('POPULAR', 'लोकप्रिय')}</span>` : ''}
      <div style="font-size:2rem">${s.ic}</div><h3 style="font-size:1.08rem;margin-top:6px">${T(s.en, s.hi)}</h3><div class="price">${App.priceHTML(s.id)}</div>
      <ul>${s.pts.map(p => `<li>${T(p[0], p[1])}</li>`).join('')}</ul><div class="tiny muted" style="margin-bottom:10px">⏱️ ${T(s.time[0], s.time[1])}</div>
      <button class="btn btn-gold btn-block" data-book="${s.id}">${T('Book now', 'अभी बुक करें')}</button></div>`;
  }
  App.svcCard = svcCard;

  /* ---------------- SEVA (services & booking) ---------------- */
  App.routes.seva = function (v, rest) {
    const cats = [['all', '✨', 'All', 'सभी'], ['jyotish', '🪐', 'Jyotish', 'ज्योतिष'], ['numerology', '🔢', 'Numerology', 'अंक ज्योतिष'], ['tarot', '🃏', 'Tarot', 'टैरो'], ['combo', '👑', 'Combo', 'कॉम्बो']];
    let cat = rest[0] && cats.some(c => c[0] === rest[0]) ? rest[0] : 'all';
    v.innerHTML = App.phead('🙏 ' + T('Jyotish Seva — Book a Reading', 'ज्योतिष सेवा — रीडिंग बुक करें'), T('Personal readings by Manasvi Bharadwaj. Pay by any UPI app — GPay, PhonePe, Paytm, BHIM.', 'मानसवी भारद्वाज द्वारा व्यक्तिगत रीडिंग। किसी भी UPI ऐप से भुगतान — GPay, PhonePe, Paytm, BHIM।')) +
      (App.offer().active ? `<div class="wrap" style="margin-top:20px"><div class="cta-box" style="background:linear-gradient(90deg,#9f1239,#f97316)"><div><h3>🎉 ${T(App.offer().name, 'लॉन्च ऑफ़र')}: ${App.offer().pct}% OFF ${T('on every reading', 'हर रीडिंग पर')}</h3><div class="small">${T('Ends in', 'समाप्ति में')} ${App.daysLeft()} ${T('days', 'दिन')} · ${T('Have a coupon from games? Apply it while booking.', 'गेम्स से कूपन मिला है? बुकिंग में लगाएँ।')}</div></div><a class="btn btn-gold" href="#/games">🎡 ${T('Win a coupon', 'कूपन जीतें')}</a></div></div>` : '') +
      `<section class="sec"><div class="wrap"><div class="tabs">${cats.map(c => `<button data-c="${c[0]}">${c[1]} ${T(c[2], c[3])}</button>`).join('')}</div><div class="grid g3" id="svcs"></div>
      <div class="card" style="margin-top:28px"><h3>🛡️ ${T('How booking works', 'बुकिंग कैसे होती है')}</h3><ol class="steps"><li>${T('Choose a service and fill your details (birth details help a lot).', 'सेवा चुनें और अपनी जानकारी भरें (जन्म विवरण बहुत मदद करता है)।')}</li><li>${T('Scan the UPI QR or tap "Pay" on your phone — exact amount is pre-filled.', 'UPI QR स्कैन करें या फ़ोन पर "Pay" दबाएँ — सही राशि पहले से भरी होती है।')}</li><li>${T('Upload the payment screenshot with the 12-digit UTR. It is checked instantly.', '12-अंकीय UTR के साथ भुगतान स्क्रीनशॉट अपलोड करें। तुरंत जाँच होती है।')}</li><li>${T('Manasvi ji contacts you on WhatsApp with your reading or call slot.', 'मानसवी जी WhatsApp पर रीडिंग या कॉल का समय भेजती हैं।')}</li></ol>
      <p class="small muted">${T('Need help? ', 'मदद चाहिए? ')}<a href="${waLink('Radhe Radhe 🙏 I need help with booking')}" target="_blank" rel="noopener">WhatsApp ${PHONE}</a> · <a href="#/terms">${T('Refund policy', 'रिफ़ंड नीति')}</a></p></div></div></section>`;
    const paint = () => { $$('.tabs button', v).forEach(b => b.classList.toggle('on', b.dataset.c === cat)); $('#svcs').innerHTML = SERVICES.filter(s => cat === 'all' || s.cat === cat).map(s => svcCard(s.id)).join(''); };
    $$('.tabs button', v).forEach(b => b.onclick = () => { cat = b.dataset.c; paint(); }); paint();
  };

  function shrinkImage(file) {
    return new Promise((res, rej) => { const fr = new FileReader(); fr.onerror = rej; fr.onload = () => { const img = new Image(); img.onerror = rej; img.onload = () => {
      const max = 1400, sc = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); let q = .82, out = c.toDataURL('image/jpeg', q); while (out.length > 900000 && q > .4) { q -= .12; out = c.toDataURL('image/jpeg', q); } res(out); }; img.src = fr.result; }; fr.readAsDataURL(file); });
  }
  function qrSvg(text) { try { const q = qrcode(0, 'M'); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 5, margin: 2, scalable: true }); } catch (e) { return ''; } }
  function modal(title, html) {
    const bg = document.createElement('div'); bg.className = 'modal-bg'; bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="mh"><h3>${title}</h3><button class="x" aria-label="Close">✕</button></div><div class="mb">${html}</div></div>`;
    document.body.appendChild(bg); const close = () => bg.remove(); $('.x', bg).onclick = close; bg.onclick = e => { if (e.target === bg) close(); };
    return { el: $('.mb', bg), close, setTitle: t => { $('.mh h3', bg).innerHTML = t; } };
  }
  App.modal = modal;
  App.book = function (id, note) {
    const s = SERVICES.find(x => x.id === id); if (!s) return; const price = App.after(id);
    const me = LS.get('as_me'), who = LS.get('as_who') || {};
    const needsBirth = !['tarot_one', 'tarot_celtic', 'tarot_live'].includes(id), twoPeople = id === 'milan';
    const m = modal(`${s.ic} ${T(s.en, s.hi)} · ${App.priceHTML(id)}`, `
      <div class="fgrid"><div><label class="f">${T('Your name', 'आपका नाम')} *</label><input class="inp" id="bkName" value="${esc(who.name || (me && me.name) || '')}"></div>
      <div><label class="f">${T('WhatsApp number', 'WhatsApp नंबर')} *</label><input class="inp" id="bkPhone" inputmode="tel" value="${esc(who.phone || '')}" placeholder="10-digit"></div></div>
      ${needsBirth ? `<div class="fgrid"><div><label class="f">${T('Date of birth', 'जन्म तिथि')}</label><input class="inp" type="date" id="bkDob" value="${esc(me && me.input ? me.input.date : '')}"></div><div><label class="f">${T('Birth time', 'जन्म समय')}</label><input class="inp" type="time" id="bkTob" value="${esc(me && me.input ? me.input.time : '')}"></div></div>
        <label class="f">${T('Birth place', 'जन्म स्थान')}</label><input class="inp" id="bkPlace" value="${esc(me && me.input ? me.input.place || '' : '')}">` : ''}
      ${twoPeople ? `<label class="f">${T('Partner\'s name, birth date, time & place', 'साथी का नाम, जन्म तिथि, समय व स्थान')}</label><textarea class="inp" id="bkPartner" rows="2"></textarea>` : ''}
      ${['num_baby'].includes(id) ? `<label class="f">${T('Baby/business details (DOB or founding date, preferred letter)', 'बच्चे/व्यापार का विवरण (जन्म/स्थापना तिथि, पसंदीदा अक्षर)')}</label><textarea class="inp" id="bkExtra" rows="2"></textarea>` : ''}
      <label class="f">${T('Your question / what you want to know', 'आपका सवाल / आप क्या जानना चाहते हैं')}</label><textarea class="inp" id="bkQ" rows="3">${esc(note || '')}</textarea>
      ${['call', 'tarot_live', 'sampoorna'].includes(id) ? `<label class="f">${T('Preferred day & time for the call', 'कॉल के लिए पसंदीदा दिन व समय')}</label><input class="inp" id="bkSlot" placeholder="${T('e.g. Sunday evening 6–8 pm', 'जैसे रविवार शाम 6–8 बजे')}">` : ''}
      <label class="f">🎟️ ${T('Coupon code (optional)', 'कूपन कोड (वैकल्पिक)')}</label><div class="row" style="flex-wrap:nowrap"><input class="inp" id="bkCoupon" style="text-transform:uppercase" value="${esc(LS.get('as_coupon') || '')}" placeholder="SHUBH11"><button class="btn btn-ghost" id="bkApply">${T('Apply', 'लगाएँ')}</button></div><div class="small" id="bkQuote"></div>
      <button class="btn btn-gold btn-lg btn-block" style="margin-top:16px" id="bkNext">${T('Continue to pay', 'भुगतान के लिए आगे बढ़ें')} <span id="bkAmt">₹${price}</span> →</button>
      <p class="tiny muted center" style="margin-top:8px">🔒 ${T('Your details are shared only with Manasvi ji for your reading.', 'आपकी जानकारी केवल आपकी रीडिंग के लिए मानसवी जी से साझा होगी।')}</p>`);
    log('booking_start', { meta: { service: id } });
    let q = App.localQuote(id, '');
    const applyCoupon = async () => { const code = $('#bkCoupon', m.el).value.trim(); q = await App.quote(id, code);
      $('#bkAmt', m.el).textContent = '₹' + q.final;
      $('#bkQuote', m.el).innerHTML = q.couponInvalid ? `<span style="color:var(--bad)">❌ ${T('Invalid coupon', 'अमान्य कूपन')}</span>` : q.coupon ? `<span style="color:var(--ok)">✅ ${q.coupon}: −₹${q.couponOff} · ${T('You pay', 'आप देंगे')} <b>₹${q.final}</b> (${T('saved', 'बचत')} ₹${q.base - q.final})</span>` : (q.after < q.base ? `<span style="color:var(--ok)">🎉 ${T('Launch offer applied', 'लॉन्च ऑफ़र लागू')} · ${T('You save', 'बचत')} ₹${q.base - q.after}</span>` : ''); };
    $('#bkApply', m.el).onclick = applyCoupon; applyCoupon();
    $('#bkNext', m.el).onclick = async () => { await applyCoupon(); if (q.couponInvalid) return toast(T('Remove or fix the coupon code', 'कूपन कोड हटाएँ या ठीक करें'));
      const g = sel => { const e = $(sel, m.el); return e ? e.value.trim() : ''; };
      const name = g('#bkName'), phone = g('#bkPhone');
      if (!name) return toast(T('Please enter your name', 'कृपया नाम लिखें'));
      if (phone.replace(/\D/g, '').length < 10) return toast(T('Please enter a valid WhatsApp number', 'कृपया सही WhatsApp नंबर लिखें'));
      LS.set('as_who', { name, phone });
      const details = { dob: g('#bkDob'), tob: g('#bkTob'), place: g('#bkPlace'), partner: g('#bkPartner'), extra: g('#bkExtra'), question: g('#bkQ'), slot: g('#bkSlot') };
      Object.keys(details).forEach(k => { if (!details[k]) delete details[k]; });
      if (me && me.input && details.dob === me.input.date) details.chart = App.chartSummary ? App.chartSummary(me) : undefined;
      payStep(m, s, q.final, { name, phone, details, coupon: q.coupon });
    };
  };
  function payStep(m, s, price, who) {
    const up = App.cfg.upi || DEFAULT_UPI, android = /Android/i.test(navigator.userAgent), ios = /iPhone|iPad|iPod/i.test(navigator.userAgent), mobile = android || ios;
    if (!up) { // payments switched off on server: fall back to WhatsApp booking
      const d = who.details, msg = `Radhe Radhe 🙏\nBooking: ${s.en} (₹${price}${who.coupon ? ', coupon ' + who.coupon : ''})\nName: ${who.name}\nPhone: ${who.phone}${d.dob ? `\nDOB: ${d.dob} ${d.tob || ''} ${d.place || ''}` : ''}${d.partner ? `\nPartner: ${d.partner}` : ''}${d.question ? `\nQuestion: ${d.question}` : ''}${d.slot ? `\nSlot: ${d.slot}` : ''}`;
      m.el.innerHTML = `<p>${T('Send your booking to Manasvi ji on WhatsApp — payment details will be shared there.', 'अपनी बुकिंग WhatsApp पर मानसवी जी को भेजें — भुगतान की जानकारी वहीं मिलेगी।')}</p><a class="btn btn-green btn-lg btn-block" target="_blank" rel="noopener" href="${waLink(msg)}">💬 ${T('Send on WhatsApp', 'WhatsApp पर भेजें')}</a>`; return;
    }
    // Standard NPCI UPI link — works with PhonePe, Google Pay, Paytm, BHIM and every bank app
    const q = `pa=${String(up.id).replace(/[^\w.@-]/g, '')}&pn=${encodeURIComponent(up.name)}&am=${price}.00&cu=INR&tn=${encodeURIComponent('AstroShree ' + s.id.replace(/_/g, ''))}`, link = 'upi://pay?' + q;
    const appBtn = (label, pkg, iosScheme, cls) => `<a class="btn ${cls} btn-sm" href="${android ? `intent://pay?${q}#Intent;scheme=upi;package=${pkg};end` : iosScheme + q}">${label}</a>`;
    m.setTitle(`📲 ${T('Pay', 'भुगतान')} ₹${price} ${T('by UPI', 'UPI से')}`);
    m.el.innerHTML = `<div class="upi-wrap"><div class="upi-qr">${qrSvg(link)}<div class="tiny muted">${T('Scan with any UPI app', 'किसी भी UPI ऐप से स्कैन करें')}</div></div>
      <div><div class="amt">₹${price}</div><div class="small">${T('UPI ID', 'UPI आईडी')}: <b>${esc(up.id)}</b> <button class="btn btn-ghost btn-sm" id="cpy">${T('Copy', 'कॉपी')}</button></div><div class="small muted">${T('Paying to', 'भुगतान')}: <b>${esc(up.name)}</b></div>
      ${mobile ? `<div class="paybtns">${appBtn('💜 PhonePe', 'com.phonepe.app', 'phonepe://pay?', 'pb-phonepe')}${appBtn('💙 Google Pay', 'com.google.android.apps.nbu.paisa.user', 'tez://upi/pay?', 'pb-gpay')}${appBtn('🩵 Paytm', 'net.one97.paytm', 'paytmmp://pay?', 'pb-paytm')}<a class="btn btn-sm pb-any" href="${link}">📲 ${T('Any UPI app', 'कोई भी UPI ऐप')}</a></div>` : `<p class="small muted" style="margin-top:8px">📱 ${T('Open GPay / PhonePe / Paytm on your phone → Scan → pay', 'फ़ोन पर GPay / PhonePe / Paytm खोलें → स्कैन करें → भुगतान करें')}</p>`}
      <button class="btn btn-ghost btn-sm" id="saveQr" style="margin-top:8px">⬇️ ${T('Save QR (scan from gallery)', 'QR सेव करें (गैलरी से स्कैन)')}</button></div></div>
      <ol class="steps"><li>${T('Pay exactly', 'ठीक')} <b>₹${price}</b> ${T('using the QR or UPI ID.', 'QR या UPI आईडी से भुगतान करें।')}</li><li>${T('Copy the 12-digit UTR / UPI Ref. No. from your payment app.', 'भुगतान ऐप से 12-अंकीय UTR / UPI Ref. No. कॉपी करें।')}</li><li>${T('Paste it below, add the screenshot and submit.', 'नीचे पेस्ट करें, स्क्रीनशॉट जोड़ें और सबमिट करें।')}</li></ol>
      <input class="inp" id="utr" inputmode="numeric" autocomplete="off" placeholder="${T('UTR / UPI reference number (12 digits)', 'UTR / UPI रेफ़रेंस नंबर (12 अंक)')}">
      <label class="shot" id="shotL"><input type="file" id="shotF" accept="image/*" hidden><span id="shotT">📷 ${T('Upload payment screenshot', 'भुगतान स्क्रीनशॉट अपलोड करें')}</span></label>
      <button class="btn btn-gold btn-lg btn-block" style="margin-top:12px" id="paid">${T('I have paid — confirm booking', 'मैंने भुगतान कर दिया — बुकिंग कन्फ़र्म करें')}</button>
      <p class="tiny muted center" style="margin-top:8px">${T('Problem paying?', 'भुगतान में समस्या?')} <a target="_blank" rel="noopener" href="${waLink(`Radhe Radhe 🙏 I need help paying ₹${price} for ${s.en}`)}">WhatsApp ${PHONE}</a></p>`;
    $('#cpy', m.el).onclick = () => { navigator.clipboard && navigator.clipboard.writeText(up.id); toast(T('UPI ID copied', 'UPI आईडी कॉपी हुई')); };
    $('#saveQr', m.el).onclick = () => { // render QR + amount on a canvas → PNG, so it can be scanned from the gallery in any UPI app
      const svg = $('.upi-qr svg', m.el), img = new Image(), url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
      img.onload = () => { const c = document.createElement('canvas'); c.width = 600; c.height = 760; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 600, 760); x.drawImage(img, 60, 120, 480, 480);
        x.fillStyle = '#1e1446'; x.font = 'bold 40px sans-serif'; x.textAlign = 'center'; x.fillText('Astro-Shree', 300, 70); x.font = 'bold 44px sans-serif'; x.fillStyle = '#9f1239'; x.fillText('₹' + price, 300, 660); x.font = '24px sans-serif'; x.fillStyle = '#444'; x.fillText(up.id + ' · GPay / PhonePe / Paytm', 300, 710);
        URL.revokeObjectURL(url); c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `AstroShree-UPI-${price}.png`; a.click(); toast(T('QR saved — open your UPI app → Scan → Gallery', 'QR सेव हुआ — UPI ऐप खोलें → स्कैन → गैलरी')); }); };
      img.src = url; };
    let shot = null;
    $('#shotF', m.el).onchange = async e => { const f = e.target.files[0]; if (!f) return; try { shot = await shrinkImage(f); $('#shotT', m.el).innerHTML = '✅ ' + T('Screenshot added', 'स्क्रीनशॉट जुड़ गया'); $('#shotL', m.el).classList.add('ok'); } catch (er) { shot = null; toast(T('Could not read that image', 'यह इमेज नहीं पढ़ी जा सकी')); } };
    $('#paid', m.el).onclick = async () => {
      const utr = $('#utr', m.el).value.replace(/\s/g, '').toUpperCase();
      if (!/^[A-Z0-9]{10,24}$/.test(utr)) { toast(T('Please paste the 12-digit UTR number', 'कृपया 12-अंकीय UTR नंबर डालें')); return $('#utr', m.el).focus(); }
      if (!shot) return toast(T('Please upload the payment screenshot', 'कृपया भुगतान स्क्रीनशॉट अपलोड करें'));
      const btn = $('#paid', m.el); btn.disabled = true; btn.innerHTML = '<span class="loading"></span> ' + T('Checking your payment…', 'आपका भुगतान जाँचा जा रहा है…');
      try {
        const r = await fetch('/api/pay', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'upi_request', service: s.id, coupon: who.coupon, name: who.name, phone: who.phone, utr, screenshot: shot, details: who.details, visitor_id: vid, lang }) });
        let j; try { j = await r.json(); } catch (er) { j = null; }
        if (!j || r.status === 404 || r.status === 405 || (r.status === 400 && /switched on/i.test(j.error || ''))) { // backend not reachable (e.g. preview) → hand over on WhatsApp
          const d = who.details, msg = `Radhe Radhe 🙏 Payment done ✅\nService: ${s.en}\nAmount: ₹${price}${who.coupon ? ' (coupon ' + who.coupon + ')' : ''}\nUTR: ${utr}\nName: ${who.name}\nPhone: ${who.phone}${d.dob ? `\nDOB: ${d.dob} ${d.tob || ''} ${d.place || ''}` : ''}${d.question ? `\nQuestion: ${d.question}` : ''}\n(Screenshot attached)`;
          m.setTitle('🙏 ' + T('Almost done!', 'बस एक कदम!'));
          m.el.innerHTML = `<p>${T('Send your payment details to Manasvi ji on WhatsApp and attach the screenshot.', 'भुगतान विवरण WhatsApp पर मानसवी जी को भेजें और स्क्रीनशॉट लगाएँ।')}</p><a class="btn btn-green btn-lg btn-block" target="_blank" rel="noopener" href="${waLink(msg)}">💬 ${T('Send on WhatsApp', 'WhatsApp पर भेजें')}</a>`; return; }
        if (!r.ok) throw new Error(j.error || 'Error');
        LS.set('as_bookings', (LS.get('as_bookings') || []).concat([{ id: j.booking, order: j.order_id, claim: j.claim, svc: s.id, t: Date.now() }]).slice(-20));
        const ok = j.status === 'paid', msg = `Radhe Radhe 🙏 I booked "${s.en}" (₹${price}). Booking #${j.booking}, UTR ${utr}. Name: ${who.name}`;
        m.setTitle(ok ? '✅ ' + T('Booking confirmed!', 'बुकिंग कन्फ़र्म!') : '⏳ ' + T('Booking received', 'बुकिंग प्राप्त हुई'));
        m.el.innerHTML = `<div class="center"><div style="font-size:3.4rem">${ok ? '🎉' : '🙏'}</div><h3>${T('Booking', 'बुकिंग')} #${esc(j.booking)}</h3>
          <p>${ok ? T('Your payment is verified. Manasvi ji will contact you on WhatsApp soon.', 'आपका भुगतान सत्यापित हो गया। मानसवी जी जल्द WhatsApp पर संपर्क करेंगी।') : T('We received your booking. Your payment will be verified shortly (usually within a few hours) and you will hear from us on WhatsApp.', 'आपकी बुकिंग मिल गई। भुगतान जल्द सत्यापित होगा (आमतौर पर कुछ घंटों में) और आपको WhatsApp पर सूचना मिलेगी।')}</p>
          <a class="btn btn-green btn-lg btn-block" target="_blank" rel="noopener" href="${waLink(msg)}">💬 ${T('Message Manasvi ji on WhatsApp', 'WhatsApp पर मानसवी जी को संदेश भेजें')}</a></div>`;
      } catch (e) { btn.disabled = false; btn.textContent = T('I have paid — confirm booking', 'मैंने भुगतान कर दिया — बुकिंग कन्फ़र्म करें'); toast(e.message, 5000); }
    };
  }

  /* ---------------- SHREE AI chat ---------------- */
  App.routes.chat = function (v) {
    const me = LS.get('as_me'); let hist = LS.get('as_chat', []);
    const usedKey = 'as_chat_' + todayKey(); const limit = App.cfg.chatPerDay || 7;
    v.innerHTML = App.phead('🤖 Shree AI — ' + T('Your Jyotish Companion', 'आपका ज्योतिष साथी'), T('Ask about career, marriage, remedies, numbers or tarot. If you made your kundli here, Shree AI reads it too.', 'करियर, विवाह, उपाय, अंक या टैरो के बारे में पूछें। यहाँ कुंडली बनाई है तो श्री AI उसे भी पढ़ेगा।')) +
      `<section class="sec-sm"><div class="wrap"><div class="chatbox"><div class="chat-head"><span style="font-size:1.8rem">🔮</span><div><b>Shree AI</b><div class="tiny" style="color:#ddd6fe">${me ? '✅ ' + T('Using your kundli', 'आपकी कुंडली के साथ') + ' (' + esc(me.name || '') + ')' : T('Tip: make your kundli for personal answers', 'सुझाव: व्यक्तिगत उत्तर के लिए कुंडली बनाएँ')}</div></div><button class="btn btn-sm btn-ghost" style="margin-left:auto" id="clr">${T('New chat', 'नई बातचीत')}</button></div>
        <div class="chat-log" id="log"></div>
        <div class="sugs" id="sugs">${[T('When will I get a job?', 'मेरी नौकरी कब लगेगी?'), T('Is my kundli Manglik?', 'क्या मेरी कुंडली मांगलिक है?'), T('Simple remedy for Shani', 'शनि के लिए सरल उपाय'), T('Lucky number for my business', 'मेरे व्यापार का शुभ अंक'), T('What does The Star tarot card mean?', 'द स्टार टैरो कार्ड का क्या अर्थ है?')].map(x => `<button>${x}</button>`).join('')}</div>
        <div class="chat-in"><input class="inp" id="q" placeholder="${T('Type your question…', 'अपना सवाल लिखें…')}" maxlength="1200"><button class="btn btn-gold" id="send">➤</button></div></div>
      <p class="center tiny muted" style="margin-top:10px">${T('Shree AI gives general guidance and can make mistakes. For a personal reading, ', 'श्री AI सामान्य मार्गदर्शन देता है और गलती कर सकता है। व्यक्तिगत रीडिंग के लिए ')}<a href="#" data-book="prashn">${T('ask Manasvi ji (₹51)', 'मानसवी जी से पूछें (₹51)')}</a>.</p></div></section>`;
    const logEl = $('#log');
    const paint = () => { logEl.innerHTML = `<div class="msg a">🙏 ${T('Radhe Radhe! I am Shree AI. Ask me anything about your stars, numbers or tarot.', 'राधे राधे! मैं श्री AI हूँ। अपने ग्रहों, अंकों या टैरो के बारे में कुछ भी पूछें।')}</div>` + hist.map(m => `<div class="msg ${m.role === 'user' ? 'u' : 'a'}">${esc(m.text)}</div>`).join(''); logEl.scrollTop = 1e6; };
    paint();
    $('#clr').onclick = () => { hist = []; LS.set('as_chat', hist); paint(); };
    const send = async text => {
      text = (text || '').trim(); if (!text) return;
      const used = LS.get(usedKey, 0);
      if (used >= limit) { logEl.insertAdjacentHTML('beforeend', `<div class="msg a">🙏 ${T(`You have used today's ${limit} free questions. Come back tomorrow, or get a personal answer from Manasvi ji.`, `आज के ${limit} फ़्री सवाल पूरे हो गए। कल फिर आएँ, या मानसवी जी से व्यक्तिगत उत्तर पाएँ।`)}<br><button class="btn btn-gold btn-sm" style="margin-top:8px" data-book="prashn" data-note="${esc(text)}">Ek Prashn ₹${App.price('prashn')}</button></div>`); logEl.scrollTop = 1e6; return; }
      hist.push({ role: 'user', text }); paint(); $('#q').value = '';
      logEl.insertAdjacentHTML('beforeend', '<div class="msg a typing" id="typ"><span></span><span></span><span></span></div>'); logEl.scrollTop = 1e6;
      try {
        const r = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: hist.slice(-10).map(m => ({ role: m.role === 'user' ? 'user' : 'ai', text: m.text })), lang, chart: me && App.chartSummary ? App.chartSummary(me) : null, visitor_id: vid }) });
        const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Error');
        hist.push({ role: 'ai', text: j.text }); LS.set(usedKey, used + 1); log('chat', { meta: { q: text.slice(0, 200) } });
      } catch (e) { hist.push({ role: 'ai', text: '🙏 ' + (e.message || T('Shree AI is resting. Please try again.', 'श्री AI अभी विश्राम में है। कृपया दोबारा प्रयास करें।')) }); }
      hist = hist.slice(-30); LS.set('as_chat', hist); paint();
    };
    $('#send').onclick = () => send($('#q').value); $('#q').onkeydown = e => { if (e.key === 'Enter') send($('#q').value); };
    $$('#sugs button').forEach(b => b.onclick = () => send(b.textContent));
  };

  /* ---------------- policies ---------------- */
  App.routes.privacy = v => { v.innerHTML = App.phead(T('Privacy Policy', 'गोपनीयता नीति')) + `<section class="sec"><div class="wrap card" style="max-width:860px">
    <p>${T('Astro-Shree (astro-shree.com), run by Manasvi Bharadwaj, respects your privacy.', 'एस्ट्रो-श्री (astro-shree.com), मानसवी भारद्वाज द्वारा संचालित, आपकी गोपनीयता का सम्मान करता है।')}</p>
    <h3>${T('What we collect', 'हम क्या एकत्र करते हैं')}</h3><ul><li>${T('Anonymous usage (which tools are used, approximate country) to improve the site.', 'साइट सुधारने के लिए गुमनाम उपयोग जानकारी (कौन से टूल, अनुमानित देश)।')}</li>
    <li>${T('Your name, WhatsApp number and birth details — only when you tick "save my details" or make a booking.', 'आपका नाम, WhatsApp नंबर और जन्म विवरण — केवल तब जब आप "मेरी जानकारी सेव करें" चुनें या बुकिंग करें।')}</li>
    <li>${T('For bookings: payment UTR number and screenshot, to verify your payment.', 'बुकिंग के लिए: भुगतान सत्यापन हेतु UTR नंबर और स्क्रीनशॉट।')}</li>
    <li>${T('Shree AI questions are sent to Google Gemini to generate answers; Google may process this text under its terms. Please do not share sensitive personal information in chat.', 'श्री AI के सवाल उत्तर बनाने के लिए Google Gemini को भेजे जाते हैं; Google अपनी शर्तों के अनुसार इसे प्रोसेस कर सकता है। कृपया चैट में संवेदनशील निजी जानकारी न लिखें।')}</li></ul>
    <h3>${T('How we use it', 'हम इसका उपयोग कैसे करते हैं')}</h3><p>${T('Only to give you readings, contact you about your booking, and (if you agreed) send occasional predictions on WhatsApp. We never sell your data.', 'केवल आपको रीडिंग देने, बुकिंग के बारे में संपर्क करने और (आपकी सहमति पर) कभी-कभी WhatsApp पर भविष्यफल भेजने के लिए। हम आपका डेटा कभी नहीं बेचते।')}</p>
    <h3>${T('Your choices', 'आपके विकल्प')}</h3><p>${T('Family Vault and saved kundlis stay in your own browser. To delete data we hold, message us on WhatsApp', 'परिवार तिजोरी और सेव कुंडलियाँ आपके अपने ब्राउज़र में रहती हैं। हमारे पास रखा डेटा हटवाने के लिए WhatsApp करें')} <a href="${waLink('Please delete my Astro-Shree data')}" target="_blank" rel="noopener">${PHONE}</a>.</p></div></section>`; };
  App.routes.terms = v => { v.innerHTML = App.phead(T('Terms & Refund Policy', 'नियम व रिफ़ंड नीति')) + `<section class="sec"><div class="wrap card" style="max-width:860px">
    <h3>${T('Services', 'सेवाएँ')}</h3><p>${T('Readings are spiritual guidance based on Vedic astrology, numerology and tarot. They are not a substitute for medical, legal, financial or psychological advice, and outcomes are not guaranteed. Games are for entertainment only.', 'रीडिंग वैदिक ज्योतिष, अंक ज्योतिष और टैरो पर आधारित आध्यात्मिक मार्गदर्शन हैं। ये चिकित्सा, कानूनी, वित्तीय या मनोवैज्ञानिक सलाह का विकल्प नहीं हैं और परिणाम की गारंटी नहीं है। गेम्स केवल मनोरंजन के लिए हैं।')}</p>
    <h3>${T('Delivery', 'डिलीवरी')}</h3><p>${T('Written readings are delivered on WhatsApp within the time shown on each service. Calls are scheduled with you on WhatsApp.', 'लिखित रीडिंग प्रत्येक सेवा पर दिखाए समय में WhatsApp पर दी जाती है। कॉल का समय WhatsApp पर आपके साथ तय होता है।')}</p>
    <h3>${T('Refunds', 'रिफ़ंड')}</h3><ul><li>${T('If we cannot deliver your reading or call, you get a full refund to the same UPI account.', 'यदि हम आपकी रीडिंग या कॉल नहीं दे पाते, तो उसी UPI खाते में पूरा रिफ़ंड मिलेगा।')}</li><li>${T('If you paid twice or the wrong amount, message us within 7 days for a refund of the extra amount.', 'दो बार या गलत राशि भुगतान होने पर 7 दिन में संदेश करें — अतिरिक्त राशि लौटाई जाएगी।')}</li><li>${T('Once a reading has been delivered or a call completed, the fee is non-refundable.', 'रीडिंग देने या कॉल पूरी होने के बाद शुल्क वापस नहीं होता।')}</li></ul>
    <p>${T('Contact', 'संपर्क')}: <a href="${waLink('Radhe Radhe 🙏')}" target="_blank" rel="noopener">WhatsApp ${PHONE}</a></p></div></section>`; };

  /* ---------------- start ---------------- */
  function start() {
    $('#langBtn').onclick = () => { lang = lang === 'hi' ? 'en' : 'hi'; LS.set('as_lang', lang); route(); };
    $('#burger').onclick = () => $('#menu').classList.toggle('open');
    addEventListener('hashchange', route);
    const t0 = Date.now(); fetch('/api/config').then(r => r.json()).then(j => { App.cfg = Object.assign(App.cfg, j || {}); if (['', 'seva'].includes(current) && Date.now() - t0 < 2500 && scrollY < 200) route(); }).catch(() => { });
    if (!LS.get('as_seen')) { LS.set('as_seen', 1); log('visit', { meta: { ref: document.referrer.slice(0, 200) } }); }
    route();
  }
  document.addEventListener('DOMContentLoaded', start);
})();
