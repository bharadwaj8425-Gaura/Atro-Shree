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
  const waLink = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
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
    document.documentElement.lang = lang; document.body.classList.toggle('hi', lang === 'hi');
    $('#foot').innerHTML = `<div class="grid g4">
      <div><h4>ॐ Astro-Shree</h4><p>${T('Vedic astrology, numerology & tarot with love and honesty — by Manasvi Bharadwaj.', 'प्रेम और ईमानदारी के साथ वैदिक ज्योतिष, अंक ज्योतिष और टैरो — मानसवी भारद्वाज द्वारा।')}</p>
        <a href="${waLink('Radhe Radhe 🙏')}" target="_blank" rel="noopener">💬 WhatsApp ${PHONE}</a><a href="${INSTA}" target="_blank" rel="noopener">📸 Instagram @astro_shree25_</a></div>
      <div><h4>${T('Free Tools', 'फ़्री टूल्स')}</h4><a href="#/kundli">${T('Janam Kundli', 'जन्म कुंडली')}</a><a href="#/milan">${T('Kundli Milan', 'कुंडली मिलान')}</a><a href="#/panchang">${T('Aaj ka Panchang', 'आज का पंचांग')}</a><a href="#/rashifal">${T('Daily Rashifal', 'दैनिक राशिफल')}</a><a href="#/numerology">${T('Numerology', 'अंक ज्योतिष')}</a><a href="#/tarot">${T('Tarot', 'टैरो')}</a></div>
      <div><h4>${T('Explore', 'और देखें')}</h4><a href="#/games">🎮 ${T('Divine Games', 'दिव्य गेम्स')}</a><a href="#/chat">🤖 Shree AI</a><a href="#/vault">👨‍👩‍👧 ${T('Family Kundli Vault', 'परिवार कुंडली तिजोरी')}</a><a href="#/blessings">🙏 ${T('Divine Blessings', 'दिव्य आशीर्वाद')}</a><a href="#/seva">💎 ${T('Book a Reading', 'रीडिंग बुक करें')}</a></div>
      <div><h4>${T('Policies', 'नीतियाँ')}</h4><a href="#/privacy">${T('Privacy Policy', 'गोपनीयता नीति')}</a><a href="#/terms">${T('Terms & Refund', 'नियम व रिफ़ंड')}</a><a href="#/seva">${T('Pricing', 'मूल्य')}</a></div></div>
      <div class="disc">© ${new Date().getFullYear()} Astro-Shree — Manasvi Bharadwaj. ${T('Astrology, numerology and tarot offer guidance based on traditional principles; results vary from person to person and are not guaranteed. They do not replace medical, legal or financial advice. Games are for entertainment.', 'ज्योतिष, अंक ज्योतिष और टैरो पारंपरिक सिद्धांतों पर आधारित मार्गदर्शन हैं; परिणाम व्यक्ति अनुसार अलग हो सकते हैं और गारंटी नहीं है। ये चिकित्सा, कानूनी या आर्थिक सलाह का विकल्प नहीं हैं। गेम्स केवल मनोरंजन हेतु हैं।')}</div>`;
  }
  App.phead = (title, sub) => `<section class="phead"><div class="wrap"><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div></section>`;
  App.ctaBook = (id, line) => { const s = SERVICES.find(x => x.id === id); return `<div class="cta-box no-print"><div><h3>${s.ic} ${T(s.en, s.hi)} — ₹${App.price(id)}</h3><div class="small" style="color:#ddd6fe">${line || T(s.time[0], s.time[1])}</div></div><button class="btn btn-gold" data-book="${id}">${T('Book now', 'अभी बुक करें')} →</button></div>`; };

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

  /* ---------------- HOME ---------------- */
  function wheelSVG() {
    const J = window.Jyotish; let s = '<svg viewBox="0 0 400 400" class="wheel" aria-hidden="true"><defs><linearGradient id="gw" x1="0" x2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs>';
    s += '<circle cx="200" cy="200" r="196" fill="none" stroke="url(#gw)" stroke-width="3"/><circle cx="200" cy="200" r="150" fill="none" stroke="#fbbf24" stroke-opacity=".5"/>';
    for (let i = 0; i < 12; i++) { const a = (i * 30 - 90) * Math.PI / 180, a2 = ((i * 30 + 15) - 90) * Math.PI / 180;
      s += `<line x1="${200 + 150 * Math.cos(a)}" y1="${200 + 150 * Math.sin(a)}" x2="${200 + 196 * Math.cos(a)}" y2="${200 + 196 * Math.sin(a)}" stroke="#fbbf24" stroke-opacity=".6"/>`;
      s += `<text x="${200 + 173 * Math.cos(a2)}" y="${200 + 173 * Math.sin(a2)}" fill="#fde68a" font-size="24" text-anchor="middle" dominant-baseline="central">${J.RASHI[i].sym}</text>`; }
    s += '</svg><svg viewBox="0 0 400 400" class="wheel2" aria-hidden="true">';
    for (let i = 0; i < 27; i++) { const a = (i * 360 / 27 - 90) * Math.PI / 180; s += `<circle cx="${200 + 180 * Math.cos(a)}" cy="${200 + 180 * Math.sin(a)}" r="${i % 3 ? 3 : 5}" fill="#fde68a" fill-opacity="${i % 3 ? .6 : 1}"/>`; }
    return s + '<circle cx="200" cy="200" r="190" fill="none" stroke="#c4b5fd" stroke-opacity=".35" stroke-dasharray="4 8"/></svg>';
  }
  function starfield(canvas) {
    const ctx = canvas.getContext('2d'); let w, h, stars = [], raf;
    const size = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; stars = Array.from({ length: Math.min(220, Math.floor(w * h / 5000)) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + .2, t: Math.random() * 6, s: Math.random() * .02 + .005 })); };
    const draw = () => { if (!canvas.isConnected) return cancelAnimationFrame(raf); ctx.clearRect(0, 0, w, h); stars.forEach(s => { s.t += s.s; ctx.globalAlpha = .35 + .65 * Math.abs(Math.sin(s.t)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); }); raf = requestAnimationFrame(draw); };
    size(); draw(); addEventListener('resize', size, { once: true });
  }
  App.routes[''] = function (v) {
    const J = window.Jyotish, me = LS.get('as_me'), city = LS.get('as_city') || window.AS_CITIES[0];
    const streak = (LS.get('as_streak') || { n: 0 }).n;
    const st = App.cfg.stats;
    v.innerHTML = `
    <section class="hero"><canvas id="stars"></canvas><div class="wrap">
      <div>
        <span class="kicker" style="color:#fbbf24">✨ ${T('Jyotish · Numerology · Tarot', 'ज्योतिष · अंक ज्योतिष · टैरो')}</span>
        <h1>${T('Know your stars.', 'अपने सितारों को जानें,')}<br><span class="gold-text">${T('Shape your destiny.', 'अपना भाग्य संवारें।')}</span></h1>
        <p class="lead">${T('Free Janam Kundli with dasha, Kundli Milan, daily Panchang, Numerology, Tarot and fun divine games — plus personal guidance from Manasvi ji, starting at just ₹51.', 'दशा सहित फ़्री जन्म कुंडली, कुंडली मिलान, दैनिक पंचांग, अंक ज्योतिष, टैरो और मज़ेदार दिव्य गेम्स — साथ में मानसवी जी से व्यक्तिगत मार्गदर्शन, सिर्फ़ ₹51 से।')}</p>
        <div class="chips"><a class="chip" href="#/kundli">🪐 ${T('Free Kundli', 'फ़्री कुंडली')}</a><a class="chip" href="#/milan">💞 ${T('Gun Milan', 'गुण मिलान')}</a><a class="chip" href="#/numerology">🔢 ${T('Lo Shu Grid', 'लो शू ग्रिड')}</a><a class="chip" href="#/tarot">🃏 ${T('Daily Tarot', 'आज का टैरो')}</a><a class="chip" href="#/chat">🤖 Shree AI</a></div>
        <div class="row" style="${innerWidth < 860 ? 'justify-content:center' : ''}"><a class="btn btn-gold btn-lg" href="#/kundli">🪐 ${T('Make my free Kundli', 'मेरी फ़्री कुंडली बनाएँ')}</a><a class="btn btn-violet btn-lg" href="#/games">🎮 ${T('Play Divine Games', 'दिव्य गेम्स खेलें')}</a></div>
      </div>
      <div class="wheel-box">${wheelSVG()}<div class="wheel-center"><img src="images/manasvi.jpg" alt="Manasvi Bharadwaj"></div>
        <div class="hero-badge" style="top:6%;left:0">🌕 ${T('Live Panchang', 'लाइव पंचांग')}</div><div class="hero-badge" style="bottom:10%;right:0;animation-delay:1s">🎮 ${T('12+ free games', '12+ फ़्री गेम्स')}</div><div class="hero-badge" style="bottom:2%;left:8%;animation-delay:2s">🙏 ${T('From ₹51', '₹51 से')}</div></div>
    </div></section>
    <section class="band"><div class="wrap grid g4">
      <div><b>${st && st.kundli ? (st.kundli + 100).toLocaleString('en-IN') + '+' : '27'}</b>${st && st.kundli ? T('Kundlis made here', 'कुंडलियाँ बनीं') : T('Nakshatras decoded', 'नक्षत्रों का ज्ञान')}</div>
      <div><b>5+</b>${T('Years of Manasvi ji\'s practice', 'वर्षों का अनुभव')}</div><div><b>12+</b>${T('Free divine games', 'फ़्री दिव्य गेम्स')}</div><div><b>₹51</b>${T('Personal reading starts', 'से व्यक्तिगत रीडिंग')}</div></div></section>

    <section class="sec"><div class="wrap center"><span class="kicker">${T('100% free tools', '100% फ़्री टूल्स')}</span><h2 class="title">${T('Everything AstroSage has — and more', 'सब कुछ एक ही जगह — और भी ज़्यादा')}</h2>
      <p class="sub">${T('Accurate Lahiri-ayanamsa calculations, in Hindi and English, no sign-up needed.', 'लाहिड़ी अयनांश की सटीक गणना, हिंदी और अंग्रेज़ी में, बिना साइन-अप।')}</p>
      <div class="grid g4" style="text-align:left">${[
        ['kundli', '🪐', 'Janam Kundli', 'जन्म कुंडली', 'Lagna & Navamsa chart, planets, Vimshottari dasha, Manglik', 'लग्न व नवांश चार्ट, ग्रह, विंशोत्तरी दशा, मांगलिक'],
        ['milan', '💞', 'Kundli Milan', 'कुंडली मिलान', '36-gun Ashtakoota with Nadi, Bhakoot & Manglik check', 'नाड़ी, भकूट और मांगलिक सहित 36 गुण मिलान'],
        ['panchang', '📅', 'Aaj ka Panchang', 'आज का पंचांग', 'Tithi, nakshatra, yoga, Rahu kaal, sunrise for your city', 'तिथि, नक्षत्र, योग, राहुकाल, सूर्योदय — आपके शहर का'],
        ['rashifal', '♈', 'Daily Rashifal', 'दैनिक राशिफल', 'Real Chandra-gochar based daily horoscope', 'असली चंद्र गोचर पर आधारित दैनिक राशिफल'],
        ['numerology', '🔢', 'Numerology', 'अंक ज्योतिष', 'Mulank, Bhagyank, Lo Shu grid, name & mobile number check', 'मूलांक, भाग्यांक, लो शू ग्रिड, नाम व मोबाइल नंबर जाँच'],
        ['tarot', '🃏', 'Tarot Reading', 'टैरो रीडिंग', 'Card of the day, 3-card spread, Yes/No tarot', 'आज का कार्ड, 3-कार्ड रीडिंग, हाँ/ना टैरो'],
        ['chat', '🤖', 'Shree AI Jyotish', 'श्री AI ज्योतिष', 'Ask anything — it reads your kundli too', 'कुछ भी पूछें — आपकी कुंडली पढ़कर जवाब'],
        ['vault', '👨‍👩‍👧', 'Family Kundli Vault', 'परिवार कुंडली तिजोरी', 'Save the whole family, get birthday & dasha alerts', 'पूरे परिवार की कुंडली, जन्मदिन व दशा अलर्ट']
      ].map(x => `<a class="card tool" href="#/${x[0]}">${['chat', 'vault'].includes(x[0]) ? `<span class="tag new">${T('NEW', 'नया')}</span>` : `<span class="tag">${T('FREE', 'फ़्री')}</span>`}<span class="ic">${x[1]}</span><h3>${T(x[2], x[3])}</h3><p>${T(x[4], x[5])}</p></a>`).join('')}</div></div></section>

    <section class="sec-sm"><div class="wrap"><div class="games-banner"><div class="floaters"><span style="top:10%;right:6%">🎲</span><span style="bottom:12%;right:22%;animation-delay:1s">🃏</span><span style="top:18%;right:34%;animation-delay:2s">🔮</span><span style="bottom:8%;right:4%;animation-delay:.5s">🪔</span></div>
      <span class="streak">🔥 ${streak} ${T('day streak', 'दिन की स्ट्रीक')}</span>
      <h2 style="margin-top:14px">🎮 ${T('Divine Game Zone', 'दिव्य गेम ज़ोन')}</h2>
      <p style="max-width:560px;color:#fde68a">${T('Spin the Kismat Wheel, pick a divine card, find your lucky number, colour & angel number, ask the Yes/No oracle and more. Play daily, grow your streak, unlock badges and share with friends!', 'किस्मत का पहिया घुमाएँ, दिव्य कार्ड चुनें, शुभ अंक, रंग और एंजेल नंबर जानें, हाँ/ना ओरेकल से पूछें और बहुत कुछ। रोज़ खेलें, स्ट्रीक बढ़ाएँ, बैज जीतें और दोस्तों से शेयर करें!')}</p>
      <a class="btn btn-gold btn-lg" href="#/games">${T('Play now — it\'s free', 'अभी खेलें — बिल्कुल फ़्री')} →</a></div></div></section>

    <section class="sec dark"><div class="wrap grid g2" style="align-items:start">
      <div class="card"><span class="kicker">📅 ${T('Today', 'आज')} · ${esc(city.name)}</span><div id="homePan"><span class="loading"></span></div><a class="btn btn-sm btn-gold" style="margin-top:12px" href="#/panchang">${T('Full Panchang', 'पूरा पंचांग')} →</a></div>
      <div class="card"><span class="kicker">♈ ${T('Today\'s Rashifal', 'आज का राशिफल')}</span><p class="small muted">${T('Tap your Moon sign', 'अपनी चंद्र राशि चुनें')}</p>
        <div class="rashis" style="grid-template-columns:repeat(6,1fr);gap:6px">${J.RASHI.map((r, i) => `<a href="#/rashifal/${i}" class="rashi" style="padding:8px 2px;color:var(--ink);text-decoration:none"><span class="s" style="font-size:1.4rem">${r.sym}</span><small style="font-size:.68rem">${T(r.en, r.hi)}</small></a>`).join('')}</div>
        ${me ? `<p class="small" style="margin-top:12px">⭐ ${T('Your rashi', 'आपकी राशि')}: <b>${T(J.RASHI[me.moonSign].en, J.RASHI[me.moonSign].hi)}</b> — <a style="color:#fbbf24" href="#/rashifal/${me.moonSign}">${T('read now', 'अभी पढ़ें')}</a></p>` : ''}</div>
    </div></section>

    <section class="sec"><div class="wrap center"><span class="kicker">🙏 ${T('Personal guidance', 'व्यक्तिगत मार्गदर्शन')}</span><h2 class="title">${T('Jyotish Seva by Manasvi ji', 'मानसवी जी की ज्योतिष सेवा')}</h2><p class="sub">${T('Pay safely by any UPI app. Your booking is confirmed instantly on WhatsApp.', 'किसी भी UPI ऐप से सुरक्षित भुगतान। बुकिंग तुरंत WhatsApp पर कन्फ़र्म।')}</p>
      <div class="grid g3" style="text-align:left">${['prashn', 'num_report', 'tarot_celtic', 'call', 'sampoorna', 'milan'].map(svcCard).join('')}</div>
      <a class="btn btn-violet" style="margin-top:22px" href="#/seva">${T('See all 11 services', 'सभी 11 सेवाएँ देखें')} →</a></div></section>

    <section class="sec" style="background:#fff7ed"><div class="wrap manasvi"><img src="images/manasvi.jpg" alt="Manasvi Bharadwaj">
      <div><span class="kicker">${T('Meet your Jyotishi', 'आपकी ज्योतिषी')}</span><h2 class="title">Manasvi Bharadwaj</h2>
      <p>${T('Namaste! I am Manasvi, a dedicated practitioner of Vedic Astrology with 5 years of experience in guiding people through the cosmic map of their lives. My passion lies in decoding the ancient wisdom of the Vedas to offer clarity, direction and effective remedies.', 'नमस्ते! मैं मानसवी हूँ — 5 वर्षों से वैदिक ज्योतिष के माध्यम से लोगों को उनके जीवन के ब्रह्मांडीय मानचित्र में मार्गदर्शन दे रही हूँ। वेदों के प्राचीन ज्ञान से स्पष्टता, दिशा और प्रभावी उपाय देना मेरा जुनून है।')}</p>
      <p>${T('My expertise includes Numerology, Kundali Matching, Tarot, Past Analysis, Future Predictions & Chart Reading. I believe in an ethical, compassionate approach that empowers you to understand your karma and make informed choices.', 'मेरी विशेषज्ञता: अंक ज्योतिष, कुंडली मिलान, टैरो, भूतकाल विश्लेषण, भविष्यवाणी और चार्ट रीडिंग। मैं नैतिक और करुणामय दृष्टिकोण में विश्वास रखती हूँ जो आपको अपने कर्म को समझने और सही निर्णय लेने में सक्षम बनाए।')}</p>
      <p><b>${T('Let\'s explore the divine plan together. 🙏', 'आइए, साथ मिलकर दिव्य योजना को समझें। 🙏')}</b></p>
      <div class="row"><button class="btn btn-gold" data-book="call">📞 ${T('Talk to Manasvi ji', 'मानसवी जी से बात करें')}</button><a class="btn btn-ghost" href="${INSTA}" target="_blank" rel="noopener">📸 Instagram</a></div></div></div></section>

    <section class="sec dark"><div class="wrap grid g2" style="align-items:center">
      <div class="center"><img src="https://i.pinimg.com/736x/65/20/f8/6520f84dd398620b95488c1f2f0426fb.jpg" alt="Shri Hanuman Ji" style="max-width:300px;margin:0 auto;border-radius:20px;box-shadow:0 0 60px rgba(251,191,36,.35)" loading="lazy"></div>
      <div><h2 class="title" style="color:#fbbf24">${T('Strength, Devotion, Service', 'शक्ति, भक्ति, सेवा')}</h2><p>${T('Drawing inspiration from the unwavering devotion and immense strength of Shri Hanuman Ji, we strive to serve you with dedication and integrity. May his blessings remove obstacles from your path.', 'श्री हनुमान जी की अटूट भक्ति और अपार शक्ति से प्रेरणा लेकर हम पूरी निष्ठा और ईमानदारी से आपकी सेवा करते हैं। उनकी कृपा आपके मार्ग की बाधाएँ दूर करे।')}</p><p>${T('Astrology helps us understand the cosmic play, while faith and righteous action empower us to navigate it. Jai Shri Ram!', 'ज्योतिष हमें ब्रह्मांड की लीला समझाता है, और श्रद्धा व सत्कर्म उसमें आगे बढ़ने की शक्ति देते हैं। जय श्री राम!')}</p><a class="btn btn-gold" href="#/blessings">🙏 ${T('Divine Blessings', 'दिव्य आशीर्वाद')}</a></div></div></section>

    <section class="sec"><div class="wrap"><div class="center"><span class="kicker">💬 ${T('Anubhav', 'अनुभव')}</span><h2 class="title">${T('What our clients say', 'हमारे क्लाइंट्स क्या कहते हैं')}</h2></div>
      <div class="grid g3" id="reviews"><div class="center muted"><span class="loading"></span></div></div>
      <div class="card" style="max-width:640px;margin:26px auto 0"><h3>✍️ ${T('Share your experience', 'अपना अनुभव साझा करें')}</h3>
        <div class="fgrid"><div><label class="f">${T('Name', 'नाम')}</label><input class="inp" id="rvName"></div><div><label class="f">${T('City', 'शहर')}</label><input class="inp" id="rvCity"></div></div>
        <label class="f">${T('Rating', 'रेटिंग')}</label><div class="stars-row" id="rvStars" style="font-size:1.8rem;cursor:pointer">★★★★★</div>
        <label class="f">${T('Your words', 'आपके शब्द')}</label><textarea class="inp" id="rvText" rows="3"></textarea>
        <button class="btn btn-violet" style="margin-top:12px" id="rvSend">${T('Submit review', 'समीक्षा भेजें')}</button><p class="tiny muted">${T('Reviews appear after a quick check by Manasvi ji.', 'मानसवी जी की जाँच के बाद समीक्षा दिखेगी।')}</p></div></div></section>

    <section class="sec" style="background:#fff7ed"><div class="wrap faq" style="max-width:820px"><div class="center"><span class="kicker">❓ ${T('Prashn', 'प्रश्न')}</span><h2 class="title">${T('Common questions', 'आम सवाल')}</h2></div>
      ${[['How accurate is the free kundli?', 'फ़्री कुंडली कितनी सटीक है?', 'Planet positions are computed with a modern astronomical engine and Lahiri ayanamsa — the same standard used by Indian panchangs. Accuracy depends most on your exact birth time.', 'ग्रहों की गणना आधुनिक खगोलीय इंजन और लाहिड़ी अयनांश से होती है — वही मानक जो भारतीय पंचांग उपयोग करते हैं। सटीकता सबसे ज़्यादा आपके सही जन्म समय पर निर्भर है।'],
        ['How do I pay and when will I get my reading?', 'भुगतान कैसे करें और रीडिंग कब मिलेगी?', 'Choose a service, scan the UPI QR (or tap Pay on mobile), then upload the payment screenshot with the UTR number. Your booking is checked instantly and Manasvi ji contacts you on WhatsApp within the promised time.', 'सेवा चुनें, UPI QR स्कैन करें (या मोबाइल पर Pay दबाएँ), फिर UTR नंबर के साथ स्क्रीनशॉट अपलोड करें। बुकिंग तुरंत जाँची जाती है और मानसवी जी तय समय में WhatsApp पर संपर्क करती हैं।'],
        ['What is the difference between Sun sign and Moon sign (Rashi)?', 'सूर्य राशि और चंद्र राशि में क्या फ़र्क है?', 'Western astrology uses your Sun sign (birth date). Vedic astrology gives most importance to your Moon sign or Rashi — the sign where the Moon was at your birth. Our Rashifal is based on Rashi.', 'पश्चिमी ज्योतिष सूर्य राशि (जन्म तिथि) देखता है। वैदिक ज्योतिष में चंद्र राशि सबसे महत्वपूर्ण है — जन्म के समय चंद्रमा जिस राशि में था। हमारा राशिफल चंद्र राशि पर आधारित है।'],
        ['Are remedies guaranteed to work?', 'क्या उपाय निश्चित काम करते हैं?', 'Remedies are suggested from traditional principles to help reduce difficulties. Results depend on many factors — karma, faith and correct practice — so specific results cannot be guaranteed.', 'उपाय पारंपरिक सिद्धांतों से कठिनाइयाँ कम करने के लिए सुझाए जाते हैं। परिणाम कर्म, श्रद्धा और सही विधि जैसे कई कारकों पर निर्भर हैं, इसलिए निश्चित परिणाम की गारंटी नहीं।'],
        ['Is my data safe?', 'क्या मेरा डेटा सुरक्षित है?', 'Your birth details stay in your browser unless you choose to share them. If you tick "save my details", they are stored securely only so Astro-Shree can guide you — never sold.', 'आपकी जन्म जानकारी आपके ब्राउज़र में ही रहती है, जब तक आप साझा करना न चुनें। "मेरी जानकारी सेव करें" चुनने पर ही सुरक्षित रूप से सहेजी जाती है — कभी बेची नहीं जाती।']
      ].map(q => `<details><summary>${T(q[0], q[1])}</summary><p class="muted">${T(q[2], q[3])}</p></details>`).join('')}</div></section>

    <section class="sec"><div class="wrap center"><span class="kicker">🤝 ${T('Divine Connect', 'दिव्य संपर्क')}</span><h2 class="title">${T('Connect with Astro-Shree', 'एस्ट्रो-श्री से जुड़ें')}</h2>
      <div class="grid g3" style="max-width:900px;margin:0 auto">
        <a class="card tool" href="${waLink('Radhe Radhe 🙏 I want guidance from Manasvi ji')}" target="_blank" rel="noopener"><span class="ic">💬</span><h3>WhatsApp</h3><p>${PHONE}</p></a>
        <a class="card tool" href="${INSTA}" target="_blank" rel="noopener"><span class="ic">📸</span><h3>Instagram</h3><p>@astro_shree25_</p></a>
        <a class="card tool" href="#/seva"><span class="ic">🙏</span><h3>${T('Book a Reading', 'रीडिंग बुक करें')}</h3><p>${T('UPI · from ₹51', 'UPI · ₹51 से')}</p></a></div></div></section>`;
    starfield($('#stars'));
    // mini panchang
    setTimeout(() => { try { const p = J.panchang(todayKey(), city.lat, city.lon, city.tz); App.tz = city.tz;
      $('#homePan').innerHTML = `<div class="grid g2" style="gap:10px">${[[T('Tithi', 'तिथि'), `${T(p.tithi.paksha, p.tithi.pakshaHi)} ${T(p.tithi.en, p.tithi.hi)}`], [T('Nakshatra', 'नक्षत्र'), T(p.nakshatra.en, p.nakshatra.hi)], [T('Sunrise', 'सूर्योदय'), fmtTime(p.sunrise)], [T('Sunset', 'सूर्यास्त'), fmtTime(p.sunset)], [T('Rahu Kaal', 'राहुकाल'), fmtTime(p.rahuKaal.start) + '–' + fmtTime(p.rahuKaal.end)], [T('Yoga', 'योग'), T(p.yoga.en, p.yoga.hi)]].map(x => `<div class="stat" style="background:rgba(255,255,255,.06);border-color:rgba(251,191,36,.2)"><small style="color:#c4b5fd">${x[0]}</small><b style="color:#fff">${x[1]}</b></div>`).join('')}</div>`; } catch (e) { $('#homePan').textContent = '—'; } }, 30);
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
        : `<div class="card center" style="grid-column:1/-1"><p class="muted">${T('Be the first to share your Astro-Shree experience below 🙏', 'नीचे अपना एस्ट्रो-श्री अनुभव साझा करने वाले पहले व्यक्ति बनें 🙏')}</p></div>`;
    } catch (e) { box.innerHTML = ''; }
  }
  function svcCard(id) {
    const s = SERVICES.find(x => x.id === id);
    return `<div class="card svc">${s.best ? `<span class="ribbon">${T('BEST VALUE', 'सबसे बढ़िया')}</span>` : s.hot ? `<span class="ribbon" style="background:var(--violet)">${T('POPULAR', 'लोकप्रिय')}</span>` : ''}
      <div style="font-size:2rem">${s.ic}</div><h3 style="font-size:1.08rem;margin-top:6px">${T(s.en, s.hi)}</h3><div class="price">₹${App.price(s.id)}</div>
      <ul>${s.pts.map(p => `<li>${T(p[0], p[1])}</li>`).join('')}</ul><div class="tiny muted" style="margin-bottom:10px">⏱️ ${T(s.time[0], s.time[1])}</div>
      <button class="btn btn-gold btn-block" data-book="${s.id}">${T('Book now', 'अभी बुक करें')}</button></div>`;
  }
  App.svcCard = svcCard;

  /* ---------------- SEVA (services & booking) ---------------- */
  App.routes.seva = function (v, rest) {
    const cats = [['all', '✨', 'All', 'सभी'], ['jyotish', '🪐', 'Jyotish', 'ज्योतिष'], ['numerology', '🔢', 'Numerology', 'अंक ज्योतिष'], ['tarot', '🃏', 'Tarot', 'टैरो'], ['combo', '👑', 'Combo', 'कॉम्बो']];
    let cat = rest[0] && cats.some(c => c[0] === rest[0]) ? rest[0] : 'all';
    v.innerHTML = App.phead('🙏 ' + T('Jyotish Seva — Book a Reading', 'ज्योतिष सेवा — रीडिंग बुक करें'), T('Personal readings by Manasvi Bharadwaj. Pay by any UPI app — GPay, PhonePe, Paytm, BHIM.', 'मानसवी भारद्वाज द्वारा व्यक्तिगत रीडिंग। किसी भी UPI ऐप से भुगतान — GPay, PhonePe, Paytm, BHIM।')) +
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
    const s = SERVICES.find(x => x.id === id); if (!s) return; const price = App.price(id);
    const me = LS.get('as_me'), who = LS.get('as_who') || {};
    const needsBirth = !['tarot_one', 'tarot_celtic', 'tarot_live'].includes(id), twoPeople = id === 'milan';
    const m = modal(`${s.ic} ${T(s.en, s.hi)} · ₹${price}`, `
      <div class="fgrid"><div><label class="f">${T('Your name', 'आपका नाम')} *</label><input class="inp" id="bkName" value="${esc(who.name || (me && me.name) || '')}"></div>
      <div><label class="f">${T('WhatsApp number', 'WhatsApp नंबर')} *</label><input class="inp" id="bkPhone" inputmode="tel" value="${esc(who.phone || '')}" placeholder="10-digit"></div></div>
      ${needsBirth ? `<div class="fgrid"><div><label class="f">${T('Date of birth', 'जन्म तिथि')}</label><input class="inp" type="date" id="bkDob" value="${esc(me && me.input ? me.input.date : '')}"></div><div><label class="f">${T('Birth time', 'जन्म समय')}</label><input class="inp" type="time" id="bkTob" value="${esc(me && me.input ? me.input.time : '')}"></div></div>
        <label class="f">${T('Birth place', 'जन्म स्थान')}</label><input class="inp" id="bkPlace" value="${esc(me && me.input ? me.input.place || '' : '')}">` : ''}
      ${twoPeople ? `<label class="f">${T('Partner\'s name, birth date, time & place', 'साथी का नाम, जन्म तिथि, समय व स्थान')}</label><textarea class="inp" id="bkPartner" rows="2"></textarea>` : ''}
      ${['num_baby'].includes(id) ? `<label class="f">${T('Baby/business details (DOB or founding date, preferred letter)', 'बच्चे/व्यापार का विवरण (जन्म/स्थापना तिथि, पसंदीदा अक्षर)')}</label><textarea class="inp" id="bkExtra" rows="2"></textarea>` : ''}
      <label class="f">${T('Your question / what you want to know', 'आपका सवाल / आप क्या जानना चाहते हैं')}</label><textarea class="inp" id="bkQ" rows="3">${esc(note || '')}</textarea>
      ${['call', 'tarot_live', 'sampoorna'].includes(id) ? `<label class="f">${T('Preferred day & time for the call', 'कॉल के लिए पसंदीदा दिन व समय')}</label><input class="inp" id="bkSlot" placeholder="${T('e.g. Sunday evening 6–8 pm', 'जैसे रविवार शाम 6–8 बजे')}">` : ''}
      <button class="btn btn-gold btn-lg btn-block" style="margin-top:16px" id="bkNext">${T('Continue to pay', 'भुगतान के लिए आगे बढ़ें')} ₹${price} →</button>
      <p class="tiny muted center" style="margin-top:8px">🔒 ${T('Your details are shared only with Manasvi ji for your reading.', 'आपकी जानकारी केवल आपकी रीडिंग के लिए मानसवी जी से साझा होगी।')}</p>`);
    log('booking_start', { meta: { service: id } });
    $('#bkNext', m.el).onclick = () => {
      const g = sel => { const e = $(sel, m.el); return e ? e.value.trim() : ''; };
      const name = g('#bkName'), phone = g('#bkPhone');
      if (!name) return toast(T('Please enter your name', 'कृपया नाम लिखें'));
      if (phone.replace(/\D/g, '').length < 10) return toast(T('Please enter a valid WhatsApp number', 'कृपया सही WhatsApp नंबर लिखें'));
      LS.set('as_who', { name, phone });
      const details = { dob: g('#bkDob'), tob: g('#bkTob'), place: g('#bkPlace'), partner: g('#bkPartner'), extra: g('#bkExtra'), question: g('#bkQ'), slot: g('#bkSlot') };
      Object.keys(details).forEach(k => { if (!details[k]) delete details[k]; });
      if (me && me.input && details.dob === me.input.date) details.chart = App.chartSummary ? App.chartSummary(me) : undefined;
      payStep(m, s, price, { name, phone, details });
    };
  };
  function payStep(m, s, price, who) {
    const up = App.cfg.upi, mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!up) { // payments not configured on server: fall back to WhatsApp booking
      const d = who.details, msg = `Radhe Radhe 🙏\nBooking: ${s.en} (₹${price})\nName: ${who.name}\nPhone: ${who.phone}${d.dob ? `\nDOB: ${d.dob} ${d.tob || ''} ${d.place || ''}` : ''}${d.partner ? `\nPartner: ${d.partner}` : ''}${d.question ? `\nQuestion: ${d.question}` : ''}${d.slot ? `\nSlot: ${d.slot}` : ''}`;
      m.el.innerHTML = `<p>${T('Send your booking to Manasvi ji on WhatsApp — payment details will be shared there.', 'अपनी बुकिंग WhatsApp पर मानसवी जी को भेजें — भुगतान की जानकारी वहीं मिलेगी।')}</p><a class="btn btn-green btn-lg btn-block" target="_blank" rel="noopener" href="${waLink(msg)}">💬 ${T('Send on WhatsApp', 'WhatsApp पर भेजें')}</a>`; return;
    }
    const note = `Astro-Shree ${s.en}`.slice(0, 50), link = `upi://pay?pa=${encodeURIComponent(up.id)}&pn=${encodeURIComponent(up.name)}&am=${price}.00&cu=INR&tn=${encodeURIComponent(note)}`;
    m.setTitle(`📲 ${T('Pay', 'भुगतान')} ₹${price} ${T('by UPI', 'UPI से')}`);
    m.el.innerHTML = `<div class="upi-wrap"><div class="upi-qr">${qrSvg(link)}<div class="tiny muted">${T('Scan with any UPI app', 'किसी भी UPI ऐप से स्कैन करें')}</div></div>
      <div><div class="amt">₹${price}</div><div class="small">${T('UPI ID', 'UPI आईडी')}: <b>${esc(up.id)}</b> <button class="btn btn-ghost btn-sm" id="cpy">${T('Copy', 'कॉपी')}</button></div><div class="small muted">${T('Paying to', 'भुगतान')}: <b>${esc(up.name)}</b></div>
      ${mobile ? `<a class="btn btn-violet btn-block" style="margin-top:10px" href="${link}">${T('Open UPI app & pay', 'UPI ऐप खोलें और भुगतान करें')} →</a>` : ''}</div></div>
      <ol class="steps"><li>${T('Pay exactly', 'ठीक')} <b>₹${price}</b> ${T('using the QR or UPI ID.', 'QR या UPI आईडी से भुगतान करें।')}</li><li>${T('Copy the 12-digit UTR / UPI Ref. No. from your payment app.', 'भुगतान ऐप से 12-अंकीय UTR / UPI Ref. No. कॉपी करें।')}</li><li>${T('Paste it below, add the screenshot and submit.', 'नीचे पेस्ट करें, स्क्रीनशॉट जोड़ें और सबमिट करें।')}</li></ol>
      <input class="inp" id="utr" inputmode="numeric" autocomplete="off" placeholder="${T('UTR / UPI reference number (12 digits)', 'UTR / UPI रेफ़रेंस नंबर (12 अंक)')}">
      <label class="shot" id="shotL"><input type="file" id="shotF" accept="image/*" hidden><span id="shotT">📷 ${T('Upload payment screenshot', 'भुगतान स्क्रीनशॉट अपलोड करें')}</span></label>
      <button class="btn btn-gold btn-lg btn-block" style="margin-top:12px" id="paid">${T('I have paid — confirm booking', 'मैंने भुगतान कर दिया — बुकिंग कन्फ़र्म करें')}</button>
      <p class="tiny muted center" style="margin-top:8px">${T('Problem paying?', 'भुगतान में समस्या?')} <a target="_blank" rel="noopener" href="${waLink(`Radhe Radhe 🙏 I need help paying ₹${price} for ${s.en}`)}">WhatsApp ${PHONE}</a></p>`;
    $('#cpy', m.el).onclick = () => { navigator.clipboard && navigator.clipboard.writeText(up.id); toast(T('UPI ID copied', 'UPI आईडी कॉपी हुई')); };
    let shot = null;
    $('#shotF', m.el).onchange = async e => { const f = e.target.files[0]; if (!f) return; try { shot = await shrinkImage(f); $('#shotT', m.el).innerHTML = '✅ ' + T('Screenshot added', 'स्क्रीनशॉट जुड़ गया'); $('#shotL', m.el).classList.add('ok'); } catch (er) { shot = null; toast(T('Could not read that image', 'यह इमेज नहीं पढ़ी जा सकी')); } };
    $('#paid', m.el).onclick = async () => {
      const utr = $('#utr', m.el).value.replace(/\s/g, '').toUpperCase();
      if (!/^[A-Z0-9]{10,24}$/.test(utr)) { toast(T('Please paste the 12-digit UTR number', 'कृपया 12-अंकीय UTR नंबर डालें')); return $('#utr', m.el).focus(); }
      if (!shot) return toast(T('Please upload the payment screenshot', 'कृपया भुगतान स्क्रीनशॉट अपलोड करें'));
      const btn = $('#paid', m.el); btn.disabled = true; btn.innerHTML = '<span class="loading"></span> ' + T('Checking your payment…', 'आपका भुगतान जाँचा जा रहा है…');
      try {
        const r = await fetch('/api/pay', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'upi_request', service: s.id, name: who.name, phone: who.phone, utr, screenshot: shot, details: who.details, visitor_id: vid, lang }) });
        const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Error');
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
