/* Astro-Shree content: numerology, tarot, rashifal (Chandra gochar), interpretations. Bilingual EN / HI. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const dr = n => { n = Math.abs(n); while (n > 9) n = String(n).split('').reduce((a, b) => a + +b, 0); return n; };

  /* ============ NUMEROLOGY ============ */
  const CHALDEAN = { A: 1, I: 1, J: 1, Q: 1, Y: 1, B: 2, K: 2, R: 2, C: 3, G: 3, L: 3, S: 3, D: 4, M: 4, T: 4, E: 5, H: 5, N: 5, X: 5, U: 6, V: 6, W: 6, O: 7, Z: 7, F: 8, P: 8 };
  const NUM = {
    1: { planet: 'Sun', hiP: 'सूर्य', color: 'Gold, Orange', hiC: 'सुनहरा, नारंगी', day: 'Sunday', hiD: 'रविवार', friends: [1, 2, 3, 9], foe: [8],
      en: 'Born leader — independent, confident and original. You shine when you take charge.', hi: 'जन्मजात नेता — स्वतंत्र, आत्मविश्वासी और मौलिक। ज़िम्मेदारी लेने पर आप चमकते हैं।' },
    2: { planet: 'Moon', hiP: 'चंद्र', color: 'White, Cream', hiC: 'सफ़ेद, क्रीम', day: 'Monday', hiD: 'सोमवार', friends: [1, 2, 3, 5], foe: [8, 9],
      en: 'Sensitive, caring and intuitive. A natural peace-maker with a creative heart.', hi: 'संवेदनशील, स्नेही और अंतर्ज्ञानी। रचनात्मक हृदय वाले स्वाभाविक शांतिदूत।' },
    3: { planet: 'Jupiter', hiP: 'गुरु', color: 'Yellow', hiC: 'पीला', day: 'Thursday', hiD: 'गुरुवार', friends: [1, 2, 3, 5, 7], foe: [6],
      en: 'Wise, disciplined and expressive. Teaching, guiding and learning bring you luck.', hi: 'ज्ञानी, अनुशासित और अभिव्यक्त। सिखाना, मार्गदर्शन और सीखना भाग्य लाता है।' },
    4: { planet: 'Rahu', hiP: 'राहु', color: 'Blue, Grey', hiC: 'नीला, स्लेटी', day: 'Saturday', hiD: 'शनिवार', friends: [1, 5, 6, 7], foe: [2, 9],
      en: 'Practical, hard-working and unconventional. You build things that last.', hi: 'व्यावहारिक, मेहनती और अलग सोच वाले। आप टिकाऊ चीज़ें बनाते हैं।' },
    5: { planet: 'Mercury', hiP: 'बुध', color: 'Green', hiC: 'हरा', day: 'Wednesday', hiD: 'बुधवार', friends: [1, 2, 3, 5, 6], foe: [],
      en: 'Quick-minded, witty and adaptable. Business, communication and travel suit you.', hi: 'तेज़ दिमाग, हाज़िरजवाब और लचीले। व्यापार, संवाद और यात्रा आपके लिए शुभ।' },
    6: { planet: 'Venus', hiP: 'शुक्र', color: 'White, Pink', hiC: 'सफ़ेद, गुलाबी', day: 'Friday', hiD: 'शुक्रवार', friends: [1, 5, 6, 7], foe: [3],
      en: 'Loving, artistic and responsible. You bring beauty and comfort to every home.', hi: 'प्रेमपूर्ण, कलात्मक और ज़िम्मेदार। आप हर घर में सुंदरता और सुख लाते हैं।' },
    7: { planet: 'Ketu', hiP: 'केतु', color: 'Light green, White', hiC: 'हल्का हरा, सफ़ेद', day: 'Monday', hiD: 'सोमवार', friends: [1, 3, 4, 5, 6], foe: [8, 9],
      en: 'Deep thinker, spiritual and intuitive. Research, healing and mysticism call you.', hi: 'गहरे विचारक, आध्यात्मिक और अंतर्ज्ञानी। शोध, उपचार और रहस्यविद्या आपको बुलाती है।' },
    8: { planet: 'Saturn', hiP: 'शनि', color: 'Dark blue, Black', hiC: 'गहरा नीला, काला', day: 'Saturday', hiD: 'शनिवार', friends: [3, 5, 6], foe: [1, 2, 4, 8],
      en: 'Patient, ambitious and just. Success comes slowly but stays for life.', hi: 'धैर्यवान, महत्वाकांक्षी और न्यायप्रिय। सफलता धीरे आती है पर जीवनभर टिकती है।' },
    9: { planet: 'Mars', hiP: 'मंगल', color: 'Red', hiC: 'लाल', day: 'Tuesday', hiD: 'मंगलवार', friends: [1, 3, 5, 6, 9], foe: [2, 4],
      en: 'Brave, energetic and generous. A fighter with a big heart for others.', hi: 'साहसी, ऊर्जावान और उदार। दूसरों के लिए बड़ा दिल रखने वाले योद्धा।' }
  };
  const MISSING = {
    1: ['Self-expression may feel hard; practice speaking up.', 'अपनी बात कहने में झिझक; खुलकर बोलने का अभ्यास करें।'],
    2: ['Sensitivity & intuition need care; keep calm routines.', 'संवेदनशीलता पर ध्यान दें; शांत दिनचर्या रखें।'],
    3: ['Imagination & confidence can be boosted by learning daily.', 'रोज़ कुछ नया सीखकर कल्पना और आत्मविश्वास बढ़ाएँ।'],
    4: ['Discipline & order need effort; make a written plan.', 'अनुशासन पर मेहनत चाहिए; लिखकर योजना बनाएँ।'],
    5: ['Balance & willpower — avoid extremes, stay centred.', 'संतुलन और इच्छाशक्ति — अति से बचें, केंद्रित रहें।'],
    6: ['Family & home harmony needs attention and gratitude.', 'परिवार और घर की शांति पर ध्यान व आभार ज़रूरी।'],
    7: ['Patience in learning from setbacks; spiritual practice helps.', 'असफलता से सीखने का धैर्य; साधना मदद करती है।'],
    8: ['Money management needs care; save regularly.', 'धन प्रबंधन में सावधानी; नियमित बचत करें।'],
    9: ['Drive & ambition can be raised with exercise and goals.', 'व्यायाम और लक्ष्य से ऊर्जा व महत्वाकांक्षा बढ़ाएँ।']
  };
  const PLANES = [
    { n: [4, 9, 2], en: 'Mental plane (sharp mind)', hi: 'मानसिक तल (तेज़ दिमाग)' }, { n: [3, 5, 7], en: 'Emotional plane (strong feelings)', hi: 'भावनात्मक तल (गहरी भावनाएँ)' },
    { n: [8, 1, 6], en: 'Practical plane (gets things done)', hi: 'व्यावहारिक तल (काम पूरा करने वाले)' }, { n: [4, 3, 8], en: 'Thought plane (planner)', hi: 'विचार तल (योजनाकार)' },
    { n: [9, 5, 1], en: 'Will plane (determined)', hi: 'इच्छाशक्ति तल (दृढ़ निश्चयी)' }, { n: [2, 7, 6], en: 'Action plane (doer)', hi: 'कर्म तल (कर्मठ)' },
    { n: [4, 5, 6], en: 'Golden Yog / Raj Yog (success)', hi: 'राजयोग (सफलता)' }, { n: [2, 5, 8], en: 'Property plane (assets)', hi: 'संपत्ति तल (धन-संपदा)' }
  ];
  function nameNumber(name) {
    const letters = String(name || '').toUpperCase().replace(/[^A-Z]/g, '').split('');
    const compound = letters.reduce((s, c) => s + (CHALDEAN[c] || 0), 0);
    return { compound, root: dr(compound) };
  }
  function numerology(dob, name) { // dob 'YYYY-MM-DD'
    const [y, m, d] = dob.split('-').map(Number);
    const mulank = dr(d), bhagyank = dr(String(y) + String(m) + String(d));
    const digits = (String(d) + String(m) + String(y)).split('').map(Number).filter(x => x > 0);
    const grid = Array(10).fill(0); digits.forEach(x => grid[x]++); grid[mulank]++; grid[bhagyank]++;
    const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => !grid[x]);
    const planes = PLANES.filter(p => p.n.every(x => grid[x]));
    const nn = name ? nameNumber(name) : null;
    const nameOk = nn ? (NUM[mulank].friends.includes(nn.root) || NUM[bhagyank].friends.includes(nn.root) || nn.root === mulank) && !NUM[bhagyank].foe.includes(nn.root) : null;
    const personalYear = dr(String(new Date().getFullYear()) + String(m) + String(d));
    return { mulank, bhagyank, grid, missing, planes, name: nn, nameOk, personalYear, info: NUM[mulank], destiny: NUM[bhagyank], luckyNumbers: [...new Set([mulank, bhagyank, ...NUM[mulank].friends])].slice(0, 4) };
  }
  function numberCheck(numberStr, dob) { // mobile / vehicle number vibration
    const ds = String(numberStr).replace(/\D/g, ''); if (!ds) return null;
    const total = ds.split('').reduce((a, b) => a + +b, 0), root = dr(total);
    const n = dob ? numerology(dob) : null;
    let verdict = 'neutral';
    if (n) {
      if (root === n.mulank || root === n.bhagyank) verdict = 'lucky';
      else if (NUM[n.mulank].foe.includes(root) || NUM[n.bhagyank].foe.includes(root)) verdict = 'avoid';
      else if (NUM[n.mulank].friends.includes(root) || NUM[n.bhagyank].friends.includes(root)) verdict = 'lucky';
    }
    return { total, root, verdict, info: NUM[root] };
  }

  /* ============ TAROT (78-card deck) ============ */
  const MAJOR = [
    ['The Fool', 'मूर्ख', '🌈', 'New beginnings, faith, a leap into the unknown', 'नई शुरुआत, विश्वास, अनजान राह पर पहला कदम', 'Hesitation, careless risk', 'हिचकिचाहट, लापरवाह जोखिम'],
    ['The Magician', 'जादूगर', '🪄', 'Willpower, skill, you have every tool you need', 'इच्छाशक्ति, कौशल — आपके पास सब साधन हैं', 'Untapped talent, trickery', 'छुपी प्रतिभा, छल'],
    ['The High Priestess', 'महापुजारिन', '🌙', 'Intuition, hidden knowledge, listen within', 'अंतर्ज्ञान, गुप्त ज्ञान — भीतर की आवाज़ सुनें', 'Secrets, ignoring your gut', 'रहस्य, अंतर्मन को अनसुना करना'],
    ['The Empress', 'महारानी', '🌸', 'Abundance, nurturing, creativity, fertility', 'समृद्धि, पोषण, रचनात्मकता', 'Dependence, creative block', 'निर्भरता, रचनात्मक रुकावट'],
    ['The Emperor', 'सम्राट', '👑', 'Structure, authority, stable leadership', 'व्यवस्था, अधिकार, स्थिर नेतृत्व', 'Rigidity, control issues', 'कठोरता, नियंत्रण की समस्या'],
    ['The Hierophant', 'गुरु', '🕉️', 'Tradition, guidance from a teacher, rituals', 'परंपरा, गुरु का मार्गदर्शन, संस्कार', 'Rebellion, new paths', 'विद्रोह, नई राहें'],
    ['The Lovers', 'प्रेमी', '💞', 'Love, harmony, an important choice of the heart', 'प्रेम, सामंजस्य, दिल का अहम फ़ैसला', 'Imbalance, misaligned values', 'असंतुलन, मूल्यों में टकराव'],
    ['The Chariot', 'रथ', '🏇', 'Victory through determination and focus', 'दृढ़ संकल्प और एकाग्रता से विजय', 'Scattered energy, delays', 'बिखरी ऊर्जा, देरी'],
    ['Strength', 'शक्ति', '🦁', 'Courage, patience, gentle inner power', 'साहस, धैर्य, कोमल आंतरिक शक्ति', 'Self-doubt, low energy', 'आत्म-संदेह, कम ऊर्जा'],
    ['The Hermit', 'साधु', '🏔️', 'Soul-searching, solitude, inner wisdom', 'आत्म-खोज, एकांत, भीतरी ज्ञान', 'Isolation, loneliness', 'अलगाव, अकेलापन'],
    ['Wheel of Fortune', 'भाग्य चक्र', '☸️', 'Luck turning, destiny, a lucky cycle begins', 'भाग्य का पहिया घूमा, शुभ चक्र शुरू', 'Bad luck, resisting change', 'दुर्भाग्य, बदलाव का विरोध'],
    ['Justice', 'न्याय', '⚖️', 'Truth, fairness, karma, right decisions', 'सत्य, निष्पक्षता, कर्म, सही निर्णय', 'Unfairness, avoiding accountability', 'अन्याय, ज़िम्मेदारी से बचना'],
    ['The Hanged Man', 'उल्टा लटका', '🙃', 'Pause, surrender, see things differently', 'ठहराव, समर्पण, नए नज़रिए से देखें', 'Stalling, needless sacrifice', 'अटकाव, बेवजह त्याग'],
    ['Death', 'परिवर्तन', '🦋', 'Endings that make way for transformation', 'अंत जो परिवर्तन का रास्ता खोलता है', 'Resisting change, stagnation', 'बदलाव से डर, ठहराव'],
    ['Temperance', 'संयम', '🏺', 'Balance, moderation, healing patience', 'संतुलन, संयम, धैर्य से उपचार', 'Excess, imbalance', 'अति, असंतुलन'],
    ['The Devil', 'बंधन', '⛓️', 'Attachment, temptation, unhealthy patterns', 'मोह, प्रलोभन, गलत आदतें', 'Breaking free, release', 'बंधन से मुक्ति'],
    ['The Tower', 'मीनार', '⚡', 'Sudden change, revelation, breakthrough', 'अचानक बदलाव, सच का उजागर होना', 'Avoiding disaster, fear of change', 'संकट टलना, बदलाव का डर'],
    ['The Star', 'तारा', '⭐', 'Hope, healing, renewed faith and blessings', 'आशा, उपचार, नया विश्वास और आशीर्वाद', 'Despair, lost faith', 'निराशा, विश्वास की कमी'],
    ['The Moon', 'चंद्रमा', '🌕', 'Illusion, dreams, trust your intuition', 'भ्रम, सपने — अंतर्ज्ञान पर भरोसा करें', 'Clarity returning, released fear', 'स्पष्टता लौटना, डर दूर'],
    ['The Sun', 'सूर्य', '☀️', 'Joy, success, positivity, vitality', 'आनंद, सफलता, सकारात्मकता, ऊर्जा', 'Temporary sadness, delays', 'अस्थायी उदासी, देरी'],
    ['Judgement', 'जागरण', '📯', 'Awakening, second chance, inner calling', 'जागृति, दूसरा मौका, भीतर की पुकार', 'Self-doubt, ignoring the call', 'आत्म-संदेह, पुकार अनसुनी'],
    ['The World', 'संसार', '🌍', 'Completion, achievement, travel, fulfilment', 'पूर्णता, उपलब्धि, यात्रा, संतोष', 'Incomplete goals, shortcuts', 'अधूरे लक्ष्य, शॉर्टकट']
  ];
  const SUITS = [
    { en: 'Wands', hi: 'दंड', sym: '🔥', area: ['career, passion and energy', 'करियर, जुनून और ऊर्जा'] },
    { en: 'Cups', hi: 'प्याले', sym: '🌊', area: ['love, emotions and relationships', 'प्रेम, भावनाएँ और रिश्ते'] },
    { en: 'Swords', hi: 'तलवारें', sym: '🗡️', area: ['thoughts, decisions and conflicts', 'विचार, निर्णय और टकराव'] },
    { en: 'Pentacles', hi: 'सिक्के', sym: '🪙', area: ['money, work and health', 'धन, काम और स्वास्थ्य'] }
  ];
  const RANKS = [
    ['Ace', 'इक्का', 'A fresh start in', 'की नई शुरुआत'], ['Two', 'दो', 'A choice or partnership in', 'में चुनाव या साझेदारी'], ['Three', 'तीन', 'Growth and teamwork in', 'में प्रगति और सहयोग'],
    ['Four', 'चार', 'Stability and rest in', 'में स्थिरता और विश्राम'], ['Five', 'पाँच', 'A challenge or test in', 'में चुनौती या परीक्षा'], ['Six', 'छह', 'Harmony and recovery in', 'में सामंजस्य और सुधार'],
    ['Seven', 'सात', 'Patience and assessment in', 'में धैर्य और आकलन'], ['Eight', 'आठ', 'Fast movement and effort in', 'में तेज़ी और परिश्रम'], ['Nine', 'नौ', 'Near-completion and reward in', 'में लगभग पूर्णता और फल'],
    ['Ten', 'दस', 'A full cycle completing in', 'में एक चक्र का पूरा होना'], ['Page', 'राजकुमार', 'Good news and learning in', 'में शुभ समाचार और सीख'], ['Knight', 'शूरवीर', 'Bold action in', 'में साहसी कदम'],
    ['Queen', 'रानी', 'Caring mastery in', 'में स्नेहपूर्ण निपुणता'], ['King', 'राजा', 'Authority and leadership in', 'में अधिकार और नेतृत्व']
  ];
  const DECK = MAJOR.map((c, i) => ({ id: i, major: true, en: c[0], hi: c[1], sym: c[2], up: [c[3], c[4]], rev: [c[5], c[6]], num: i }));
  SUITS.forEach((s, si) => RANKS.forEach((r, ri) => DECK.push({
    id: 22 + si * 14 + ri, major: false, suit: si, en: `${r[0]} of ${s.en}`, hi: `${s.hi} का ${r[1]}`, sym: s.sym, num: ri + 1,
    up: [`${r[2]} ${s.area[0]}.`, `${s.area[1]} ${r[3]}।`], rev: [`Delays or blocks around ${s.area[0]}.`, `${s.area[1]} में देरी या रुकावट।`]
  })));
  function seeded(seed) { let x = 0; for (const ch of String(seed)) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  function drawCards(n, seed) {
    const rnd = seed ? seeded(seed) : Math.random, ids = DECK.map(c => c.id);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    return ids.slice(0, n).map(id => Object.assign({}, DECK[id], { reversed: rnd() < 0.3 }));
  }

  /* ============ RASHIFAL by Chandra gochar (Moon transit house from Moon sign) ============ */
  const GOCHAR = [
    { good: 1, en: 'The Moon is in your own sign — mood is bright and you feel in control. Good day to start something personal and look after yourself.', hi: 'चंद्रमा आपकी ही राशि में है — मन प्रसन्न और आत्मविश्वास ऊँचा। कोई निजी काम शुरू करने और स्वयं का ध्यान रखने का अच्छा दिन।' },
    { good: 0, en: 'Watch your words and spending today. Family talks need patience; avoid lending money.', hi: 'आज वाणी और ख़र्च पर ध्यान रखें। परिवार में धैर्य से बात करें; उधार देने से बचें।' },
    { good: 1, en: 'Courage and energy are high! Short trips, calls and bold decisions go in your favour. Siblings support you.', hi: 'साहस और ऊर्जा ऊँची! छोटी यात्राएँ, फ़ोन कॉल और साहसी फ़ैसले आपके पक्ष में। भाई-बहन साथ देंगे।' },
    { good: 0, en: 'Mind may feel restless; spend calm time at home with mother or family. Avoid arguments over property.', hi: 'मन बेचैन रह सकता है; घर पर माँ या परिवार के साथ शांत समय बिताएँ। संपत्ति पर बहस से बचें।' },
    { good: 0, en: 'Think twice before big decisions. Children and studies need attention. Keep investments safe today.', hi: 'बड़े फ़ैसलों से पहले दोबारा सोचें। संतान और पढ़ाई पर ध्यान दें। आज निवेश सुरक्षित रखें।' },
    { good: 1, en: 'You win over obstacles and competitors today. Health improves, pending work gets done. Great day to clear debts.', hi: 'आज बाधाओं और विरोधियों पर विजय। स्वास्थ्य सुधरेगा, अटके काम बनेंगे। क़र्ज़ चुकाने का अच्छा दिन।' },
    { good: 1, en: 'Partnerships and relationships shine. Good for meetings, deals and quality time with your partner.', hi: 'साझेदारी और रिश्ते चमकेंगे। मीटिंग, सौदे और जीवनसाथी के साथ समय के लिए शुभ दिन।' },
    { good: 0, en: 'Chandrashtama day — go slow. Avoid risky travel, new ventures and heated talks. Prayer and rest help.', hi: 'चंद्राष्टम दिन — धीरे चलें। जोखिम भरी यात्रा, नए काम और गर्म बहस से बचें। प्रार्थना और आराम लाभदायक।' },
    { good: 0, en: 'Luck is mixed; respect elders and teachers. Spiritual activities and charity bring peace.', hi: 'भाग्य मिला-जुला; बड़ों और गुरुओं का सम्मान करें। पूजा-पाठ और दान से शांति मिलेगी।' },
    { good: 1, en: 'Career focus! Your work gets noticed. Good day for interviews, presentations and important tasks.', hi: 'करियर पर ध्यान! आपके काम की सराहना होगी। इंटरव्यू, प्रेज़ेंटेशन और ज़रूरी कामों के लिए शुभ।' },
    { good: 1, en: 'Gains and good news! Friends help, wishes get fulfilled. Excellent for networking and income.', hi: 'लाभ और शुभ समाचार! मित्र मदद करेंगे, इच्छाएँ पूरी होंगी। आमदनी और संपर्क बढ़ाने के लिए उत्तम।' },
    { good: 0, en: 'Expenses and fatigue possible. Get good sleep, avoid overspending; meditation and seva bring calm.', hi: 'ख़र्च और थकान संभव। अच्छी नींद लें, फ़िज़ूलख़र्ची से बचें; ध्यान और सेवा से शांति मिलेगी।' }
  ];
  const COLORS = [['Red', 'लाल'], ['White', 'सफ़ेद'], ['Green', 'हरा'], ['Yellow', 'पीला'], ['Orange', 'नारंगी'], ['Pink', 'गुलाबी'], ['Blue', 'नीला'], ['Purple', 'बैंगनी'], ['Gold', 'सुनहरा'], ['Sky Blue', 'आसमानी']];
  function rashifal(rashi, moonSignToday, dateKey) {
    const h = ((moonSignToday - rashi + 12) % 12), r = seeded(dateKey + ':' + rashi);
    const c = COLORS[Math.floor(r() * COLORS.length)], num = 1 + Math.floor(r() * 9), score = GOCHAR[h].good ? 3 + Math.round(r() * 2) : 2 + Math.round(r());
    return { house: h + 1, text: GOCHAR[h], color: c, number: num, stars: Math.min(5, score), love: 1 + Math.floor(r() * 5), money: 1 + Math.floor(r() * 5), health: 1 + Math.floor(r() * 5) };
  }

  /* ============ Interpretations ============ */
  const LAGNA_TXT = [
    ['Energetic, brave and a natural starter. You lead from the front.', 'ऊर्जावान, साहसी और पहल करने वाले। आप आगे बढ़कर नेतृत्व करते हैं।'],
    ['Calm, loyal and comfort-loving. You value stability and beauty.', 'शांत, वफ़ादार और सुख-प्रिय। स्थिरता और सुंदरता को महत्व देते हैं।'],
    ['Curious, talkative and clever. You learn fast and love variety.', 'जिज्ञासु, बातूनी और चतुर। जल्दी सीखते हैं और विविधता पसंद है।'],
    ['Caring, emotional and protective. Family is your strength.', 'स्नेही, भावुक और रक्षक। परिवार आपकी ताक़त है।'],
    ['Confident, generous and royal. You love respect and recognition.', 'आत्मविश्वासी, उदार और राजसी। सम्मान और पहचान पसंद है।'],
    ['Practical, detail-minded and helpful. You perfect whatever you touch.', 'व्यावहारिक, बारीकी से सोचने वाले और मददगार।'],
    ['Charming, fair and diplomatic. You create harmony around you.', 'आकर्षक, न्यायप्रिय और कूटनीतिक। आसपास सामंजस्य बनाते हैं।'],
    ['Intense, determined and secretive. You transform through challenges.', 'गहरे, दृढ़ और रहस्यमय। चुनौतियों से निखरते हैं।'],
    ['Optimistic, wise and freedom-loving. Dharma and learning guide you.', 'आशावादी, ज्ञानी और स्वतंत्रता-प्रिय। धर्म और ज्ञान आपका मार्गदर्शक।'],
    ['Disciplined, patient and ambitious. You climb steadily to the top.', 'अनुशासित, धैर्यवान और महत्वाकांक्षी। धीरे-धीरे शिखर तक पहुँचते हैं।'],
    ['Innovative, humanitarian and independent. You think ahead of time.', 'नवाचारी, मानवतावादी और स्वतंत्र। समय से आगे सोचते हैं।'],
    ['Compassionate, intuitive and spiritual. You feel deeply and heal others.', 'करुणामय, अंतर्ज्ञानी और आध्यात्मिक। गहराई से महसूस करते और दूसरों को सुकून देते हैं।']
  ];
  const DASHA_TXT = {
    Sun: ['Recognition, authority and father-related matters come to focus.', 'मान-सम्मान, अधिकार और पिता से जुड़े विषय प्रमुख।'],
    Moon: ['Emotions, home, mother and public connections are highlighted.', 'भावनाएँ, घर, माता और जनसंपर्क प्रमुख।'],
    Mars: ['Energy, property, courage and competition increase.', 'ऊर्जा, संपत्ति, साहस और प्रतिस्पर्धा बढ़ती है।'],
    Mercury: ['Learning, business, communication and friends grow.', 'शिक्षा, व्यापार, संवाद और मित्रता बढ़ती है।'],
    Jupiter: ['Wisdom, children, wealth and spiritual growth are blessed.', 'ज्ञान, संतान, धन और आध्यात्मिक उन्नति का आशीर्वाद।'],
    Venus: ['Love, luxury, marriage, art and comforts flourish.', 'प्रेम, विलासिता, विवाह, कला और सुख-सुविधाएँ बढ़ती हैं।'],
    Saturn: ['Hard work, discipline and slow but solid results.', 'कड़ी मेहनत, अनुशासन और धीमे पर पक्के परिणाम।'],
    Rahu: ['Ambition, foreign links, sudden changes and technology.', 'महत्वाकांक्षा, विदेश संबंध, अचानक बदलाव और तकनीक।'],
    Ketu: ['Detachment, spirituality, research and inner change.', 'वैराग्य, आध्यात्म, शोध और आंतरिक परिवर्तन।']
  };
  const GEM = { Sun: ['Ruby', 'माणिक्य'], Moon: ['Pearl', 'मोती'], Mars: ['Red Coral', 'मूंगा'], Mercury: ['Emerald', 'पन्ना'], Jupiter: ['Yellow Sapphire', 'पुखराज'], Venus: ['Diamond / Opal', 'हीरा / ओपल'], Saturn: ['Blue Sapphire', 'नीलम'] };
  const MANTRA = [
    ['Om Namah Shivaya', 'ॐ नमः शिवाय'], ['Om Gan Ganapataye Namah', 'ॐ गं गणपतये नमः'], ['Om Namo Bhagavate Vasudevaya', 'ॐ नमो भगवते वासुदेवाय'],
    ['Om Shreem Mahalakshmiyai Namah', 'ॐ श्रीं महालक्ष्म्यै नमः'], ['Om Hanumate Namah', 'ॐ हनुमते नमः'], ['Om Aim Saraswatyai Namah', 'ॐ ऐं सरस्वत्यै नमः'],
    ['Radhe Radhe — Shri Radha Krishna', 'राधे राधे — श्री राधा कृष्ण'], ['Om Suryaya Namah', 'ॐ सूर्याय नमः'], ['Om Shanaye Namah', 'ॐ शनये नमः'],
    ['Om Durgayai Namah', 'ॐ दुर्गायै नमः'], ['Om Namo Narayanaya', 'ॐ नमो नारायणाय'], ['Shri Ram Jai Ram Jai Jai Ram', 'श्री राम जय राम जय जय राम']
  ];

  return { dr, NUM, MISSING, numerology, nameNumber, numberCheck, DECK, SUITS, drawCards, seeded, GOCHAR, rashifal, COLORS, LAGNA_TXT, DASHA_TXT, GEM, MANTRA };
});
