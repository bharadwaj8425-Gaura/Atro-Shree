/* Astro-Shree — tool pages: Kundli, Milan, Panchang, Rashifal, Numerology, Tarot, Family Vault, Blessings */
(function () {
  'use strict';
  const App = window.App, { $, $$, esc, T, LS, toast, log } = App;
  const J = () => window.Jyotish, AS = () => window.AS;
  const rn = i => T(J().RASHI[i].en + ' (' + J().RASHI[i].sa + ')', J().RASHI[i].hi);
  const nk = i => T(J().NAK[i].en, J().NAK[i].hi);
  const pl = p => T(p, J().PLANETS[p].hi);
  const fd = d => App.fmtDate(d);

  App.chartSummary = k => ({
    name: k.name, lagna: J().RASHI[k.lagna.sign].en, moon_sign: J().RASHI[k.moonSign].en, sun_sign: J().RASHI[k.sunSign].en, nakshatra: J().NAK[k.nakshatra].en + ' pada ' + k.pada,
    planets: (k.planets || []).map(p => `${p.name} in ${J().RASHI[p.sign].en} house ${p.house}${p.retro && p.name !== 'Rahu' && p.name !== 'Ketu' ? ' (R)' : ''}${p.dignity ? ' ' + p.dignity : ''}`).join('; '),
    current_dasha: k.current ? `${k.current.md.lord} mahadasha / ${k.current.ad.lord} antardasha (till ${new Date(k.current.ad.end).toISOString().slice(0, 10)})` : '', manglik: k.manglik && k.manglik.status, birth: k.input && `${k.input.date} ${k.input.time} ${k.input.place || ''}`
  });
  function revive(k) { // dates come back from localStorage as strings
    k.birthUTC = new Date(k.birthUTC); k.dashas.forEach(d => { d.start = new Date(d.start); d.end = new Date(d.end); d.sub.forEach(s => { s.start = new Date(s.start); s.end = new Date(s.end); }); });
    k.current = J().currentDasha(k.dashas); return k;
  }
  App.makeKundli = (inp) => { const k = J().kundli(inp); k.name = inp.name; k.gender = inp.gender; return k; };

  /* shared birth form */
  function birthForm(prefix, title, saved) {
    return `<div class="card"><h3>${title}</h3>
      <div class="fgrid"><div><label class="f">${T('Full name', 'पूरा नाम')}</label><input class="inp" id="${prefix}Name" value="${esc(saved && saved.name || '')}"></div>
      <div><label class="f">${T('Gender', 'लिंग')}</label><select class="inp" id="${prefix}Gender"><option value="m">${T('Male', 'पुरुष')}</option><option value="f" ${saved && saved.gender === 'f' ? 'selected' : ''}>${T('Female', 'महिला')}</option></select></div>
      <div><label class="f">${T('Date of birth', 'जन्म तिथि')} *</label><input class="inp" type="date" id="${prefix}Date" max="2100-12-31" value="${esc(saved && saved.date || '')}"></div>
      <div><label class="f">${T('Time of birth', 'जन्म समय')} *</label><input class="inp" type="time" id="${prefix}Time" value="${esc(saved && saved.time || '')}"></div></div>
      <label class="f">${T('Place of birth', 'जन्म स्थान')} *</label><div id="${prefix}Place"></div></div>`;
  }
  function readBirth(prefix, getPlace) {
    const g = id => ($('#' + prefix + id) || {}).value || '';
    const place = getPlace(), date = g('Date'), time = g('Time');
    if (!date) { toast(T('Please enter date of birth', 'कृपया जन्म तिथि डालें')); return null; }
    if (!time) { toast(T('Please enter birth time (approximate is OK)', 'कृपया जन्म समय डालें (अनुमानित भी चलेगा)')); return null; }
    if (!place) { toast(T('Please select birth place from the list', 'कृपया सूची से जन्म स्थान चुनें')); return null; }
    return { name: g('Name').trim(), gender: g('Gender'), date, time, lat: place.lat, lon: place.lon, tz: place.tz, place: place.name + (place.country && place.country !== 'India' ? ', ' + place.country : ''), placeObj: place };
  }

  /* ================= KUNDLI ================= */
  App.routes.kundli = function (v, rest) {
    const saved = LS.get('as_me');
    v.innerHTML = App.phead('🪐 ' + T('Free Janam Kundli', 'फ़्री जन्म कुंडली'), T('Lagna & Navamsa charts, planet positions, Vimshottari dasha, Manglik dosha and personal insights — calculated with Lahiri ayanamsa.', 'लग्न व नवांश चार्ट, ग्रह स्थिति, विंशोत्तरी दशा, मांगलिक दोष और व्यक्तिगत फल — लाहिड़ी अयनांश से गणना।')) +
      `<section class="sec-sm"><div class="wrap" style="max-width:760px">${birthForm('k', T('Enter birth details', 'जन्म विवरण भरें'), saved && saved.input ? Object.assign({ name: saved.name, gender: saved.gender }, saved.input) : null)}
      <div class="card" style="margin-top:14px"><label class="check"><input type="checkbox" id="kSave"> <span>${T('✅ Save my details with Astro-Shree & send me free monthly predictions on WhatsApp', '✅ मेरी जानकारी एस्ट्रो-श्री के साथ सेव करें और WhatsApp पर फ़्री मासिक भविष्यफल भेजें')}</span></label>
        <div id="kPhoneBox" class="hide"><label class="f">${T('WhatsApp number', 'WhatsApp नंबर')}</label><input class="inp" id="kPhone" inputmode="tel" value="${esc((LS.get('as_who') || {}).phone || '')}"></div>
        <button class="btn btn-gold btn-lg btn-block" style="margin-top:14px" id="kGo">🪐 ${T('Generate my Kundli', 'मेरी कुंडली बनाएँ')}</button>
        <p class="tiny muted center">${T('Your birth details stay in your browser unless you tick the box above.', 'ऊपर बॉक्स न चुनें तो आपका जन्म विवरण आपके ब्राउज़र में ही रहता है।')} <a href="#/privacy">${T('Privacy', 'गोपनीयता')}</a></p></div></div></section><div id="kOut"></div>`;
    const getPlace = App.placeField($('#kPlace'), saved && saved.input && saved.input.placeObj);
    $('#kSave').onchange = e => $('#kPhoneBox').classList.toggle('hide', !e.target.checked);
    $('#kGo').onclick = () => {
      const inp = readBirth('k', getPlace); if (!inp) return;
      const consent = $('#kSave').checked, phone = ($('#kPhone').value || '').trim();
      if (consent && phone.replace(/\D/g, '').length < 10) return toast(T('Please enter your WhatsApp number', 'कृपया WhatsApp नंबर डालें'));
      let k; try { k = App.makeKundli(inp); } catch (e) { return toast('Error: ' + e.message); }
      LS.set('as_me', k); LS.set('as_city', inp.placeObj);
      if (consent) LS.set('as_who', Object.assign(LS.get('as_who') || {}, { name: inp.name, phone }));
      log('kundli', { consent, name: inp.name, phone: consent ? phone : null, city: inp.place, birth: consent ? { date: inp.date, time: inp.time, place: inp.place, lat: inp.lat, lon: inp.lon, gender: inp.gender } : null,
        meta: { lagna: k.lagna.sign, moon: k.moonSign, nak: k.nakshatra, manglik: k.manglik.status } });
      renderKundli($('#kOut'), k); $('#kOut').scrollIntoView({ behavior: 'smooth' });
    };
    if (saved && saved.dashas && rest[0] === 'me') { renderKundli($('#kOut'), revive(saved)); }
  };
  function renderKundli(out, k) {
    const R = J().RASHI, AS_ = AS(), me = k, lagnaLord = R[k.lagna.sign].lord, moonLord = R[k.moonSign].lord;
    const gem = AS_.GEM[lagnaLord] || ['—', '—'], cur = k.current, num = AS_.numerology(k.input.date, k.name);
    const mg = { none: [T('Not Manglik', 'मांगलिक नहीं'), 'g'], mild: [T('Mild Manglik', 'आंशिक मांगलिक'), 'y'], high: [T('Manglik', 'मांगलिक'), 'r'], cancelled: [T('Manglik — cancelled (Mars strong)', 'मांगलिक — भंग (मंगल बलवान)'), 'g'] }[k.manglik.status];
    const dignity = d => d ? `<span class="pill ${d === 'debilitated' ? 'r' : 'g'}">${T(d, { exalted: 'उच्च', own: 'स्वराशि', debilitated: 'नीच' }[d])}</span>` : '';
    out.innerHTML = `<section class="sec-sm"><div class="wrap">
      <div class="card"><div class="row between"><div><span class="kicker">🪐 ${T('Janam Kundli', 'जन्म कुंडली')}</span><h2 style="margin:0">${esc(k.name || T('Your Kundli', 'आपकी कुंडली'))}</h2><div class="small muted">${fd(new Date(k.input.date + 'T12:00:00'))} · ${esc(k.input.time)} · ${esc(k.input.place || '')}</div></div>
        <div class="row no-print"><button class="btn btn-ghost btn-sm" onclick="print()">🖨️ ${T('Print / PDF', 'प्रिंट / PDF')}</button><button class="btn btn-ghost btn-sm" id="kVault">👨‍👩‍👧 ${T('Save to Family Vault', 'परिवार तिजोरी में सेव')}</button><a class="btn btn-violet btn-sm" href="#/chat">🤖 ${T('Ask Shree AI', 'श्री AI से पूछें')}</a></div></div>
      <div class="grid g4" style="margin-top:16px">${[[T('Lagna (Ascendant)', 'लग्न'), rn(k.lagna.sign) + ' ' + k.lagna.deg], [T('Moon sign (Rashi)', 'चंद्र राशि'), rn(k.moonSign)], [T('Nakshatra', 'नक्षत्र'), nk(k.nakshatra) + ' · ' + T('Pada', 'पद') + ' ' + k.pada], [T('Sun sign', 'सूर्य राशि'), rn(k.sunSign)],
        [T('Tithi at birth', 'जन्म तिथि (पंचांग)'), T(k.tithiAtBirth.paksha + ' ' + k.tithiAtBirth.en, k.tithiAtBirth.pakshaHi + ' ' + k.tithiAtBirth.hi)], [T('Gana · Nadi', 'गण · नाड़ी'), k.gana + ' · ' + k.nadi], [T('Yoni · Varna', 'योनि · वर्ण'), J().YONI_NAMES[k.yoni] + ' · ' + ['Shudra', 'Vaishya', 'Kshatriya', 'Brahmin'][k.varna]], [T('Manglik', 'मांगलिक'), `<span class="pill ${mg[1]}">${mg[0]}</span>`]]
        .map(x => `<div class="stat"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')}</div></div>

      <div class="grid g2" style="margin-top:18px"><div class="card center"><h3>${T('Lagna Chart (D1)', 'लग्न कुंडली (D1)')}</h3>${J().chartSVG(k, { lang: App.lang })}<p class="tiny muted">${T('North Indian style · numbers are rashis · * = retrograde', 'उत्तर भारतीय शैली · अंक = राशि · * = वक्री')}</p></div>
        <div class="card center"><h3>${T('Navamsa Chart (D9)', 'नवांश कुंडली (D9)')}</h3>${J().chartSVG(k, { lang: App.lang, navamsa: true, stroke: '#6d28d9', bg: '#faf5ff' })}<p class="tiny muted">${T('D9 shows marriage, dharma & inner strength', 'D9 विवाह, धर्म और आंतरिक शक्ति दर्शाता है')}</p></div></div>

      <div class="card" style="margin-top:18px"><h3>🌌 ${T('Planet positions', 'ग्रह स्थिति')}</h3><div class="scroll"><table class="t"><tr><th>${T('Planet', 'ग्रह')}</th><th>${T('Rashi', 'राशि')}</th><th>${T('Degree', 'अंश')}</th><th>${T('House', 'भाव')}</th><th>${T('Nakshatra', 'नक्षत्र')}</th><th>${T('Status', 'स्थिति')}</th></tr>
        <tr><td><b>${T('Lagna', 'लग्न')}</b></td><td>${rn(k.lagna.sign)}</td><td>${k.lagna.deg}</td><td>1</td><td>${nk(k.lagna.nak)}</td><td></td></tr>
        ${k.planets.map(p => `<tr><td><b>${pl(p.name)}</b></td><td>${rn(p.sign)}</td><td>${p.deg}</td><td>${p.house}</td><td>${nk(p.nak)} (${p.pada})</td><td>${p.retro && !['Rahu', 'Ketu'].includes(p.name) ? `<span class="pill y">${T('Retro', 'वक्री')}</span> ` : ''}${dignity(p.dignity)}</td></tr>`).join('')}</table></div></div>

      <div class="grid g2" style="margin-top:18px">
        <div class="card"><h3>✨ ${T('Your nature', 'आपका स्वभाव')}</h3><p><b>${T('Lagna', 'लग्न')} ${rn(k.lagna.sign)}:</b> ${T(AS_.LAGNA_TXT[k.lagna.sign][0], AS_.LAGNA_TXT[k.lagna.sign][1])}</p><p><b>${T('Moon in', 'चंद्र')} ${rn(k.moonSign)}:</b> ${T(AS_.LAGNA_TXT[k.moonSign][0], AS_.LAGNA_TXT[k.moonSign][1])}</p>
          <p class="small"><b>${T('Lagna lord', 'लग्नेश')}:</b> ${pl(lagnaLord)} · <b>${T('Rashi lord', 'राशि स्वामी')}:</b> ${pl(moonLord)}</p>
          <p class="small">💎 ${T('Gem associated with your lagna lord', 'लग्नेश से जुड़ा रत्न')}: <b>${T(gem[0], gem[1])}</b> — ${T('wear only after a personal chart check.', 'केवल व्यक्तिगत कुंडली जाँच के बाद पहनें।')}</p></div>
        <div class="card"><h3>⏳ ${T('Running dasha', 'चल रही दशा')}</h3>${cur ? `<p style="font-size:1.1rem"><b>${pl(cur.md.lord)}</b> ${T('Mahadasha', 'महादशा')} → <b>${pl(cur.ad.lord)}</b> ${T('Antardasha', 'अंतर्दशा')}</p>
          <p class="small muted">${fd(cur.md.start)} – ${fd(cur.md.end)} · ${T('Antardasha till', 'अंतर्दशा')} ${fd(cur.ad.end)} ${T('', 'तक')}</p><p>${T(AS_.DASHA_TXT[cur.md.lord][0], AS_.DASHA_TXT[cur.md.lord][1])}</p><p class="small">${T('Sub-period', 'अंतर्दशा')} ${pl(cur.ad.lord)}: ${T(AS_.DASHA_TXT[cur.ad.lord][0], AS_.DASHA_TXT[cur.ad.lord][1])}</p>` : ''}
          <p class="small">🔢 ${T('Mulank', 'मूलांक')} <b>${num.mulank}</b> · ${T('Bhagyank', 'भाग्यांक')} <b>${num.bhagyank}</b> — <a href="#/numerology">${T('full numerology', 'पूरा अंक ज्योतिष')}</a></p></div></div>

      <div class="card" style="margin-top:18px"><h3>📆 ${T('Vimshottari Mahadasha', 'विंशोत्तरी महादशा')}</h3><p class="tiny muted">${T('Tap a dasha to see its antardashas', 'अंतर्दशा देखने के लिए दशा पर टैप करें')}</p>
        ${k.dashas.map((d, i) => `<details ${cur && cur.md.lord === d.lord && +cur.md.start === +d.start ? 'open' : ''} style="border-bottom:1px solid var(--line);padding:8px 0"><summary><b>${pl(d.lord)}</b> <span class="muted small">${fd(d.start)} → ${fd(d.end)}</span></summary>
          <div class="scroll"><table class="t" style="margin-top:6px">${d.sub.map(s => `<tr ${cur && +cur.ad.start === +s.start ? 'style="background:#fef3c7"' : ''}><td>${pl(d.lord)} / ${pl(s.lord)}</td><td class="small">${fd(s.start)} → ${fd(s.end)}</td></tr>`).join('')}</table></div></details>`).join('')}</div>

      <div class="card" style="margin-top:18px"><h3>🔥 ${T('Manglik (Kuja) dosha', 'मांगलिक (कुज) दोष')}</h3><p><span class="pill ${mg[1]}">${mg[0]}</span></p>
        <p class="small">${T('Mars from Lagna', 'लग्न से मंगल')}: ${T('house', 'भाव')} ${k.planets[2].house} ${k.manglik.fromLagna ? '⚠️' : '✓'} · ${T('from Moon', 'चंद्र से')}: ${k.manglik.fromMoon ? '⚠️' : '✓'}</p>
        <p class="small muted">${T('Manglik dosha is checked from houses 1, 2, 4, 7, 8 and 12. Many cancellations exist — for marriage, always check both charts together.', 'मांगलिक दोष भाव 1, 2, 4, 7, 8, 12 से देखा जाता है। इसके कई परिहार होते हैं — विवाह के लिए दोनों कुंडलियाँ साथ जाँचें।')}</p></div>
      <div style="margin-top:18px">${App.ctaBook('kundli_report', T('Manasvi ji reads your full chart: career, marriage, health, wealth + personal remedies', 'मानसवी जी आपकी पूरी कुंडली पढ़ेंगी: करियर, विवाह, स्वास्थ्य, धन + व्यक्तिगत उपाय'))}</div>
    </div></section>`;
    $('#kVault').onclick = () => { const fam = LS.get('as_family', []); if (!fam.some(f => f.date === k.input.date && f.time === k.input.time && f.name === k.name)) { fam.push({ name: k.name || 'Me', relation: T('Self', 'स्वयं'), date: k.input.date, time: k.input.time, place: k.input.placeObj, gender: k.gender }); LS.set('as_family', fam); } toast(T('Saved to Family Vault 👨‍👩‍👧', 'परिवार तिजोरी में सेव हुआ 👨‍👩‍👧')); log('vault', { meta: { action: 'add' } }); };
  }

  /* ================= MILAN ================= */
  App.routes.milan = function (v) {
    const me = LS.get('as_me'), mine = me && me.input ? Object.assign({ name: me.name, gender: me.gender }, me.input) : null;
    v.innerHTML = App.phead('💞 ' + T('Kundli Milan — 36 Gun Matching', 'कुंडली मिलान — 36 गुण'), T('Traditional Ashtakoota matching with Nadi, Bhakoot and Manglik check for both partners.', 'दोनों के लिए नाड़ी, भकूट और मांगलिक जाँच सहित पारंपरिक अष्टकूट मिलान।')) +
      `<section class="sec-sm"><div class="wrap"><div class="grid g2">${birthForm('b', '🤵 ' + T('Boy\'s details', 'लड़के का विवरण'), mine && mine.gender === 'm' ? mine : null)}${birthForm('g', '👰 ' + T('Girl\'s details', 'लड़की का विवरण'), mine && mine.gender === 'f' ? mine : null)}</div>
      <div class="center" style="margin-top:16px"><button class="btn btn-gold btn-lg" id="mGo">💞 ${T('Match Kundli', 'कुंडली मिलाएँ')}</button></div></div></section><div id="mOut"></div>`;
    const gb = App.placeField($('#bPlace'), mine && mine.gender === 'm' ? mine.placeObj : null), gg = App.placeField($('#gPlace'), mine && mine.gender === 'f' ? mine.placeObj : null);
    $('#gGender').value = 'f';
    $('#mGo').onclick = () => {
      const a = readBirth('b', gb); if (!a) return; const b = readBirth('g', gg); if (!b) return;
      const ka = App.makeKundli(a), kb = App.makeKundli(b), m = J().gunMilan(ka.planets[1].lon, kb.planets[1].lon);
      log('milan', { meta: { total: m.total, nadi: m.nadiDosha, bhakoot: m.bhakootDosha } });
      const col = m.total >= 28 ? '#16a34a' : m.total >= 18 ? '#f59e0b' : '#dc2626';
      const verdict = { excellent: T('Excellent match — highly compatible 🌟', 'उत्तम मिलान — बहुत अनुकूल 🌟'), good: T('Good match — acceptable for marriage 👍', 'अच्छा मिलान — विवाह के लिए स्वीकार्य 👍'), low: T('Below 18 — traditionally not recommended without remedies', '18 से कम — परंपरागत रूप से उपाय बिना अनुशंसित नहीं') }[m.verdict];
      const mgTxt = s => ({ none: T('Not Manglik', 'मांगलिक नहीं'), mild: T('Mild Manglik', 'आंशिक मांगलिक'), high: T('Manglik', 'मांगलिक'), cancelled: T('Manglik (cancelled)', 'मांगलिक (भंग)') }[s]);
      const isM = s => s === 'mild' || s === 'high', mgOk = isM(ka.manglik.status) === isM(kb.manglik.status);
      $('#mOut').innerHTML = `<section class="sec-sm"><div class="wrap"><div class="card"><div class="grid g2" style="align-items:center">
        <div class="center"><div class="dial" style="--p:${m.total / 36 * 100};--c:${col}"><div><div><b style="color:${col}">${m.total}</b><span class="muted">/ 36 ${T('Gun', 'गुण')}</span></div></div></div><h3 style="margin-top:14px;color:${col}">${verdict}</h3></div>
        <div><p>🤵 <b>${esc(a.name || T('Boy', 'लड़का'))}</b>: ${rn(ka.moonSign)}, ${nk(ka.nakshatra)} · ${mgTxt(ka.manglik.status)}</p><p>👰 <b>${esc(b.name || T('Girl', 'लड़की'))}</b>: ${rn(kb.moonSign)}, ${nk(kb.nakshatra)} · ${mgTxt(kb.manglik.status)}</p>
          <p>${m.nadiDosha ? '⚠️ <b>' + T('Nadi dosha present', 'नाड़ी दोष है') + '</b> — ' + T('same Nadi; remedies/expert check advised.', 'एक ही नाड़ी; उपाय/विशेषज्ञ जाँच की सलाह।') : '✅ ' + T('No Nadi dosha', 'नाड़ी दोष नहीं')}</p>
          <p>${m.bhakootDosha ? '⚠️ <b>' + T('Bhakoot dosha present', 'भकूट दोष है') + '</b>' : '✅ ' + T('No Bhakoot dosha', 'भकूट दोष नहीं')}</p>
          <p>${mgOk ? '✅ ' + T('Manglik status is balanced', 'मांगलिक स्थिति संतुलित है') : '⚠️ ' + T('Only one partner is Manglik — needs expert review', 'केवल एक साथी मांगलिक है — विशेषज्ञ जाँच ज़रूरी')}</p></div></div></div>
        <div class="card" style="margin-top:16px"><h3>${T('Ashtakoota details', 'अष्टकूट विवरण')}</h3><div class="scroll"><table class="t"><tr><th>${T('Koota', 'कूट')}</th><th>${T('Boy', 'लड़का')}</th><th>${T('Girl', 'लड़की')}</th><th>${T('Points', 'अंक')}</th><th style="width:30%">${T('Meaning', 'अर्थ')}</th></tr>
          ${m.kootas.map(x => `<tr><td><b>${T(x.en, x.hi)}</b></td><td>${esc(x.b)}</td><td>${esc(x.g)}</td><td><b>${x.got}</b> / ${x.max}<div class="bar" style="margin-top:4px"><i style="width:${x.got / x.max * 100}%"></i></div></td><td class="small muted">${esc(x.about)}</td></tr>`).join('')}</table></div></div>
        <div style="margin-top:16px">${App.ctaBook('milan', T('Gun score is only the start — Manasvi ji checks both full charts, doshas & remedies.', 'गुण सिर्फ़ शुरुआत है — मानसवी जी दोनों पूरी कुंडलियाँ, दोष व उपाय देखती हैं।'))}</div></div></section>`;
      $('#mOut').scrollIntoView({ behavior: 'smooth' });
    };
  };

  /* ================= PANCHANG ================= */
  App.routes.panchang = function (v) {
    let city = LS.get('as_city') || window.AS_CITIES.find(c => c.name === 'Mathura');
    v.innerHTML = App.phead('📅 ' + T('Aaj ka Panchang', 'आज का पंचांग'), T('Tithi, Nakshatra, Yoga, Karana, sunrise-sunset and Rahu Kaal for your city.', 'आपके शहर के लिए तिथि, नक्षत्र, योग, करण, सूर्योदय-सूर्यास्त और राहुकाल।')) +
      `<section class="sec-sm"><div class="wrap" style="max-width:980px"><div class="card"><div class="fgrid"><div><label class="f">${T('Date', 'तारीख़')}</label><input class="inp" type="date" id="pDate" value="${App.todayKey()}"></div><div><label class="f">${T('City', 'शहर')}</label><div id="pPlace"></div></div></div>
      <button class="btn btn-gold" style="margin-top:12px" id="pGo">${T('Show Panchang', 'पंचांग देखें')}</button></div><div id="pOut" style="margin-top:18px"></div></div></section>`;
    const gp = App.placeField($('#pPlace'), city);
    const show = () => {
      const c = gp() || city; city = c; LS.set('as_city', c); App.tz = c.tz;
      let p; try { p = J().panchang($('#pDate').value || App.todayKey(), c.lat, c.lon, c.tz); } catch (e) { return toast(e.message); }
      log('panchang', { meta: { city: c.name } });
      const t = App.fmtTime, rng = x => x ? t(x.start) + ' – ' + t(x.end) : '—', end = d => `<div class="tiny muted">${T('till', 'तक')} ${t(d)}${new Date(d).getDate() !== p.sunrise.getDate() ? ' (' + App.fmtDate(d, { year: undefined }) + ')' : ''}</div>`;
      $('#pOut').innerHTML = `<div class="card"><div class="row between"><h2 style="margin:0">${App.fmtDate(new Date(p.date + 'T12:00:00'), { weekday: 'long' })}</h2><span class="pill">📍 ${esc(c.name)}</span></div>
        <div class="grid g3" style="margin-top:14px">
          <div class="stat"><small>${T('Vaar', 'वार')}</small><b>${T(p.vaar.en, p.vaar.hi)}</b></div>
          <div class="stat"><small>${T('Tithi', 'तिथि')}</small><b>${T(p.tithi.paksha + ' ' + p.tithi.en, p.tithi.pakshaHi + ' ' + p.tithi.hi)}</b>${end(p.tithi.end)}</div>
          <div class="stat"><small>${T('Nakshatra', 'नक्षत्र')}</small><b>${T(p.nakshatra.en, p.nakshatra.hi)}</b>${end(p.nakshatra.end)}</div>
          <div class="stat"><small>${T('Yoga', 'योग')}</small><b>${T(p.yoga.en, p.yoga.hi)}</b>${end(p.yoga.end)}</div>
          <div class="stat"><small>${T('Karana', 'करण')}</small><b>${T(p.karana.en, p.karana.hi)}</b></div>
          <div class="stat"><small>${T('Moon in', 'चंद्र राशि')}</small><b>${rn(p.moonSign)}</b></div>
          <div class="stat"><small>☀️ ${T('Sunrise / Sunset', 'सूर्योदय / सूर्यास्त')}</small><b>${t(p.sunrise)} / ${t(p.sunset)}</b></div>
          <div class="stat"><small>🌙 ${T('Moonrise / Moonset', 'चंद्रोदय / चंद्रास्त')}</small><b>${t(p.moonrise)} / ${t(p.moonset)}</b></div>
          <div class="stat"><small>${T('Sun in', 'सूर्य राशि')}</small><b>${rn(p.sunSign)}</b></div></div>
        <h3 style="margin-top:20px">⏰ ${T('Muhurat timings', 'मुहूर्त समय')}</h3><div class="grid g4">
          <div class="stat" style="background:#fef2f2;border-color:#fecaca"><small>🚫 ${T('Rahu Kaal', 'राहुकाल')}</small><b>${rng(p.rahuKaal)}</b></div>
          <div class="stat" style="background:#fef2f2;border-color:#fecaca"><small>🚫 ${T('Yamaganda', 'यमगंड')}</small><b>${rng(p.yamaganda)}</b></div>
          <div class="stat" style="background:#fffbeb"><small>⚠️ ${T('Gulika Kaal', 'गुलिक काल')}</small><b>${rng(p.gulika)}</b></div>
          <div class="stat" style="background:#f0fdf4;border-color:#bbf7d0"><small>✅ ${T('Abhijit Muhurat', 'अभिजीत मुहूर्त')}</small><b>${p.abhijit ? rng(p.abhijit) : T('Not on Wednesday', 'बुधवार को नहीं')}</b></div></div>
        <p class="tiny muted" style="margin-top:12px">${T('Panchang elements are taken at local sunrise (Udaya tithi). Times in', 'पंचांग तत्व स्थानीय सूर्योदय (उदया तिथि) पर। समय')} ${esc(c.tz)}.</p></div>`;
    };
    $('#pGo').onclick = show; show();
  };

  /* ================= RASHIFAL ================= */
  App.routes.rashifal = function (v, rest) {
    const me = LS.get('as_me'); let sel = rest[0] != null && rest[0] !== '' ? +rest[0] : (me ? me.moonSign : null);
    v.innerHTML = App.phead('♈ ' + T('Daily Rashifal', 'दैनिक राशिफल'), T('Based on today\'s real Moon transit (Chandra gochar) from your Moon sign — the Vedic way.', 'आपकी चंद्र राशि से आज के असली चंद्र गोचर पर आधारित — वैदिक पद्धति।')) +
      `<section class="sec-sm"><div class="wrap"><div class="rashis">${J().RASHI.map((r, i) => `<button class="rashi" data-r="${i}"><span class="s">${r.sym}</span><b>${T(r.en, r.hi)}</b><br><small>${r.sa}</small></button>`).join('')}</div>
      <p class="center small muted" style="margin-top:12px">${T('Don\'t know your Moon sign?', 'अपनी चंद्र राशि नहीं पता?')} <a href="#/kundli">${T('Find it with free Kundli', 'फ़्री कुंडली से जानें')}</a></p><div id="rOut"></div></div></section>`;
    const show = i => {
      sel = i; $$('.rashi', v).forEach(b => b.classList.toggle('on', +b.dataset.r === i));
      const now = new Date(), tom = new Date(now.getTime() + 864e5), ms = J().moonSignNow(now), mt = J().moonSignNow(new Date(tom.setHours(9)));
      const d = AS().rashifal(i, ms, App.todayKey()), d2 = AS().rashifal(i, mt, App.todayKey() + 'T'), r = J().RASHI[i];
      const bar = (lbl, n) => `<div class="small">${lbl}<div class="bar"><i style="width:${n * 20}%"></i></div></div>`;
      log('rashifal', { meta: { rashi: i } });
      $('#rOut').innerHTML = `<div class="grid g2" style="margin-top:20px"><div class="card"><span class="kicker">${T('Today', 'आज')} · ${App.fmtDate(now)}</span><h2>${r.sym} ${T(r.en, r.hi)}</h2><div class="stars-row" style="font-size:1.3rem">${'★'.repeat(d.stars)}${'☆'.repeat(5 - d.stars)}</div>
        <p style="font-size:1.05rem">${T(d.text.en, d.text.hi)}</p><p class="small muted">🌙 ${T('Moon transits your', 'चंद्रमा आपके')} ${d.house}${T(['', 'st', 'nd', 'rd'][d.house] || 'th', 'वें')} ${T('house today', 'भाव में')} (${rn(ms)})</p>
        <div class="grid g3" style="gap:10px">${bar('❤️ ' + T('Love', 'प्रेम'), d.love)}${bar('💰 ' + T('Money', 'धन'), d.money)}${bar('🌿 ' + T('Health', 'स्वास्थ्य'), d.health)}</div>
        <p style="margin-top:12px">🎨 ${T('Lucky colour', 'शुभ रंग')}: <b>${T(d.color[0], d.color[1])}</b> · 🔢 ${T('Lucky number', 'शुभ अंक')}: <b>${d.number}</b></p>
        <button class="btn btn-ghost btn-sm" id="rShare">📤 ${T('Share', 'शेयर करें')}</button></div>
        <div class="card"><span class="kicker">${T('Tomorrow', 'कल')}</span><h3>${r.sym} ${T(r.en, r.hi)}</h3><p>${T(d2.text.en, d2.text.hi)}</p><hr style="border:0;border-top:1px solid var(--line)">
        <p class="small">🙏 ${T('Mantra for you', 'आपके लिए मंत्र')}: <b>${T(AS().MANTRA[i][0], AS().MANTRA[i][1])}</b></p>${App.ctaBook('prashn')}</div></div>`;
      $('#rShare').onclick = () => App.share(`${r.sym} ${T(r.en, r.hi)} — ${T('Today\'s Rashifal', 'आज का राशिफल')}\n${T(d.text.en, d.text.hi)}\n🎨 ${T(d.color[0], d.color[1])} · 🔢 ${d.number}`, 'rashifal');
      $('#rOut').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    $$('.rashi', v).forEach(b => b.onclick = () => show(+b.dataset.r));
    if (sel != null && !isNaN(sel)) show(sel);
  };

  /* ================= NUMEROLOGY ================= */
  App.routes.numerology = function (v) {
    const me = LS.get('as_me');
    v.innerHTML = App.phead('🔢 ' + T('Numerology — Ank Jyotish', 'अंक ज्योतिष'), T('Mulank, Bhagyank, Chaldean name number, Lo Shu grid and lucky mobile number — instantly.', 'मूलांक, भाग्यांक, नाम अंक (कैल्डियन), लो शू ग्रिड और शुभ मोबाइल नंबर — तुरंत।')) +
      `<section class="sec-sm"><div class="wrap" style="max-width:860px"><div class="card"><div class="fgrid"><div><label class="f">${T('Full name (as you use it)', 'पूरा नाम (जैसा आप लिखते हैं)')}</label><input class="inp" id="nName" value="${esc(me && me.name || '')}"></div>
      <div><label class="f">${T('Date of birth', 'जन्म तिथि')} *</label><input class="inp" type="date" id="nDob" value="${esc(me && me.input ? me.input.date : '')}"></div>
      <div><label class="f">${T('Mobile / vehicle number (optional)', 'मोबाइल / वाहन नंबर (वैकल्पिक)')}</label><input class="inp" id="nMob" inputmode="numeric"></div></div>
      <button class="btn btn-gold btn-lg" style="margin-top:14px" id="nGo">🔢 ${T('Reveal my numbers', 'मेरे अंक दिखाएँ')}</button></div><div id="nOut"></div></div></section>`;
    $('#nGo').onclick = () => {
      const dob = $('#nDob').value, name = $('#nName').value.trim(); if (!dob) return toast(T('Please enter date of birth', 'कृपया जन्म तिथि डालें'));
      const n = AS().numerology(dob, name), mob = $('#nMob').value.trim() ? AS().numberCheck($('#nMob').value, dob) : null, N = AS().NUM;
      log('numerology', { meta: { mulank: n.mulank, bhagyank: n.bhagyank, name: n.name && n.name.root } });
      const box = num => `<div class="stat center"><small>${num[0]}</small><b style="font-size:2.4rem;font-family:Cinzel">${num[1]}</b><div class="small">${T(N[num[1]].planet, N[num[1]].hiP)}</div></div>`;
      const order = [4, 9, 2, 3, 5, 7, 8, 1, 6];
      $('#nOut').innerHTML = `<div class="grid g3" style="margin-top:18px">${box([T('Mulank (Psychic)', 'मूलांक'), n.mulank])}${box([T('Bhagyank (Destiny)', 'भाग्यांक'), n.bhagyank])}${n.name ? box([T('Name number', 'नाम अंक') + ' (' + n.name.compound + ')', n.name.root]) : box([T('Personal year', 'व्यक्तिगत वर्ष'), n.personalYear])}</div>
        <div class="grid g2" style="margin-top:18px"><div class="card"><h3>🌟 ${T('Your number personality', 'आपके अंक का स्वभाव')}</h3><p><b>${T('Mulank', 'मूलांक')} ${n.mulank} (${T(n.info.planet, n.info.hiP)}):</b> ${T(n.info.en, n.info.hi)}</p><p><b>${T('Bhagyank', 'भाग्यांक')} ${n.bhagyank} (${T(n.destiny.planet, n.destiny.hiP)}):</b> ${T(n.destiny.en, n.destiny.hi)}</p>
          <p>🎨 ${T('Lucky colours', 'शुभ रंग')}: <b>${T(n.info.color, n.info.hiC)}</b> · 📅 ${T('Lucky day', 'शुभ दिन')}: <b>${T(n.info.day, n.info.hiD)}</b> · 🔢 ${T('Lucky numbers', 'शुभ अंक')}: <b>${n.luckyNumbers.join(', ')}</b></p>
          ${n.name ? `<p>${n.nameOk ? '✅ ' + T('Your name number', 'आपका नाम अंक') + ` <b>${n.name.root}</b> ` + T('is in harmony with your birth numbers.', 'आपके जन्म अंकों से मेल खाता है।') : '⚠️ ' + T('Your name number', 'आपका नाम अंक') + ` <b>${n.name.root}</b> ` + T('is not fully in harmony with your birth numbers. A small spelling change can help.', 'आपके जन्म अंकों से पूरी तरह मेल नहीं खाता। स्पेलिंग में छोटा बदलाव मदद कर सकता है।')}</p>` : ''}
          <p class="small">📆 ${T('Personal year', 'व्यक्तिगत वर्ष')} ${new Date().getFullYear()}: <b>${n.personalYear}</b> — ${T(N[n.personalYear].en, N[n.personalYear].hi)}</p></div>
        <div class="card center"><h3>🀄 ${T('Lo Shu Grid', 'लो शू ग्रिड')}</h3><div class="loshu">${order.map(x => `<div class="${n.grid[x] ? '' : 'miss'}">${n.grid[x] ? String(x).repeat(n.grid[x]) : x}</div>`).join('')}</div>
          <p class="small" style="margin-top:12px">${n.planes.length ? '✨ ' + n.planes.map(p => T(p.en, p.hi)).join(' · ') : T('No complete plane — balance comes with effort.', 'कोई पूर्ण तल नहीं — प्रयास से संतुलन आता है।')}</p></div></div>
        ${n.missing.length ? `<div class="card" style="margin-top:18px"><h3>🧩 ${T('Missing numbers & simple remedies', 'गायब अंक और सरल उपाय')}</h3>${n.missing.map(x => `<p><b>${x}</b> — ${T(AS().MISSING[x][0], AS().MISSING[x][1])}</p>`).join('')}</div>` : ''}
        ${mob ? `<div class="card" style="margin-top:18px"><h3>📱 ${T('Number vibration', 'नंबर की ऊर्जा')}</h3><p>${T('Total', 'योग')} ${mob.total} → <b style="font-size:1.4rem">${mob.root}</b> (${T(mob.info.planet, mob.info.hiP)}) — <span class="pill ${mob.verdict === 'lucky' ? 'g' : mob.verdict === 'avoid' ? 'r' : 'y'}">${{ lucky: T('Lucky for you', 'आपके लिए शुभ'), avoid: T('Not favourable', 'अनुकूल नहीं'), neutral: T('Neutral', 'सामान्य') }[mob.verdict]}</span></p></div>` : ''}
        <div class="grid g3" style="margin-top:18px">${['num_name', 'num_report', 'num_baby'].map(App.svcCard).join('')}</div>`;
    };
    if (me && me.input) $('#nGo').click();
  };

  /* ================= TAROT ================= */
  function cardHTML(c, flipped) {
    return `<div class="tcard ${flipped ? 'flip' : ''} ${c.reversed ? 'rev' : ''}"><div class="face back">✦</div><div class="face front"><span class="num">${c.major ? ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'][c.num] : ''}</span><div class="sym">${c.sym}</div><div class="nm">${T(c.en, c.hi)}</div>${c.reversed ? `<div class="rv">${T('Reversed', 'उल्टा')}</div>` : ''}</div></div>`;
  }
  const meaning = c => T((c.reversed ? c.rev : c.up)[0], (c.reversed ? c.rev : c.up)[1]);
  App.routes.tarot = function (v) {
    const dayKey = App.todayKey(), daily = AS().drawCards(1, dayKey + App.vid)[0];
    v.innerHTML = App.phead('🃏 ' + T('Tarot Reading', 'टैरो रीडिंग'), T('Your card of the day, a 3-card Past–Present–Future spread and a quick Yes/No answer. Focus on your question, then tap the cards.', 'आज का कार्ड, 3-कार्ड भूत–वर्तमान–भविष्य रीडिंग और तुरंत हाँ/ना उत्तर। अपने सवाल पर ध्यान दें, फिर कार्ड पर टैप करें।')) +
      `<section class="sec-sm"><div class="wrap">
      <div class="card center"><span class="kicker">🌅 ${T('Card of the day', 'आज का कार्ड')}</span><div class="tcards" id="tDaily">${cardHTML(daily, LS.get('as_tday') === dayKey)}</div><p id="tDailyTxt" class="${LS.get('as_tday') === dayKey ? '' : 'hide'}" style="max-width:560px;margin:14px auto 0"><b>${T(daily.en, daily.hi)}</b>: ${meaning(daily)}</p><p class="tiny muted">${T('One card per day — tap to reveal', 'दिन में एक कार्ड — खोलने के लिए टैप करें')}</p></div>
      <div class="card center" style="margin-top:18px"><span class="kicker">🔮 ${T('Past · Present · Future', 'भूत · वर्तमान · भविष्य')}</span><input class="inp" id="tQ" style="display:block;max-width:520px;margin:8px auto 12px" placeholder="${T('Think of your question (optional)', 'अपना सवाल सोचें (वैकल्पिक)')}">
        <button class="btn btn-violet" id="tShuffle">🔀 ${T('Shuffle & draw 3 cards', 'फेंटें और 3 कार्ड निकालें')}</button><div class="tcards" id="t3" style="margin-top:18px"></div><div id="t3Txt" class="grid g3" style="margin-top:16px;text-align:left"></div></div>
      <div class="card center" style="margin-top:18px"><span class="kicker">❓ ${T('Yes / No Tarot', 'हाँ / ना टैरो')}</span><p class="small muted">${T('Hold a yes/no question in your mind and pick a card.', 'मन में हाँ/ना वाला सवाल रखें और एक कार्ड चुनें।')}</p><div class="tcards" id="tYN">${[0, 1, 2].map(i => `<div class="tcard" data-i="${i}" style="width:110px;height:176px"><div class="face back" style="font-size:2rem">✦</div><div class="face front"></div></div>`).join('')}</div><div id="tYNTxt" style="margin-top:12px;font-size:1.1rem"></div></div>
      <div class="grid g3" style="margin-top:18px">${['tarot_one', 'tarot_celtic', 'tarot_live'].map(App.svcCard).join('')}</div>
      <p class="center tiny muted">${T('Free tarot here is for reflection and entertainment. For a deep personal reading, book Manasvi ji.', 'यहाँ फ़्री टैरो चिंतन और मनोरंजन के लिए है। गहरी व्यक्तिगत रीडिंग के लिए मानसवी जी से बुक करें।')}</p></div></section>`;
    $('#tDaily .tcard').onclick = e => { e.currentTarget.classList.add('flip'); LS.set('as_tday', dayKey); $('#tDailyTxt').classList.remove('hide'); log('tarot', { meta: { type: 'daily', card: daily.id } }); };
    $('#tShuffle').onclick = () => {
      const cards = AS().drawCards(3), labels = [T('Past', 'भूत'), T('Present', 'वर्तमान'), T('Future', 'भविष्य')];
      $('#t3').innerHTML = cards.map(cardHTML).join(''); $('#t3Txt').innerHTML = '';
      $$('#t3 .tcard').forEach((el, i) => el.onclick = () => { if (el.classList.contains('flip')) return; el.classList.add('flip');
        $('#t3Txt').insertAdjacentHTML('beforeend', `<div class="stat"><small>${labels[i]}</small><b>${T(cards[i].en, cards[i].hi)}${cards[i].reversed ? ' ↺' : ''}</b><div class="small">${meaning(cards[i])}</div></div>`);
        if ($$('#t3 .flip').length === 3) { log('tarot', { meta: { type: '3card', cards: cards.map(c => c.id) } }); $('#t3Txt').insertAdjacentHTML('afterend', `<div id="t3cta" style="margin-top:14px">${App.ctaBook('tarot_one', T('Want Manasvi ji to read these cards for your exact situation?', 'क्या आप चाहते हैं कि मानसवी जी आपकी स्थिति के लिए ये कार्ड पढ़ें?'))}</div>`); }
      });
      const old = $('#t3cta'); if (old) old.remove();
    };
    $$('#tYN .tcard').forEach(el => el.onclick = () => {
      if ($('#tYN .flip')) return; const c = AS().drawCards(1)[0], yes = !c.reversed && (c.major ? ![12, 13, 15, 16, 18].includes(c.num) : c.num !== 5 && c.num !== 10);
      el.querySelector('.front').innerHTML = `<div class="sym" style="font-size:2rem">${c.sym}</div><div class="nm" style="font-size:.75rem">${T(c.en, c.hi)}</div>`; el.classList.add('flip');
      $('#tYNTxt').innerHTML = `<b style="font-size:1.6rem;color:${yes ? 'var(--ok)' : 'var(--maroon)'}">${yes ? T('YES ✨', 'हाँ ✨') : T('NOT NOW 🌙', 'अभी नहीं 🌙')}</b><div class="small muted">${meaning(c)}</div>`;
      log('tarot', { meta: { type: 'yesno', card: c.id } });
    });
  };

  /* ================= FAMILY VAULT ================= */
  App.routes.vault = function (v) {
    const fam = LS.get('as_family', []);
    const upcoming = fam.map(f => { const [y, m, d] = f.date.split('-').map(Number), now = new Date(); let nb = new Date(now.getFullYear(), m - 1, d); if (nb < new Date(now.toDateString())) nb = new Date(now.getFullYear() + 1, m - 1, d); return { f, days: Math.round((nb - new Date(now.toDateString())) / 864e5), age: nb.getFullYear() - y }; }).sort((a, b) => a.days - b.days);
    v.innerHTML = App.phead('👨‍👩‍👧 ' + T('Family Kundli Vault', 'परिवार कुंडली तिजोरी'), T('Keep every family member\'s kundli in one place. See birthdays and upcoming dasha changes at a glance. Stored privately on this device.', 'परिवार के हर सदस्य की कुंडली एक जगह। जन्मदिन और आने वाले दशा परिवर्तन एक नज़र में। इसी डिवाइस पर निजी रूप से सेव।')) +
      `<section class="sec-sm"><div class="wrap">${fam.length ? `<div class="grid g3">${fam.map((f, i) => { let k = null; try { k = App.makeKundli({ name: f.name, gender: f.gender, date: f.date, time: f.time, lat: f.place.lat, lon: f.place.lon, tz: f.place.tz, place: f.place.name, placeObj: f.place }); } catch (e) { }
        const next = k && k.current ? k.dashas.flatMap(d => d.sub.map(s => ({ md: d.lord, ad: s.lord, start: s.start }))).find(s => s.start > new Date()) : null; const up = upcoming.find(u => u.f === f);
        return `<div class="card"><div class="row between"><h3 style="margin:0">${esc(f.name)}</h3><span class="pill">${esc(f.relation || '')}</span></div>${k ? `<p class="small">🌙 ${rn(k.moonSign)} · ⭐ ${nk(k.nakshatra)} · ⬆️ ${rn(k.lagna.sign)}</p>
          <p class="small">⏳ ${pl(k.current.md.lord)} / ${pl(k.current.ad.lord)}${next ? `<br>➡️ ${T('Next', 'अगली')}: ${pl(next.md)} / ${pl(next.ad)} ${T('from', 'से')} ${App.fmtDate(next.start)}` : ''}</p>` : ''}<p class="small">🎂 ${up ? (up.days === 0 ? T('Birthday today! 🎉', 'आज जन्मदिन! 🎉') : T(`in ${up.days} days (turns ${up.age})`, `${up.days} दिन में (${up.age} वर्ष)`)) : ''}</p>
          <div class="row"><button class="btn btn-sm btn-gold" data-open="${i}">${T('Open kundli', 'कुंडली खोलें')}</button><button class="btn btn-sm btn-ghost" data-del="${i}">🗑️</button></div></div>`; }).join('')}</div>` : `<div class="card center"><p class="muted">${T('Your vault is empty. Add yourself and your family below.', 'आपकी तिजोरी खाली है। नीचे अपना और परिवार का विवरण जोड़ें।')}</p></div>`}
      <div class="card" style="margin-top:18px;max-width:760px"><h3>➕ ${T('Add family member', 'परिवार सदस्य जोड़ें')}</h3><div class="fgrid"><div><label class="f">${T('Name', 'नाम')}</label><input class="inp" id="fName"></div><div><label class="f">${T('Relation', 'रिश्ता')}</label><select class="inp" id="fRel">${[['Self', 'स्वयं'], ['Spouse', 'जीवनसाथी'], ['Son', 'बेटा'], ['Daughter', 'बेटी'], ['Father', 'पिता'], ['Mother', 'माता'], ['Brother', 'भाई'], ['Sister', 'बहन'], ['Other', 'अन्य']].map(r => `<option>${T(r[0], r[1])}</option>`).join('')}</select></div>
        <div><label class="f">${T('Date of birth', 'जन्म तिथि')}</label><input class="inp" type="date" id="fDate"></div><div><label class="f">${T('Birth time', 'जन्म समय')}</label><input class="inp" type="time" id="fTime"></div></div><label class="f">${T('Birth place', 'जन्म स्थान')}</label><div id="fPlace"></div>
        <button class="btn btn-violet" style="margin-top:12px" id="fAdd">${T('Add to vault', 'तिजोरी में जोड़ें')}</button></div></div></section>`;
    const gp = App.placeField($('#fPlace'));
    $('#fAdd').onclick = () => { const p = gp(), name = $('#fName').value.trim(), date = $('#fDate').value, time = $('#fTime').value || '12:00'; if (!name || !date || !p) return toast(T('Please fill name, date and place', 'कृपया नाम, तिथि और स्थान भरें'));
      fam.push({ name, relation: $('#fRel').value, date, time, place: p }); LS.set('as_family', fam); log('vault', { meta: { action: 'add', n: fam.length } }); App.rerender(); };
    $$('[data-del]', v).forEach(b => b.onclick = () => { if (!confirm(T('Remove this member?', 'यह सदस्य हटाएँ?'))) return; fam.splice(+b.dataset.del, 1); LS.set('as_family', fam); App.rerender(); });
    $$('[data-open]', v).forEach(b => b.onclick = () => { const f = fam[+b.dataset.open]; const k = App.makeKundli({ name: f.name, gender: f.gender, date: f.date, time: f.time, lat: f.place.lat, lon: f.place.lon, tz: f.place.tz, place: f.place.name, placeObj: f.place });
      v.innerHTML = App.phead('🪐 ' + esc(f.name)) + '<div id="vk"></div>'; renderKundli($('#vk'), k); window.scrollTo(0, 0); });
  };

  /* ================= BLESSINGS ================= */
  App.routes.blessings = function (v) {
    v.innerHTML = App.phead('🙏 ' + T('Divine Blessings', 'दिव्य आशीर्वाद'), T('Open your heart and receive blessings. Then play a divine game for today\'s guidance.', 'हृदय खोलें और आशीर्वाद ग्रहण करें। फिर आज के मार्गदर्शन के लिए दिव्य गेम खेलें।')) +
      `<section class="sec"><div class="wrap"><div class="blessings">${[1, 2, 3, 4, 5, 6, 7].map(i => `<a href="images/blessing-${i}.jpg" target="_blank" rel="noopener"><img src="images/blessing-${i}.jpg" alt="${T('Blessing', 'आशीर्वाद')} ${i}" loading="lazy"></a>`).join('')}</div>
      <div class="games-banner" style="margin-top:30px;text-align:center"><h2>🔮 ${T('Divine Game Zone', 'दिव्य गेम ज़ोन')}</h2><p style="color:#fde68a">${T('Every game is free — play once a day and grow your streak!', 'हर गेम फ़्री है — रोज़ एक बार खेलें और स्ट्रीक बढ़ाएँ!')}</p><a class="btn btn-gold btn-lg" href="#/games">🎮 ${T('Play now', 'अभी खेलें')}</a></div></div></section>`;
  };
})();
