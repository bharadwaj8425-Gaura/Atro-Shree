# ॐ Astro-Shree — Kundli · Numerology · Tarot · Divine Games

Website of **Manasvi Bharadwaj** — https://astro-shree.com

## What's inside

| Free for everyone | Paid bookings (UPI) |
|---|---|
| 🪐 Janam Kundli: Lagna + Navamsa chart, planets, Vimshottari dasha, Manglik | 🙏 Ek Prashn ₹51 · 💞 Kundli Milan ₹101 · 📜 Kundli report ₹151 · 📞 1:1 call ₹251 |
| 💞 Kundli Milan: 36 gun Ashtakoota, Nadi / Bhakoot / Manglik check | 🔢 Name number ₹51 · Numerology report ₹151 · Baby/Business name ₹251 |
| 📅 Panchang: tithi, nakshatra, yoga, karana, Rahu kaal, Abhijit, sunrise | 🃏 Tarot 1-question ₹51 · Celtic Cross ₹151 · Live tarot ₹251 |
| ♈ Rashifal from the real Moon transit (Chandra gochar) | 👑 Sampoorna Jeevan Darshan ₹501 (all three + 30 min call) |
| 🔢 Numerology: Mulank, Bhagyank, name number, Lo Shu grid, mobile number check | |
| 🃏 Tarot: card of the day, 3-card spread, Yes/No | |
| 🎮 14 daily games with streaks, badges, punya points and sharing | |
| 🤖 Shree AI (Gemini) — reads the visitor's kundli | |
| 👨‍👩‍👧 Family Kundli Vault — birthdays & next-dasha alerts | |
| 🌐 Hindi / English toggle on every page | |

**Admin** (`/admin`): bookings with payment screenshots (approve / reject / mark delivered / WhatsApp the customer), leads, activity, reviews, CSV export.

Accuracy: planet positions use [astronomy-engine](https://github.com/cosinekitty/astronomy) (MIT) with Lahiri ayanamsa; checked against Swiss Ephemeris — max difference ≈ 20 arc-seconds. Run `npm test`.

## How payments work (same system as the Resume Builder)
1. Customer picks a service → fills details → sees a UPI QR with the **exact amount** (or taps "Open UPI app" on mobile).
2. Customer pastes the **UTR** and uploads the **screenshot**.
3. Gemini reads the screenshot: amount, payee, UTR, date, success status, signs of editing. All OK → booking **auto-confirmed**; anything off → **pending**.
4. You get a WhatsApp alert (optional) with one-tap ✓ Approve / ✕ Reject links, or approve in `/admin`.
5. Always cross-check your UPI app before delivering.

## Go live on Cloudflare Pages (free) — ≈10 min
Database tables (`astro_events`, `astro_payments`, `astro_reviews`) are already created in the Supabase project.

1. dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git** → choose `Atro-Shree`.
2. Build settings: Framework **None** · Build command *(empty)* · Output directory **`public`**.
3. **Settings → Variables and Secrets** → add (as *Secret*) the values from `.env.example`:
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `GEMINI_API_KEY`, `UPI_ID`, `UPI_NAME`, `UPI_PAYEE_NAME`.
   You can reuse the same Supabase and Gemini keys as the Resume Builder.
4. **Deploy** → site opens at `astro-shree.pages.dev`. Test a booking, then open `/admin`.
5. **Domain:** Custom domains → **Set up a domain** → `astro-shree.com` → follow Cloudflare's steps.
   Cloudflare will show 2 nameservers — put them in **GoDaddy → My Domains → astro-shree.com → DNS → Nameservers → Change → "I'll use my own nameservers"**.
   (Today the domain points to an old Netlify account; this step moves it to the new site. It can take a few hours.)
6. After changing any variable: **Deployments → Retry deployment**.

**Change prices without code:** add variable `PRICES`, e.g. `prashn=51,call=301`.
**WhatsApp alert on each booking (optional, free):** follow the WhatsApp setup on callmebot.com (you message their bot once and get an API key), then put the key into `CALLMEBOT_APIKEY`.

## Run on your computer
```
cp .env.example .env   # fill values
node server.js          # http://localhost:3000  ·  admin: /admin
npm test                # engine accuracy tests
```

## Files
- `public/` — the website (index.html, admin.html, assets/, images/)
- `public/assets/jyotish.js` — Kundli / dasha / panchang / gun-milan engine
- `public/assets/content.js` — numerology, tarot (78 cards), rashifal & interpretations (EN + HI)
- `lib/handlers.js` — backend API (`/api/config, log, chat, pay, reviews, admin, quick`)
- `functions/api/[[path]].js` — Cloudflare Pages Function entry
- `supabase/astro_shree_tables.sql` — database tables (already applied)
