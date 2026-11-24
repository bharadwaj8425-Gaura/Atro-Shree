/* Astro-Shree — easy date picker.
   Every <input type="date"> becomes a button: tap → pick Year → Month → Day (no long scrolling),
   or type DD/MM/YYYY. The original input stays (hidden) with the same id and a YYYY-MM-DD value,
   so the rest of the site reads it exactly as before. */
(function () {
  'use strict';
  const MON = { en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'] };
  const WK = { en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], hi: ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'] };
  const hi = () => (window.App && App.lang) === 'hi';
  const tr = (en, h) => (hi() ? h : en);
  const mon = i => (hi() ? MON.hi : MON.en)[i];
  const pad = n => String(n).padStart(2, '0');
  const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const dim = (y, m) => new Date(y, m + 1, 0).getDate();
  const parse = v => { const k = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return k ? { y: +k[1], m: +k[2] - 1, d: +k[3] } : null; };
  const pretty = v => { const p = parse(v); return p ? `${p.d} ${mon(p.m)} ${p.y}` : ''; };
  const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');

  function enhance(inp) {
    if (inp.dataset.dp) return; inp.dataset.dp = '1';
    const box = inp.closest('div'), label = box && box.querySelector('label');
    const isDob = inp.id !== 'pDate'; // every date on the site is a birth date except the Panchang day
    const min = inp.min, max = inp.max;
    inp.type = 'text'; inp.hidden = true; inp.setAttribute('aria-hidden', 'true');
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'inp dp-btn';
    if (inp.getAttribute('style')) btn.setAttribute('style', inp.getAttribute('style'));
    inp.insertAdjacentElement('afterend', btn);
    const paint = () => { const v = desc.get.call(inp); btn.innerHTML = (v ? `<span>${pretty(v)}</span>` : `<span class="dp-ph">${tr('Tap to choose date', 'तारीख चुनें')}</span>`) + '<span class="dp-ic" aria-hidden="true">📅</span>'; btn.setAttribute('aria-label', (label ? label.textContent.replace('*', '').trim() + ': ' : '') + (pretty(v) || tr('choose date', 'तारीख चुनें'))); };
    Object.defineProperty(inp, 'value', { configurable: true, get() { return desc.get.call(this); }, set(v) { desc.set.call(this, v); paint(); } });
    inp.focus = () => btn.focus();
    paint();
    btn.addEventListener('click', () => open({ value: desc.get.call(inp), isDob, min, max, title: label ? label.textContent.replace('*', '').trim() : tr('Choose date', 'तारीख चुनें') }, v => {
      inp.value = v; inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true }));
    }));
  }

  function open(o, done) {
    const today = new Date(), ty = today.getFullYear();
    const maxP = parse(o.max) || (o.isDob ? { y: ty, m: today.getMonth(), d: today.getDate() } : { y: 2100, m: 11, d: 31 });
    const minP = parse(o.min) || { y: 1900, m: 0, d: 1 };
    const cur = parse(o.value);
    let y = cur ? cur.y : null, m = cur ? cur.m : null, d = cur ? cur.d : null;
    if (!cur && !o.isDob) { y = ty; m = today.getMonth(); }
    let view = cur || !o.isDob ? 'day' : 'year';
    const pageStart = () => (y ? y - 5 : 1990); // 12 years per page, chosen year in the middle
    let decade = pageStart();
    const ok = (yy, mm, dd) => { const v = iso(yy, mm, dd); return v >= iso(minP.y, minP.m, minP.d) && v <= iso(maxP.y, maxP.m, maxP.d); };

    const bg = document.createElement('div'); bg.className = 'modal-bg dp-bg';
    bg.innerHTML = `<div class="dp" role="dialog" aria-modal="true" aria-label="${o.title}"><div class="dp-top"><b>${o.title}</b><button class="dp-x" aria-label="Close">✕</button></div>
      <div class="dp-chips"><button data-v="day" class="dp-chip"></button><button data-v="month" class="dp-chip"></button><button data-v="year" class="dp-chip"></button></div>
      <input class="inp dp-type" inputmode="numeric" autocomplete="off" maxlength="10" placeholder="${tr('or type DD/MM/YYYY', 'या लिखें DD/MM/YYYY')}">
      <div class="dp-body"></div></div>`;
    document.body.appendChild(bg);
    const $ = s => bg.querySelector(s), body = $('.dp-body'), typed = $('.dp-type');
    const close = () => { bg.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    bg.addEventListener('click', e => { if (e.target === bg) close(); });
    $('.dp-x').onclick = close;
    const finish = () => { done(iso(y, m, d)); close(); };

    function chips() {
      const c = bg.querySelectorAll('.dp-chip');
      c[0].textContent = d ? d : tr('Day', 'दिन'); c[1].textContent = m != null ? mon(m) : tr('Month', 'महीना'); c[2].textContent = y || tr('Year', 'वर्ष');
      c.forEach(b => { b.classList.toggle('on', b.dataset.v === view); b.disabled = (b.dataset.v === 'day' && (y == null || m == null)) || (b.dataset.v === 'month' && y == null); });
    }
    function render() {
      chips();
      if (view === 'year') {
        const ys = []; for (let i = 0; i < 12; i++) ys.push(decade + i);
        body.innerHTML = `<div class="dp-nav"><button data-n="-1" aria-label="Earlier years">◀</button><span>${decade} – ${decade + 11}</span><button data-n="1" aria-label="Later years">▶</button></div>
          <div class="dp-grid g3">${ys.map(v => `<button data-y="${v}" class="${v === y ? 'sel' : ''} ${v === ty ? 'now' : ''}" ${v < minP.y || v > maxP.y ? 'disabled' : ''}>${v}</button>`).join('')}</div>
          <div class="tiny muted center" style="margin-top:6px">${tr('Tip: ◀ ▶ jump 12 years', 'सुझाव: ◀ ▶ से 12 साल आगे-पीछे')}</div>`;
        body.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { decade += 12 * +b.dataset.n; render(); });
        body.querySelectorAll('[data-y]').forEach(b => b.onclick = () => { y = +b.dataset.y; if (d && m != null && !ok(y, m, Math.min(d, dim(y, m)))) { m = null; d = null; } view = 'month'; render(); });
        const nav = body.querySelectorAll('[data-n]'); nav[0].disabled = decade <= minP.y; nav[1].disabled = decade + 11 >= maxP.y;
      } else if (view === 'month') {
        body.innerHTML = `<div class="dp-nav"><span style="margin:auto">${y}</span></div><div class="dp-grid g3">${[...Array(12)].map((_, i) => `<button data-m="${i}" class="${i === m ? 'sel' : ''}" ${!ok(y, i, 1) && !ok(y, i, dim(y, i)) ? 'disabled' : ''}>${mon(i)}</button>`).join('')}</div>`;
        body.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { m = +b.dataset.m; if (d) d = Math.min(d, dim(y, m)); view = 'day'; render(); });
      } else {
        const first = new Date(y, m, 1).getDay(), n = dim(y, m);
        let cells = ''; for (let i = 0; i < first; i++) cells += '<span></span>';
        for (let i = 1; i <= n; i++) cells += `<button data-d="${i}" class="${i === d ? 'sel' : ''} ${y === ty && m === today.getMonth() && i === today.getDate() ? 'now' : ''}" ${ok(y, m, i) ? '' : 'disabled'}>${i}</button>`;
        body.innerHTML = `<div class="dp-nav"><button data-mm="-1" aria-label="Previous month">◀</button><span>${mon(m)} ${y}</span><button data-mm="1" aria-label="Next month">▶</button></div>
          <div class="dp-grid g7 dp-wk">${(hi() ? WK.hi : WK.en).map(w => `<span>${w}</span>`).join('')}</div><div class="dp-grid g7">${cells}</div>
          ${!o.isDob ? `<button class="dp-today">${tr('Today', 'आज')}</button>` : ''}`;
        body.querySelectorAll('[data-mm]').forEach(b => b.onclick = () => { m += +b.dataset.mm; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } if (d) d = Math.min(d, dim(y, m)); render(); });
        body.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { d = +b.dataset.d; finish(); });
        const t = body.querySelector('.dp-today'); if (t) t.onclick = () => { y = ty; m = today.getMonth(); d = today.getDate(); finish(); };
      }
    }
    bg.querySelectorAll('.dp-chip').forEach(b => b.onclick = () => { view = b.dataset.v; if (view === 'year') decade = pageStart(); render(); });
    typed.addEventListener('input', () => {
      let v = typed.value.replace(/\D/g, '').slice(0, 8);
      typed.value = v.length > 4 ? `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}` : v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v;
      typed.classList.remove('bad');
      if (v.length === 8) {
        const dd = +v.slice(0, 2), mm = +v.slice(2, 4) - 1, yy = +v.slice(4);
        if (mm >= 0 && mm < 12 && dd >= 1 && dd <= dim(yy, mm) && ok(yy, mm, dd)) { y = yy; m = mm; d = dd; finish(); }
        else typed.classList.add('bad');
      }
    });
    render();
  }

  const scan = root => { (root.querySelectorAll ? root : document).querySelectorAll('input[type="date"]').forEach(enhance); };
  new MutationObserver(ms => ms.forEach(mu => mu.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.matches && n.matches('input[type="date"]')) enhance(n); else scan(n); } }))).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scan(document)); else scan(document);
  window.ASDatePick = { enhance, open };
})();
