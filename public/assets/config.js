// Where the backend lives. On your own computer (node server.js) it is the same site;
// everywhere else (GitHub Pages, astro-shree.com) it is the Supabase Edge Function "astro-api".
window.AS_API = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? '' : 'https://ibrlngakmbqconakhqyt.supabase.co/functions/v1/astro-api';
