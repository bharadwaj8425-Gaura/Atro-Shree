/* Astro-Shree — Divine Game Zone: 14 daily games, streaks, punya points, badges, sharing */
(function () {
  'use strict';
  const App = window.App, { $, $$, esc, T, LS, toast, log } = App;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const L = (en, hi) => T(en, hi);

  App.share = function (text, kind) {
    const url = location.origin + '/#/games', full = `${text}\n\n✨ ${T('Play free divine games on Astro-Shree', 'एस्ट्रो-श्री पर फ़्री दिव्य गेम्स खेलें')}: ${url}`;
    log('share', { meta: { kind } });
    if (navigator.share) navigator.share({ text: full }).catch(() => { });
    else window.open('https://wa.me/?text=' + encodeURIComponent(full), '_blank', 'noopener');
  };

  /* ---------- streak & points ---------- */
  function played(game) {
    const day = App.todayKey(), s = LS.get('as_streak') || { n: 0, last: null, pts: 0, games: 0 };
    if (s.last !== day) { const y = new Date(); y.setDate(y.getDate() - 1); const yk = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`; s.n = s.last === yk ? s.n + 1 : 1; s.last = day; }
    s.pts = (s.pts || 0) + 10; s.games = (s.games || 0) + 1; LS.set('as_streak', s);
    const p = LS.get('as_played') || {}; p[game] = day; LS.set('as_played', p);
    log('game', { meta: { game, streak: s.n } });
    const have = LS.get('as_coupons', []).map(c => c.code);
    if (s.n >= 7 && !have.includes('SAPTAH21')) { App.winCoupon('SAPTAH21', 'streak7'); toast('🎉 ' + T('7-day streak! You unlocked coupon SAPTAH21 (₹21 off)', '7 दिन की स्ट्रीक! आपने SAPTAH21 कूपन (₹21 छूट) जीता'), 6000); }
    else if (s.n >= 3 && !have.includes('SHUBH11')) { App.winCoupon('SHUBH11', 'streak3'); toast('🎉 ' + T('3-day streak! You unlocked coupon SHUBH11 (₹11 off)', '3 दिन की स्ट्रीक! आपने SHUBH11 कूपन (₹11 छूट) जीता'), 6000); }
    paintStreak();
  }
  const playedToday = g => (LS.get('as_played') || {})[g] === App.todayKey();
  const BADGES = [[3, '🪔', 'Deepak', 'दीपक'], [7, '🌟', 'Tara', 'तारा'], [21, '👑', 'Raj Yogi', 'राजयोगी'], [51, '🕉️', 'Siddh', 'सिद्ध']];
  function paintStreak() {
    const s = LS.get('as_streak') || { n: 0, pts: 0 }, el = $('#gStreak'); if (!el) return;
    el.innerHTML = `<span class="streak">🔥 ${s.n} ${T('day streak', 'दिन की स्ट्रीक')}</span> <span class="streak">✨ ${s.pts || 0} ${T('punya points', 'पुण्य अंक')}</span>
      <div class="badges" style="margin-top:12px">${BADGES.map(b => `<span class="badge ${s.n >= b[0] ? '' : 'off'}">${b[1]} ${T(b[2], b[3])} · ${b[0]} ${T('days', 'दिन')}</span>`).join('')}</div>
      <div class="badges" style="margin-top:8px;justify-content:center"><span class="badge ${s.n >= 3 ? '' : 'off'}">🎟️ 3 ${T('days', 'दिन')} → ₹11 ${T('off', 'छूट')}</span><span class="badge ${s.n >= 7 ? '' : 'off'}">🎟️ 7 ${T('days', 'दिन')} → ₹21 ${T('off', 'छूट')}</span><span class="badge">🎡 ${T('Wheel', 'पहिया')} → ₹11 ${T('off', 'छूट')}</span></div>
      ${LS.get('as_coupons', []).length ? `<p style="color:#fde68a;margin-top:10px">🎟️ ${T('Your coupons', 'आपके कूपन')}: ${LS.get('as_coupons', []).map(c => `<b class="coupon">${esc(c.code)}</b>`).join(' ')} — <a href="#/seva" style="color:#fbbf24">${T('use now', 'अभी इस्तेमाल करें')}</a></p>` : ''}`;
  }

  /* ---------- game definitions ---------- */
  const G = [
    { id: 'wheel', ic: '🎡', en: 'Kismat Wheel', hi: 'किस्मत का पहिया', d: ['Spin the wheel of fortune for today\'s blessing', 'आज के आशीर्वाद के लिए भाग्य चक्र घुमाएँ'], c: '#f59e0b' },
    { id: 'card', ic: '🃏', en: 'Pick a Divine Card', hi: 'दिव्य कार्ड चुनें', d: ['Choose one mystery card for your blessing', 'अपने आशीर्वाद के लिए एक रहस्य कार्ड चुनें'], c: '#a855f7' },
    { id: 'diya', ic: '🪔', en: 'Diya Jalao, Wish Maango', hi: 'दीया जलाओ, मन्नत मांगो', d: ['Light a diya and make a wish', 'दीया जलाएँ और मन्नत मांगें'], c: '#f97316' },
    { id: 'love', ic: '💘', en: 'Love Match by Name', hi: 'नाम से प्रेम मिलान', d: ['Fun name compatibility — share with your partner!', 'मज़ेदार नाम मिलान — अपने साथी से शेयर करें!'], c: '#ec4899', unlimited: true },
    { id: 'number', ic: '🎲', en: 'Lucky Number', hi: 'शुभ अंक', d: ['Find your lucky number for today', 'आज का शुभ अंक जानें'], c: '#22c55e' },
    { id: 'color', ic: '🌈', en: 'Lucky Colour', hi: 'शुभ रंग', d: ['Know your lucky colour energy', 'अपने शुभ रंग की ऊर्जा जानें'], c: '#ec4899' },
    { id: 'oracle', ic: '❓', en: 'Yes / No Oracle', hi: 'हाँ / ना ओरेकल', d: ['Think a question in your mind', 'मन में एक सवाल सोचें'], c: '#3b82f6' },
    { id: 'angel', ic: '👼', en: 'Angel Number', hi: 'एंजेल नंबर', d: ['Get your angel number message', 'अपना एंजेल नंबर संदेश पाएँ'], c: '#8b5cf6' },
    { id: 'energy', ic: '💫', en: 'Daily Energy Meter', hi: 'दैनिक ऊर्जा मीटर', d: ['Love, money, career & health energy', 'प्रेम, धन, करियर व स्वास्थ्य ऊर्जा'], c: '#f97316' },
    { id: 'crystal', ic: '💎', en: 'Pick a Crystal', hi: 'क्रिस्टल चुनें', d: ['Reveal your crystal energy for today', 'आज की क्रिस्टल ऊर्जा जानें'], c: '#06b6d4' },
    { id: 'karma', ic: '🪷', en: 'Karma Message', hi: 'कर्म संदेश', d: ['Know your karmic message for today', 'आज का कर्म संदेश जानें'], c: '#f59e0b' },
    { id: 'fortune', ic: '🥠', en: 'Fortune Cookie', hi: 'भाग्य बिस्किट', d: ['Open your spiritual fortune cookie', 'अपना आध्यात्मिक भाग्य बिस्किट खोलें'], c: '#fb7185' },
    { id: 'destiny', ic: '🎮', en: 'Lucky Rashi Destiny', hi: 'भाग्य रहस्य', d: ['Lucky colour, number & divine message', 'शुभ रंग, अंक और दिव्य संदेश'], c: '#eab308' },
    { id: 'mantra', ic: '📿', en: 'Mantra of the Day', hi: 'आज का मंत्र', d: ['Receive a mantra to chant 11 times today', 'आज 11 बार जपने के लिए मंत्र पाएँ'], c: '#9f1239' }
  ];
  const MSG = {
    card: [['🕉️ Divine protection is around you today. Stay calm and trust your path.', '🕉️ आज दिव्य सुरक्षा आपके साथ है। शांत रहें और अपने मार्ग पर भरोसा रखें।'], ['🔱 Shiva energy supports your new beginning. Avoid anger and move wisely.', '🔱 शिव ऊर्जा आपकी नई शुरुआत में साथ है। क्रोध से बचें, समझदारी से बढ़ें।'], ['🌙 Your intuition is strong today. Listen to your inner voice.', '🌙 आज आपका अंतर्ज्ञान प्रबल है। भीतर की आवाज़ सुनें।'], ['✨ Good news may come soon. Keep your thoughts positive.', '✨ जल्द शुभ समाचार आ सकता है। विचार सकारात्मक रखें।'], ['💫 A blocked path will slowly open. Do not lose hope.', '💫 रुका हुआ रास्ता धीरे-धीरे खुलेगा। आशा न छोड़ें।'], ['🌸 Love, peace and blessings are entering your life.', '🌸 प्रेम, शांति और आशीर्वाद आपके जीवन में आ रहे हैं।']],
    wheel: [['🍀 Lucky break', '🍀 शुभ अवसर'], ['💰 Money flow', '💰 धन लाभ'], ['❤️ Love blessing', '❤️ प्रेम आशीर्वाद'], ['🚀 New opportunity', '🚀 नया अवसर'], ['🧘 Inner peace', '🧘 मन की शांति'], ['🎉 Good news', '🎉 शुभ समाचार'], ['🛡️ Divine protection', '🛡️ दिव्य रक्षा'], ['🎁 ₹11 OFF coupon', '🎁 ₹11 छूट कूपन']],
    color: [['Gold – success and divine blessings', 'सुनहरा – सफलता और दिव्य आशीर्वाद'], ['Red – courage and confidence', 'लाल – साहस और आत्मविश्वास'], ['Green – money and healing', 'हरा – धन और उपचार'], ['White – peace and purity', 'सफ़ेद – शांति और पवित्रता'], ['Purple – spiritual power', 'बैंगनी – आध्यात्मिक शक्ति'], ['Yellow – knowledge and luck', 'पीला – ज्ञान और भाग्य'], ['Pink – love and harmony', 'गुलाबी – प्रेम और सामंजस्य'], ['Blue – calm mind and protection', 'नीला – शांत मन और सुरक्षा']],
    oracle: [['✅ Yes, the energy is positive.', '✅ हाँ, ऊर्जा सकारात्मक है।'], ['❌ Not right now. Wait for better timing.', '❌ अभी नहीं। बेहतर समय की प्रतीक्षा करें।'], ['🌙 Maybe. Trust your intuition.', '🌙 शायद। अपने अंतर्ज्ञान पर भरोसा करें।'], ['✨ Yes, but move slowly and wisely.', '✨ हाँ, पर धीरे और समझदारी से।'], ['🔱 No, first clear your doubts.', '🔱 नहीं, पहले अपनी शंकाएँ दूर करें।'], ['🙏 Divine timing is working. Be patient.', '🙏 दिव्य समय काम कर रहा है। धैर्य रखें।']],
    angel: [['111 – New beginnings are coming.', '111 – नई शुरुआत आ रही है।'], ['222 – Balance and patience are needed.', '222 – संतुलन और धैर्य चाहिए।'], ['333 – Divine support is with you.', '333 – दिव्य सहायता आपके साथ है।'], ['444 – You are protected by higher energy.', '444 – उच्च ऊर्जा आपकी रक्षा कर रही है।'], ['555 – Big change is coming soon.', '555 – बड़ा बदलाव जल्द आ रहा है।'], ['777 – Spiritual luck is active.', '777 – आध्यात्मिक भाग्य सक्रिय है।'], ['888 – Money energy is improving.', '888 – धन ऊर्जा बढ़ रही है।'], ['999 – Old cycle is ending. New path begins.', '999 – पुराना चक्र समाप्त, नया मार्ग शुरू।']],
    crystal: [['Amethyst – peace and spiritual clarity', 'एमेथिस्ट – शांति और आध्यात्मिक स्पष्टता'], ['Rose Quartz – love and emotional healing', 'रोज़ क्वार्ट्ज़ – प्रेम और भावनात्मक उपचार'], ['Citrine – money and confidence', 'सिट्रीन – धन और आत्मविश्वास'], ['Clear Quartz – focus and protection', 'क्लियर क्वार्ट्ज़ – एकाग्रता और सुरक्षा'], ['Tiger Eye – courage and stability', 'टाइगर आई – साहस और स्थिरता'], ['Moonstone – intuition and calmness', 'मूनस्टोन – अंतर्ज्ञान और शांति']],
    karma: [['🪔 Be kind today. Your kindness will return beautifully.', '🪔 आज दयालु रहें। आपकी दया सुंदर रूप में लौटेगी।'], ['🙏 Patience is your lesson today.', '🙏 आज का पाठ है — धैर्य।'], ['🌿 Release old anger and welcome peace.', '🌿 पुराना क्रोध छोड़ें और शांति अपनाएँ।'], ['✨ A good deed will open a lucky door.', '✨ एक अच्छा कर्म भाग्य का द्वार खोलेगा।'], ['🔱 Stay truthful. Your path will become clear.', '🔱 सच्चे रहें। आपका मार्ग स्पष्ट होगा।'], ['🌸 Forgiveness will heal your energy.', '🌸 क्षमा आपकी ऊर्जा को स्वस्थ करेगी।']],
    fortune: [['🌟 A surprise blessing may arrive soon.', '🌟 जल्द कोई अचानक आशीर्वाद मिल सकता है।'], ['💫 Your hard work will not go waste.', '💫 आपकी मेहनत व्यर्थ नहीं जाएगी।'], ['🌙 Trust the timing of your life.', '🌙 अपने जीवन के समय पर भरोसा रखें।'], ['🕉️ Divine energy is guiding your decisions.', '🕉️ दिव्य ऊर्जा आपके निर्णयों का मार्गदर्शन कर रही है।'], ['🌹 A peaceful conversation will solve a problem.', '🌹 एक शांत बातचीत समस्या सुलझाएगी।'], ['⭐ Your confidence will attract opportunity.', '⭐ आपका आत्मविश्वास अवसर लाएगा।']],
    destiny: [['🕉️ Guru Kripa is blessing your path today.', '🕉️ आज गुरु कृपा आपके मार्ग पर है।'], ['💰 Wealth and abundance are moving towards you.', '💰 धन और समृद्धि आपकी ओर आ रही है।'], ['❤️ Love and harmony will increase in your life.', '❤️ जीवन में प्रेम और सामंजस्य बढ़ेगा।'], ['🚀 A new opportunity is coming soon.', '🚀 जल्द नया अवसर आ रहा है।'], ['🌙 Your prayers are being heard by the universe.', '🌙 ब्रह्मांड आपकी प्रार्थनाएँ सुन रहा है।'], ['🔱 Divine protection surrounds you.', '🔱 दिव्य सुरक्षा आपको घेरे हुए है।'], ['⭐ Today is lucky for new beginnings.', '⭐ आज नई शुरुआत के लिए शुभ दिन है।'], ['🎉 Unexpected good news may arrive soon.', '🎉 जल्द अप्रत्याशित शुभ समाचार आ सकता है।']],
    number: [['This number brings success energy.', 'यह अंक सफलता की ऊर्जा लाता है।'], ['This number supports love and peace.', 'यह अंक प्रेम और शांति देता है।'], ['This number carries wealth vibration.', 'इस अंक में धन की तरंग है।'], ['This number brings spiritual protection.', 'यह अंक आध्यात्मिक सुरक्षा देता है।']]
  };
  const tx = p => L(p[0], p[1]);

  function wheelSvg() {
    const seg = MSG.wheel, n = seg.length, cols = ['#f59e0b', '#a855f7', '#ec4899', '#22c55e', '#3b82f6', '#f97316', '#9f1239', '#06b6d4'];
    let s = '<svg viewBox="-110 -110 220 220">';
    seg.forEach((x, i) => { const a1 = (i / n) * 2 * Math.PI - Math.PI / 2, a2 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2, am = (a1 + a2) / 2;
      s += `<path d="M0 0L${100 * Math.cos(a1)} ${100 * Math.sin(a1)}A100 100 0 0 1 ${100 * Math.cos(a2)} ${100 * Math.sin(a2)}Z" fill="${cols[i]}" stroke="#fff" stroke-width="2"/>`;
      s += `<text x="${66 * Math.cos(am)}" y="${66 * Math.sin(am)}" font-size="20" text-anchor="middle" dominant-baseline="central">${x[0].split(' ')[0]}</text>`; });
    return s + '<circle r="16" fill="#1e1446" stroke="#fbbf24" stroke-width="3"/><text font-size="14" text-anchor="middle" dominant-baseline="central" fill="#fbbf24">ॐ</text></svg>';
  }
  function hashPct(a, b) { const s = [a, b].map(x => x.trim().toLowerCase()).sort().join('|'); let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return 55 + (h % 45); }

  function play(g, area) {
    const done = html => { area.innerHTML = `<div class="result">${html}</div><button class="btn btn-ghost btn-sm" style="margin-top:10px" data-share="${g.id}">📤 ${T('Share result', 'नतीजा शेयर करें')}</button>`; if (!g.unlimited) played(g.id); else log('game', { meta: { game: g.id } });
      $('[data-share]', area).onclick = () => App.share(`${g.ic} ${T(g.en, g.hi)}\n${area.querySelector('.result').innerText}`, g.id); };
    if (!g.unlimited && playedToday(g.id)) { area.innerHTML = `<div class="result">🌙 ${T('You already played this today. Come back tomorrow to keep your streak! 🔥', 'आज आप यह खेल चुके हैं। स्ट्रीक बनाए रखने के लिए कल फिर आएँ! 🔥')}</div>`; return; }
    switch (g.id) {
      case 'wheel': {
        area.innerHTML = `<div class="wheel-game"><span class="ptr">🔻</span>${wheelSvg()}</div><button class="btn btn-gold btn-block" id="spin">🎡 ${T('Spin!', 'घुमाएँ!')}</button>`;
        $('#spin', area).onclick = () => { const i = Math.floor(Math.random() * 8), svg = $('svg', area), deg = 360 * 6 + (360 - (i + .5) * 45); svg.style.transform = `rotate(${deg}deg)`; $('#spin', area).disabled = true;
          setTimeout(() => { if (i === 7) App.winCoupon('SHUBH11', 'wheel');
            done(i === 7 ? `🎉 ${T('You won a coupon!', 'आपने कूपन जीता!')}<br><span class="coupon" style="font-size:1.4rem">SHUBH11</span><br><span class="small">₹11 ${T('off on any reading — auto-applied when you book', 'किसी भी रीडिंग पर छूट — बुकिंग में अपने-आप लगेगा')}</span><br><a class="btn btn-gold btn-sm" style="margin-top:8px" href="#/seva">${T('Use now', 'अभी इस्तेमाल करें')}</a>`
              : `🎡 ${T('Your blessing today', 'आज आपका आशीर्वाद')}:<br><span style="font-size:1.5rem">${tx(MSG.wheel[i])}</span><br><span class="small">${tx(pick(MSG.destiny))}</span>`); }, 4200); }; return; }
      case 'card':
        area.innerHTML = `<div class="pick-grid">${['🕉️', '🔱', '🌙', '✨', '💫', '🌸'].map((e, i) => `<button data-i="${i}">${e}</button>`).join('')}</div>`;
        $$('[data-i]', area).forEach(b => b.onclick = () => done(tx(MSG.card[+b.dataset.i]))); return;
      case 'diya': {
        area.innerHTML = `<input class="inp" id="wish" placeholder="${T('Write your wish (stays private on your phone)', 'अपनी मन्नत लिखें (आपके फ़ोन पर ही रहेगी)')}"><div style="font-size:4rem;text-align:center;margin:10px 0" id="dy">🪔</div><button class="btn btn-gold btn-block" id="lit">🔥 ${T('Light the diya', 'दीया जलाएँ')}</button>`;
        $('#lit', area).onclick = () => { $('#dy', area).innerHTML = '🪔<span style="display:inline-block;animation:float 1.2s infinite">🔥</span>'; setTimeout(() => done(`🪔 ${T('Your diya is lit with faith.', 'आपका दीया श्रद्धा से जल गया।')}<br>${T('May your wish reach the Divine. Radhe Radhe 🙏', 'आपकी मन्नत ईश्वर तक पहुँचे। राधे राधे 🙏')}`), 1200); }; return; }
      case 'love':
        area.innerHTML = `<div class="fgrid"><input class="inp" id="n1" placeholder="${T('Your name', 'आपका नाम')}"><input class="inp" id="n2" placeholder="${T('Partner\'s name', 'साथी का नाम')}"></div><button class="btn btn-gold btn-block" style="margin-top:8px" id="lm">💘 ${T('Check match', 'मिलान देखें')}</button>`;
        $('#lm', area).onclick = () => { const a = $('#n1', area).value, b = $('#n2', area).value; if (!a.trim() || !b.trim()) return toast(T('Enter both names', 'दोनों नाम लिखें')); const p = hashPct(a, b);
          done(`💘 ${esc(a)} + ${esc(b)} = <span style="font-size:2rem">${p}%</span><br>${p > 85 ? T('A match made in the stars! ✨', 'सितारों में बनी जोड़ी! ✨') : p > 70 ? T('Sweet harmony — nurture it with care 💞', 'मीठा तालमेल — प्यार से सींचें 💞') : T('Opposites attract — patience is your magic 🌙', 'विपरीत आकर्षित करते हैं — धैर्य आपका जादू है 🌙')}<div class="tiny" style="margin-top:6px">${T('Just for fun! For real compatibility, try', 'सिर्फ़ मज़े के लिए! असली मिलान के लिए देखें')} <a href="#/milan">Kundli Milan</a></div>`); }; return;
      case 'number': { const n = Math.floor(Math.random() * 99) + 1; area.innerHTML = '<div class="center" style="font-size:3rem">🎲</div>'; setTimeout(() => done(`🎲 ${T('Your lucky number is', 'आपका शुभ अंक है')} <span style="font-size:2rem">${n}</span><br>${tx(pick(MSG.number))}`), 600); return; }
      case 'color': return done(`🌈 ${T('Your lucky colour today', 'आज आपका शुभ रंग')}:<br><span style="font-size:1.3rem">${tx(pick(MSG.color))}</span>`);
      case 'oracle': area.innerHTML = `<p class="small">${T('Close your eyes, think of your question, then tap.', 'आँखें बंद करें, सवाल सोचें, फिर टैप करें।')}</p><button class="btn btn-violet btn-block" id="orc">🔮 ${T('Ask the oracle', 'ओरेकल से पूछें')}</button>`; $('#orc', area).onclick = () => done(tx(pick(MSG.oracle))); return;
      case 'angel': return done(`👼 ${T('Your angel number', 'आपका एंजेल नंबर')}:<br><span style="font-size:1.3rem">${tx(pick(MSG.angel))}</span>`);
      case 'energy': { const r = () => Math.floor(Math.random() * 41) + 60, e = [['❤️', T('Love', 'प्रेम'), r()], ['💰', T('Money', 'धन'), r()], ['🚀', T('Career', 'करियर'), r()], ['🌿', T('Health', 'स्वास्थ्य'), r()]];
        return done(e.map(x => `${x[0]} ${x[1]}: ${x[2]}%<div class="bar" style="margin:3px 0 8px"><i style="width:${x[2]}%"></i></div>`).join('') + '✨ ' + T('Stay positive and move with faith.', 'सकारात्मक रहें और विश्वास से आगे बढ़ें।')); }
      case 'crystal': return done(`💎 ${T('Your crystal today', 'आज आपका क्रिस्टल')}:<br><span style="font-size:1.3rem">${tx(pick(MSG.crystal))}</span>`);
      case 'karma': return done(tx(pick(MSG.karma)));
      case 'fortune': area.innerHTML = `<div class="center" style="font-size:3rem;cursor:pointer" id="ck">🥠</div><p class="center small">${T('Tap to crack it!', 'तोड़ने के लिए टैप करें!')}</p>`; $('#ck', area).onclick = () => done(tx(pick(MSG.fortune))); return;
      case 'destiny': { const c = pick(['Gold', 'Red', 'White', 'Purple', 'Green', 'Yellow', 'Sky Blue', 'Pink']), n = pick([1, 2, 3, 5, 6, 7, 8, 9]);
        return done(`🎨 <b>${T('Lucky colour', 'शुभ रंग')}:</b> ${c}<br>🔢 <b>${T('Lucky number', 'शुभ अंक')}:</b> ${n}<br>🕉️ ${tx(pick(MSG.destiny))}<br><br>🌟 ${T('Keep faith, stay positive and move forward with confidence.', 'विश्वास रखें, सकारात्मक रहें और आत्मविश्वास से आगे बढ़ें।')}`); }
      case 'mantra': { const m = pick(window.AS.MANTRA); area.innerHTML = `<div class="result" style="font-size:1.3rem">📿 ${T(m[0], m[1])}</div><p class="small">${T('Chant it 11 times — tap the mala for each chant', 'इसे 11 बार जपें — हर जप पर माला पर टैप करें')}</p><div class="center"><button class="btn btn-violet" id="mala">📿 <span id="mc">0</span>/11</button></div>`;
        let c = 0; $('#mala', area).onclick = () => { c++; $('#mc', area).textContent = c; if (c >= 11) done(`📿 ${T(m[0], m[1])}<br>🙏 ${T('11 chants complete! Your day is blessed.', '11 जप पूरे! आपका दिन मंगलमय हो।')}`); }; return; }
    }
  }

  App.routes.games = function (v) {
    v.innerHTML = `<section class="hero" style="min-height:auto"><canvas id="stars"></canvas><div class="wrap" style="display:block;min-height:auto;padding:44px 18px;text-align:center">
      <span class="kicker" style="color:#fbbf24">🎮 ${T('Free · daily · fun', 'फ़्री · रोज़ · मज़ेदार')}</span><h1>${T('Divine Game Zone', 'दिव्य गेम ज़ोन')}</h1>
      <p class="lead" style="margin:0 auto">${T('14 spiritual games, once a day each. Keep your streak alive to unlock badges and win discount coupons!', '14 आध्यात्मिक गेम्स, हर गेम दिन में एक बार। स्ट्रीक बनाए रखें, बैज और छूट कूपन जीतें!')}</p>
      <div id="gStreak" style="margin-top:18px;display:flex;flex-direction:column;align-items:center"></div></div></section>
      <section class="sec"><div class="wrap"><div class="grid g3">${G.map(g => `<div class="card game" style="border-top:5px solid ${g.c}">${playedToday(g.id) && !g.unlimited ? `<span class="pill g done">✓ ${T('Played', 'खेला')}</span>` : ''}
        <div style="font-size:2.4rem">${g.ic}</div><h3 style="margin-top:6px">${T(g.en, g.hi)}</h3><p class="muted small">${T(g.d[0], g.d[1])}</p><div class="area" data-g="${g.id}"><button class="btn btn-gold btn-sm" data-play="${g.id}">${T('Play', 'खेलें')} ▶</button></div></div>`).join('')}</div>
      <div style="margin-top:28px">${App.ctaBook('prashn', T('Games are for fun — for real guidance on your question, ask Manasvi ji.', 'गेम्स मनोरंजन के लिए हैं — अपने सवाल पर असली मार्गदर्शन के लिए मानसवी जी से पूछें।'))}</div>
      <p class="center tiny muted" style="margin-top:14px">${T('All games are for entertainment and spiritual reflection only.', 'सभी गेम्स केवल मनोरंजन और आध्यात्मिक चिंतन के लिए हैं।')}</p></div></section>`;
    paintStreak();
    const c = $('#stars'); if (c) { const ctx = c.getContext('2d'); c.width = c.offsetWidth; c.height = c.offsetHeight; for (let i = 0; i < 120; i++) { ctx.globalAlpha = Math.random(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(Math.random() * c.width, Math.random() * c.height, Math.random() * 1.5, 0, 7); ctx.fill(); } }
    $$('[data-play]', v).forEach(b => b.onclick = () => { const g = G.find(x => x.id === b.dataset.play); play(g, b.closest('.area')); });
  };
})();
