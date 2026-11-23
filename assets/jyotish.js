/* Astro-Shree Jyotish engine — sidereal (Lahiri) Vedic calculations.
   Planet positions: astronomy-engine (MIT). Works in the browser (window.Jyotish) and in Node (module.exports). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./astronomy.min.js'));
  else root.Jyotish = factory(root.Astronomy);
})(typeof self !== 'undefined' ? self : this, function (A) {
  'use strict';
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const norm = x => ((x % 360) + 360) % 360;
  const NAK_SPAN = 360 / 27;

  /* ---------------- names ---------------- */
  const RASHI = [
    { en: 'Aries', hi: 'मेष', sa: 'Mesha', lord: 'Mars', sym: '♈' }, { en: 'Taurus', hi: 'वृषभ', sa: 'Vrishabha', lord: 'Venus', sym: '♉' },
    { en: 'Gemini', hi: 'मिथुन', sa: 'Mithuna', lord: 'Mercury', sym: '♊' }, { en: 'Cancer', hi: 'कर्क', sa: 'Karka', lord: 'Moon', sym: '♋' },
    { en: 'Leo', hi: 'सिंह', sa: 'Simha', lord: 'Sun', sym: '♌' }, { en: 'Virgo', hi: 'कन्या', sa: 'Kanya', lord: 'Mercury', sym: '♍' },
    { en: 'Libra', hi: 'तुला', sa: 'Tula', lord: 'Venus', sym: '♎' }, { en: 'Scorpio', hi: 'वृश्चिक', sa: 'Vrishchika', lord: 'Mars', sym: '♏' },
    { en: 'Sagittarius', hi: 'धनु', sa: 'Dhanu', lord: 'Jupiter', sym: '♐' }, { en: 'Capricorn', hi: 'मकर', sa: 'Makara', lord: 'Saturn', sym: '♑' },
    { en: 'Aquarius', hi: 'कुंभ', sa: 'Kumbha', lord: 'Saturn', sym: '♒' }, { en: 'Pisces', hi: 'मीन', sa: 'Meena', lord: 'Jupiter', sym: '♓' }
  ];
  const NAK = [
    ['Ashwini', 'अश्विनी'], ['Bharani', 'भरणी'], ['Krittika', 'कृत्तिका'], ['Rohini', 'रोहिणी'], ['Mrigashira', 'मृगशिरा'], ['Ardra', 'आर्द्रा'],
    ['Punarvasu', 'पुनर्वसु'], ['Pushya', 'पुष्य'], ['Ashlesha', 'आश्लेषा'], ['Magha', 'मघा'], ['Purva Phalguni', 'पूर्वा फाल्गुनी'], ['Uttara Phalguni', 'उत्तरा फाल्गुनी'],
    ['Hasta', 'हस्त'], ['Chitra', 'चित्रा'], ['Swati', 'स्वाति'], ['Vishakha', 'विशाखा'], ['Anuradha', 'अनुराधा'], ['Jyeshtha', 'ज्येष्ठा'],
    ['Mula', 'मूल'], ['Purva Ashadha', 'पूर्वाषाढ़ा'], ['Uttara Ashadha', 'उत्तराषाढ़ा'], ['Shravana', 'श्रवण'], ['Dhanishta', 'धनिष्ठा'], ['Shatabhisha', 'शतभिषा'],
    ['Purva Bhadrapada', 'पूर्वा भाद्रपद'], ['Uttara Bhadrapada', 'उत्तरा भाद्रपद'], ['Revati', 'रेवती']
  ].map(([en, hi]) => ({ en, hi }));
  const PLANETS = {
    Sun: { hi: 'सूर्य', ab: 'Su', abh: 'सू' }, Moon: { hi: 'चंद्र', ab: 'Mo', abh: 'चं' }, Mars: { hi: 'मंगल', ab: 'Ma', abh: 'मं' },
    Mercury: { hi: 'बुध', ab: 'Me', abh: 'बु' }, Jupiter: { hi: 'गुरु', ab: 'Ju', abh: 'गु' }, Venus: { hi: 'शुक्र', ab: 'Ve', abh: 'शु' },
    Saturn: { hi: 'शनि', ab: 'Sa', abh: 'श' }, Rahu: { hi: 'राहु', ab: 'Ra', abh: 'रा' }, Ketu: { hi: 'केतु', ab: 'Ke', abh: 'के' }
  };
  const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
  const YEAR_MS = 365.25 * 864e5;
  const EXALT = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
  const DEBIL = { Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0 };
  const OWN = { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10] };

  /* ---------------- time helpers ---------------- */
  // minutes east of UTC for an IANA zone at a given instant (handles DST + historic offsets)
  function tzOffsetMin(timeZone, date) {
    if (!timeZone) return 330;
    try {
      const f = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const p = {}; f.formatToParts(date).forEach(x => { p[x.type] = x.value; });
      const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
      return Math.round((asUTC - date.getTime()) / 60000);
    } catch (e) { return 330; }
  }
  // local wall-clock "YYYY-MM-DD", "HH:MM" in zone -> UTC Date
  function localToUTC(dateStr, timeStr, timeZone, fixedOffsetMin) {
    const [y, m, d] = dateStr.split('-').map(Number), [hh, mm] = (timeStr || '12:00').split(':').map(Number);
    const guess = Date.UTC(y, m - 1, d, hh, mm);
    if (fixedOffsetMin != null && !timeZone) return new Date(guess - fixedOffsetMin * 60000);
    let off = tzOffsetMin(timeZone, new Date(guess));
    off = tzOffsetMin(timeZone, new Date(guess - off * 60000));
    return new Date(guess - off * 60000);
  }
  const julianCenturies = date => (date.getTime() / 864e5 + 2440587.5 - 2451545.0) / 36525;

  /* ---------------- positions ---------------- */
  // Lahiri (Chitrapaksha) ayanamsa, mean, degrees
  function ayanamsa(date) {
    const T = julianCenturies(date);
    return 23.85709 + (5028.796195 * T + 1.1054348 * T * T) / 3600;
  }
  function tropicalLon(body, date) {
    if (body === 'Moon') return norm(A.EclipticGeoMoon(date).lon);
    if (body === 'Sun') return norm(A.SunPosition(date).elon);
    const v = A.GeoVector(body, date, true);
    const r = A.RotateVector(A.Rotation_EQJ_ECT(date), v);
    return norm(A.SphereFromVector(r).lon);
  }
  function meanRahuTropical(date) {
    const T = julianCenturies(date);
    return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441 - T * T * T * T / 60616000);
  }
  function siderealLon(body, date, ayan) {
    ayan = ayan == null ? ayanamsa(date) : ayan;
    if (body === 'Rahu') return norm(meanRahuTropical(date) - ayan);
    if (body === 'Ketu') return norm(meanRahuTropical(date) + 180 - ayan);
    return norm(tropicalLon(body, date) - ayan);
  }
  function speed(body, date) { // deg/day (tropical), for retrograde check
    if (body === 'Rahu' || body === 'Ketu') return -0.053;
    const a = tropicalLon(body, new Date(date.getTime() - 432e5)), b = tropicalLon(body, new Date(date.getTime() + 432e5));
    let d = b - a; if (d > 180) d -= 360; if (d < -180) d += 360; return d;
  }
  function ascendant(date, lat, lon, ayan) {
    const T = julianCenturies(date);
    const eps = (23.4392911 - 0.0130042 * T) * D2R;
    const lst = norm(A.SiderealTime(date) * 15 + lon) * D2R;
    const asc = Math.atan2(Math.cos(lst), -(Math.sin(lst) * Math.cos(eps) + Math.tan(lat * D2R) * Math.sin(eps))) * R2D;
    return norm(asc - (ayan == null ? ayanamsa(date) : ayan));
  }

  /* ---------------- descriptors ---------------- */
  function signOf(lon) { return Math.floor(norm(lon) / 30); }
  function nakOf(lon) { const x = norm(lon), i = Math.floor(x / NAK_SPAN); return { index: i, pada: Math.floor((x - i * NAK_SPAN) / (NAK_SPAN / 4)) + 1, frac: (x - i * NAK_SPAN) / NAK_SPAN, lord: DASHA_LORDS[i % 9] }; }
  function dms(lon) { const x = norm(lon) % 30, d = Math.floor(x), mf = (x - d) * 60, m = Math.floor(mf), s = Math.floor((mf - m) * 60); return `${d}°${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"`; }
  function dignity(p, sign) {
    if (EXALT[p] === sign) return 'exalted'; if (DEBIL[p] === sign) return 'debilitated';
    if (OWN[p] && OWN[p].includes(sign)) return 'own'; return '';
  }

  /* ---------------- Vimshottari dasha ---------------- */
  function vimshottari(moonLon, birth, levels) {
    const n = nakOf(moonLon), startIdx = DASHA_LORDS.indexOf(n.lord);
    let t = birth.getTime() - n.frac * DASHA_YEARS[n.lord] * YEAR_MS;
    const out = [];
    for (let k = 0; k < 9 * 2; k++) { // two full cycles = 240 years, trimmed below
      const lord = DASHA_LORDS[(startIdx + k) % 9], dur = DASHA_YEARS[lord] * YEAR_MS;
      const md = { lord, start: new Date(t), end: new Date(t + dur), sub: [] };
      let s = t; const si = DASHA_LORDS.indexOf(lord);
      for (let j = 0; j < 9; j++) { const sl = DASHA_LORDS[(si + j) % 9], sd = dur * DASHA_YEARS[sl] / 120; md.sub.push({ lord: sl, start: new Date(s), end: new Date(s + sd) }); s += sd; }
      out.push(md); t += dur;
      if (t > birth.getTime() + 120 * YEAR_MS) break;
    }
    return out;
  }
  function currentDasha(dashas, when) {
    const t = (when || new Date()).getTime();
    const md = dashas.find(d => d.start.getTime() <= t && t < d.end.getTime()); if (!md) return null;
    const ad = md.sub.find(d => d.start.getTime() <= t && t < d.end.getTime());
    return { md, ad };
  }

  /* ---------------- Kundli ---------------- */
  // input: { date:'YYYY-MM-DD', time:'HH:MM', lat, lon, tz:'Asia/Kolkata' | null, offsetMin }
  function kundli(inp) {
    const birth = localToUTC(inp.date, inp.time, inp.tz, inp.offsetMin);
    const ayan = ayanamsa(birth);
    const lagnaLon = ascendant(birth, +inp.lat, +inp.lon, ayan), lagna = signOf(lagnaLon);
    const planets = PLANET_ORDER.map(p => {
      const lon = siderealLon(p, birth, ayan), sign = signOf(lon), nk = nakOf(lon);
      const sp = speed(p, birth);
      return { name: p, lon, sign, deg: dms(lon), house: ((sign - lagna + 12) % 12) + 1, nak: nk.index, pada: nk.pada, nakLord: nk.lord,
        retro: p === 'Rahu' || p === 'Ketu' ? true : sp < 0, navamsa: Math.floor(norm(lon) / (30 / 9)) % 12, dignity: dignity(p, sign) };
    });
    const moon = planets[1], sun = planets[0];
    const dashas = vimshottari(moon.lon, birth);
    const mars = planets[2];
    const fromLagna = [1, 2, 4, 7, 8, 12].includes(mars.house);
    const fromMoonH = ((mars.sign - moon.sign + 12) % 12) + 1, fromMoon = [1, 2, 4, 7, 8, 12].includes(fromMoonH);
    // common cancellations: Mars in own/exalted sign
    const cancelled = (fromLagna || fromMoon) && (mars.dignity === 'own' || mars.dignity === 'exalted');
    const nk = nakOf(moon.lon);
    return {
      input: inp, birthUTC: birth, ayanamsa: ayan,
      lagna: { lon: lagnaLon, sign: lagna, deg: dms(lagnaLon), nak: nakOf(lagnaLon).index, navamsa: Math.floor(lagnaLon / (30 / 9)) % 12 },
      planets, moonSign: moon.sign, sunSign: sun.sign, nakshatra: nk.index, pada: nk.pada,
      dashas, current: currentDasha(dashas),
      manglik: { fromLagna, fromMoon, cancelled, status: cancelled ? 'cancelled' : (fromLagna && fromMoon ? 'high' : (fromLagna || fromMoon ? 'mild' : 'none')) },
      gana: GANA[nk.index], nadi: NADI[nk.index % 6], yoni: YONI_OF[nk.index], varna: VARNA[moon.sign],
      tithiAtBirth: tithiFor(sun.lon, moon.lon)
    };
  }

  /* ---------------- Panchang ---------------- */
  const TITHI = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'];
  const TITHI_HI = ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी'];
  const YOGA = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
  const YOGA_HI = ['विष्कुम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा', 'धृति', 'शूल', 'गण्ड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इन्द्र', 'वैधृति'];
  const KARANA = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti (Bhadra)'];
  const KARANA_HI = ['बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि (भद्रा)'];
  const VAAR = [['Ravivaar (Sunday)', 'रविवार'], ['Somvaar (Monday)', 'सोमवार'], ['Mangalvaar (Tuesday)', 'मंगलवार'], ['Budhvaar (Wednesday)', 'बुधवार'], ['Guruvaar (Thursday)', 'गुरुवार'], ['Shukravaar (Friday)', 'शुक्रवार'], ['Shanivaar (Saturday)', 'शनिवार']];
  function tithiFor(sunLon, moonLon) {
    const diff = norm(moonLon - sunLon), i = Math.floor(diff / 12); // 0..29
    const paksha = i < 15 ? 'Shukla' : 'Krishna', n = i % 15;
    const en = n === 14 ? (i < 15 ? 'Purnima' : 'Amavasya') : TITHI[n], hi = n === 14 ? (i < 15 ? 'पूर्णिमा' : 'अमावस्या') : TITHI_HI[n];
    return { index: i, paksha, pakshaHi: i < 15 ? 'शुक्ल' : 'कृष्ण', en, hi };
  }
  function karanaFor(sunLon, moonLon) {
    const k = Math.floor(norm(moonLon - sunLon) / 6);
    if (k === 0) return { en: 'Kimstughna', hi: 'किंस्तुघ्न' };
    if (k >= 57) return [{ en: 'Shakuni', hi: 'शकुनि' }, { en: 'Chatushpada', hi: 'चतुष्पाद' }, { en: 'Naga', hi: 'नाग' }][k - 57];
    return { en: KARANA[(k - 1) % 7], hi: KARANA_HI[(k - 1) % 7] };
  }
  // find time (after t0) when f(t) (an angle growing ~linearly) next reaches a multiple of step
  function nextBoundary(f, t0, step, maxHours) {
    const v0 = f(t0), target = (Math.floor(v0 / step) + 1) * step;
    const g = t => { let d = f(t) - target; if (d < -180) d += 360; if (d > 180) d -= 360; return d; };
    let a = t0, b = t0; const H = 36e5;
    for (let h = 1; h <= (maxHours || 36); h++) { b = new Date(t0.getTime() + h * H); if (g(b) >= 0) break; a = b; }
    for (let i = 0; i < 30; i++) { const m = new Date((a.getTime() + b.getTime()) / 2); if (g(m) >= 0) b = m; else a = m; }
    return b;
  }
  function panchang(dateStr, lat, lon, tz) {
    const midnight = localToUTC(dateStr, '00:00', tz);
    const obs = new A.Observer(+lat, +lon, 0);
    const rise = A.SearchRiseSet('Sun', obs, +1, midnight, 1), set = A.SearchRiseSet('Sun', obs, -1, midnight, 1);
    const moonrise = A.SearchRiseSet('Moon', obs, +1, midnight, 1), moonset = A.SearchRiseSet('Moon', obs, -1, midnight, 1);
    const sr = rise ? rise.date : localToUTC(dateStr, '06:00', tz), ss = set ? set.date : localToUTC(dateStr, '18:00', tz);
    const t = sr; // panchang elements at sunrise (traditional)
    const ayan = ayanamsa(t), sun = siderealLon('Sun', t, ayan), moon = siderealLon('Moon', t, ayan);
    const tithi = tithiFor(sun, moon), nk = nakOf(moon), yogaI = Math.floor(norm(sun + moon) / NAK_SPAN);
    const elong = x => norm(siderealLon('Moon', x) - siderealLon('Sun', x));
    const tithiEnd = nextBoundary(elong, t, 12, 36), nakEnd = nextBoundary(x => siderealLon('Moon', x), t, NAK_SPAN, 36);
    const yogaEnd = nextBoundary(x => norm(siderealLon('Sun', x) + siderealLon('Moon', x)), t, NAK_SPAN, 36);
    const [y, m, d] = dateStr.split('-').map(Number), wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const dayLen = ss - sr, part = dayLen / 8;
    const seg = n => ({ start: new Date(sr.getTime() + (n - 1) * part), end: new Date(sr.getTime() + n * part) });
    const RAHU = [8, 2, 7, 5, 6, 4, 3], YAMA = [5, 4, 3, 2, 1, 7, 6], GULIKA = [7, 6, 5, 4, 3, 2, 1];
    const noon = sr.getTime() + dayLen / 2, muh = dayLen / 15;
    return {
      date: dateStr, sunrise: sr, sunset: ss, moonrise: moonrise && moonrise.date, moonset: moonset && moonset.date,
      vaar: { en: VAAR[wd][0], hi: VAAR[wd][1], index: wd },
      tithi: Object.assign(tithi, { end: tithiEnd }), nakshatra: { index: nk.index, en: NAK[nk.index].en, hi: NAK[nk.index].hi, end: nakEnd, lord: nk.lord },
      yoga: { en: YOGA[yogaI], hi: YOGA_HI[yogaI], end: yogaEnd }, karana: karanaFor(sun, moon),
      sunSign: signOf(sun), moonSign: signOf(moon),
      rahuKaal: seg(RAHU[wd]), yamaganda: seg(YAMA[wd]), gulika: seg(GULIKA[wd]),
      abhijit: wd === 3 ? null : { start: new Date(noon - muh / 2), end: new Date(noon + muh / 2) }
    };
  }
  function moonSignNow(when) { return signOf(siderealLon('Moon', when || new Date())); }

  /* ---------------- Vrat / festival calendar (tithi at sunrise) ---------------- */
  function addDays(dateStr, n) { const [y, m, d] = dateStr.split('-').map(Number), t = new Date(Date.UTC(y, m - 1, d + n)); return t.toISOString().slice(0, 10); }
  function sunriseInfo(dateStr, obs, tz) {
    const midnight = localToUTC(dateStr, '00:00', tz), r = A.SearchRiseSet('Sun', obs, +1, midnight, 1);
    const t = r ? r.date : localToUTC(dateStr, '06:00', tz), ay = ayanamsa(t), sun = siderealLon('Sun', t, ay), moon = siderealLon('Moon', t, ay);
    return { date: dateStr, rise: t, t: Math.floor(norm(moon - sun) / 12), sunSign: signOf(sun) };
  }
  const VRATS = [
    { t: 10, key: 'ekadashi', en: 'Shukla Ekadashi', hi: 'शुक्ल एकादशी', ic: '🌿' }, { t: 25, key: 'ekadashi', en: 'Krishna Ekadashi', hi: 'कृष्ण एकादशी', ic: '🌿' },
    { t: 14, key: 'purnima', en: 'Purnima', hi: 'पूर्णिमा', ic: '🌕' }, { t: 29, key: 'amavasya', en: 'Amavasya', hi: 'अमावस्या', ic: '🌑' },
    { t: 12, key: 'pradosh', en: 'Pradosh Vrat (Shukla)', hi: 'प्रदोष व्रत (शुक्ल)', ic: '🔱' }, { t: 27, key: 'pradosh', en: 'Pradosh Vrat (Krishna)', hi: 'प्रदोष व्रत (कृष्ण)', ic: '🔱' },
    { t: 28, key: 'shivratri', en: 'Masik Shivratri', hi: 'मासिक शिवरात्रि', ic: '🕉️' }, { t: 3, key: 'vinayaka', en: 'Vinayaka Chaturthi', hi: 'विनायक चतुर्थी', ic: '🐘' },
    { t: 18, key: 'sankashti', en: 'Sankashti Chaturthi', hi: 'संकष्टी चतुर्थी', ic: '🐘' }
  ];
  function vratCalendar(startDate, days, lat, lon, tz) {
    const obs = new A.Observer(+lat, +lon, 0), info = [];
    for (let i = -1; i <= days + 1; i++) info.push(sunriseInfo(addDays(startDate, i), obs, tz));
    const out = [];
    for (let i = 1; i <= days; i++) {
      const prev = info[i - 1], cur = info[i], next = info[i + 1];
      VRATS.forEach(v => {
        const today = cur.t === v.t && prev.t !== v.t;
        const kshaya = (next.t - cur.t + 30) % 30 === 2 && (v.t - cur.t + 30) % 30 === 1; // tithi skipped between two sunrises
        if (today || kshaya) out.push({ date: cur.date, key: v.key, en: v.en, hi: v.hi, ic: v.ic });
      });
      if (cur.sunSign !== prev.sunSign) { // Sankranti: local date of the Sun's ingress
        let a = prev.rise.getTime(), b = cur.rise.getTime();
        for (let k = 0; k < 25; k++) { const m = (a + b) / 2; if (signOf(siderealLon('Sun', new Date(m))) === prev.sunSign) a = m; else b = m; }
        const at = new Date(b), loc = new Date(at.getTime() + tzOffsetMin(tz, at) * 60000).toISOString().slice(0, 10), s = cur.sunSign;
        out.push({ date: loc, key: 'sankranti', at, en: (s === 9 ? 'Makar' : RASHI[s].sa) + ' Sankranti', hi: (s === 9 ? 'मकर' : RASHI[s].hi) + ' संक्रांति', ic: '☀️' });
      }
    }
    return out.sort((x, y) => x.date < y.date ? -1 : x.date > y.date ? 1 : 0);
  }

  /* ---------------- Ashtakoota (36 Gun Milan) ---------------- */
  const VARNA = [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3]; // by rashi: 3 Brahmin, 2 Kshatriya, 1 Vaishya, 0 Shudra
  const VARNA_NAMES = ['Shudra', 'Vaishya', 'Kshatriya', 'Brahmin'];
  const VASHYA_TBL = [[2, 1, 1, 0.5, 1], [1, 2, 0.5, 0, 1], [1, 0.5, 2, 1, 1], [0.5, 0, 1, 2, 0], [1, 1, 1, 0, 2]];
  const VASHYA_NAMES = ['Chatushpada', 'Manava', 'Jalachara', 'Vanachara', 'Keeta'];
  function vashyaOf(lon) {
    const s = signOf(lon), deg = norm(lon) % 30;
    return [0, 0, 1, 2, 3, 1, 1, 4, deg < 15 ? 1 : 0, deg < 15 ? 0 : 2, 1, 2][s];
  }
  const YONI_NAMES = ['Horse', 'Elephant', 'Sheep', 'Serpent', 'Dog', 'Cat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Deer', 'Monkey', 'Mongoose', 'Lion'];
  const YONI_OF = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1];
  const YONI_TBL = [
    [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1], [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0], [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
    [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2], [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1], [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
    [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2], [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1], [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1], [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1], [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
    [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2], [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4]];
  const FRIENDS = { Sun: ['Moon', 'Mars', 'Jupiter'], Moon: ['Sun', 'Mercury'], Mars: ['Sun', 'Moon', 'Jupiter'], Mercury: ['Sun', 'Venus'], Jupiter: ['Sun', 'Moon', 'Mars'], Venus: ['Mercury', 'Saturn'], Saturn: ['Mercury', 'Venus'] };
  const ENEMIES = { Sun: ['Venus', 'Saturn'], Moon: [], Mars: ['Mercury'], Mercury: ['Moon'], Jupiter: ['Mercury', 'Venus'], Venus: ['Sun', 'Moon'], Saturn: ['Sun', 'Moon', 'Mars'] };
  const rel = (a, b) => FRIENDS[a].includes(b) ? 2 : (ENEMIES[a].includes(b) ? 0 : 1);
  function maitriScore(l1, l2) {
    if (l1 === l2) return 5;
    const a = rel(l1, l2), b = rel(l2, l1), key = [a, b].sort().join('');
    return { '22': 5, '12': 4, '11': 3, '02': 1, '01': 0.5, '00': 0 }[key];
  }
  const GANA = ['Deva', 'Manushya', 'Rakshasa', 'Manushya', 'Deva', 'Manushya', 'Deva', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva'];
  const GANA_TBL = { Deva: { Deva: 6, Manushya: 5, Rakshasa: 1 }, Manushya: { Deva: 6, Manushya: 6, Rakshasa: 0 }, Rakshasa: { Deva: 1, Manushya: 0, Rakshasa: 6 } }; // [girl][boy]
  const NADI = ['Aadi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Aadi'];
  function taraPoints(from, to) { const n = ((to - from + 27) % 27) + 1, r = n % 9; return [3, 5, 7].includes(r) ? 0 : 1.5; }

  function gunMilan(boyMoonLon, girlMoonLon) {
    const bs = signOf(boyMoonLon), gs = signOf(girlMoonLon), bn = nakOf(boyMoonLon).index, gn = nakOf(girlMoonLon).index;
    const varna = VARNA[bs] >= VARNA[gs] ? 1 : 0;
    const vashya = VASHYA_TBL[vashyaOf(boyMoonLon)][vashyaOf(girlMoonLon)];
    const tara = taraPoints(gn, bn) + taraPoints(bn, gn);
    const yoni = YONI_TBL[YONI_OF[bn]][YONI_OF[gn]];
    const maitri = maitriScore(RASHI[bs].lord, RASHI[gs].lord);
    const gana = GANA_TBL[GANA[gn]][GANA[bn]];
    const d1 = ((gs - bs + 12) % 12) + 1, d2 = ((bs - gs + 12) % 12) + 1, pair = [d1, d2].sort((a, b) => a - b).join('-');
    const bhakootDosha = ['2-12', '5-9', '6-8'].includes(pair), bhakoot = bhakootDosha ? 0 : 7;
    const nadiDosha = NADI[bn % 6] === NADI[gn % 6], nadi = nadiDosha ? 0 : 8;
    const kootas = [
      { key: 'varna', en: 'Varna', hi: 'वर्ण', max: 1, got: varna, b: VARNA_NAMES[VARNA[bs]], g: VARNA_NAMES[VARNA[gs]], about: 'Work & ego compatibility' },
      { key: 'vashya', en: 'Vashya', hi: 'वश्य', max: 2, got: vashya, b: VASHYA_NAMES[vashyaOf(boyMoonLon)], g: VASHYA_NAMES[vashyaOf(girlMoonLon)], about: 'Mutual attraction & control' },
      { key: 'tara', en: 'Tara', hi: 'तारा', max: 3, got: tara, b: NAK[bn].en, g: NAK[gn].en, about: 'Health & destiny together' },
      { key: 'yoni', en: 'Yoni', hi: 'योनि', max: 4, got: yoni, b: YONI_NAMES[YONI_OF[bn]], g: YONI_NAMES[YONI_OF[gn]], about: 'Physical & intimate harmony' },
      { key: 'maitri', en: 'Graha Maitri', hi: 'ग्रह मैत्री', max: 5, got: maitri, b: RASHI[bs].lord, g: RASHI[gs].lord, about: 'Mental friendship' },
      { key: 'gana', en: 'Gana', hi: 'गण', max: 6, got: gana, b: GANA[bn], g: GANA[gn], about: 'Temperament' },
      { key: 'bhakoot', en: 'Bhakoot', hi: 'भकूट', max: 7, got: bhakoot, b: RASHI[bs].en, g: RASHI[gs].en, about: 'Family welfare & finances' },
      { key: 'nadi', en: 'Nadi', hi: 'नाड़ी', max: 8, got: nadi, b: NADI[bn % 6], g: NADI[gn % 6], about: 'Health & progeny' }
    ];
    const total = kootas.reduce((s, k) => s + k.got, 0);
    return { total, kootas, nadiDosha, bhakootDosha, verdict: total >= 28 ? 'excellent' : total >= 18 ? 'good' : 'low' };
  }

  /* ---------------- North-Indian chart SVG ---------------- */
  const HOUSE_XY = [[200, 112], [100, 50], [48, 112], [112, 200], [48, 290], [100, 352], [200, 290], [300, 352], [352, 290], [290, 200], [352, 112], [300, 50]];
  const SIGN_XY = [[200, 175], [100, 14], [14, 100], [175, 200], [14, 300], [100, 388], [200, 228], [300, 388], [388, 300], [228, 200], [388, 100], [300, 14]];
  function chartSVG(k, opt) {
    opt = opt || {}; const hi = opt.lang === 'hi', useNav = opt.navamsa;
    const lagnaSign = useNav ? k.lagna.navamsa : k.lagna.sign;
    const byHouse = Array.from({ length: 12 }, () => []);
    k.planets.forEach(p => { const s = useNav ? p.navamsa : p.sign; byHouse[(s - lagnaSign + 12) % 12].push(p); });
    const stroke = opt.stroke || '#7c3aed';
    let s = `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" class="kchart" role="img" aria-label="${useNav ? 'Navamsa' : 'Lagna'} chart">`;
    s += `<rect x="2" y="2" width="396" height="396" rx="10" fill="${opt.bg || '#fbf8ff'}" stroke="${stroke}" stroke-width="3"/>`;
    s += `<path d="M2 2L398 398M398 2L2 398M200 2L398 200L200 398L2 200Z" fill="none" stroke="${stroke}" stroke-width="2"/>`;
    for (let h = 0; h < 12; h++) {
      const sign = (lagnaSign + h) % 12, [sx, sy] = SIGN_XY[h];
      s += `<text x="${sx}" y="${sy}" font-size="13" fill="#b45309" text-anchor="middle" dominant-baseline="middle" font-weight="700">${sign + 1}</text>`;
      const items = byHouse[h].map(p => (hi ? PLANETS[p.name].abh : PLANETS[p.name].ab) + (p.retro && p.name !== 'Rahu' && p.name !== 'Ketu' ? '*' : ''));
      if (h === 0) items.unshift(hi ? 'लग्न' : 'Asc');
      const [x, y] = HOUSE_XY[h], per = 3, rows = Math.ceil(items.length / per);
      items.forEach((t, i) => {
        const r = Math.floor(i / per), c = i % per, inRow = Math.min(per, items.length - r * per);
        const tx = x + (c - (inRow - 1) / 2) * 30, ty = y + (r - (rows - 1) / 2) * 18;
        s += `<text x="${tx}" y="${ty}" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="${t === 'Asc' || t === 'लग्न' ? '#7c3aed' : '#1f2937'}" font-weight="600">${t}</text>`;
      });
    }
    return s + '</svg>';
  }

  return { RASHI, NAK, PLANETS, PLANET_ORDER, DASHA_LORDS, DASHA_YEARS, GANA, NADI, YONI_NAMES, YONI_OF, YONI_TBL, VASHYA_TBL,
    norm, ayanamsa, siderealLon, ascendant, signOf, nakOf, dms, kundli, vimshottari, currentDasha, panchang, tithiFor, gunMilan, chartSVG,
    localToUTC, tzOffsetMin, moonSignNow, maitriScore, vratCalendar, addDays };
});
