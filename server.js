// Optional: run the whole website on any Node 18+ machine (your PC / own server).
//   cp .env.example .env   (fill values)   then:   node server.js
// Website: http://localhost:3000   Admin: http://localhost:3000/admin
// Not needed on Cloudflare Pages — Cloudflare serves /public and /functions directly.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handle } from './lib/handlers.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(ROOT, 'public');
try { fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/).forEach(l => { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }); } catch (e) {}
const TYPES = { '.html': 'text/html; charset=utf-8', '.ttf': 'font/ttf', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    const chunks = []; for await (const ch of req) chunks.push(ch);
    const request = new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'x').split(',')[0].trim();
    const out = await handle(request, process.env, { ip, country: null });
    res.writeHead(out.status, Object.fromEntries(out.headers));
    return res.end(Buffer.from(await out.arrayBuffer()));
  }
  let p = url.pathname === '/' ? '/index.html' : url.pathname;
  if (!path.extname(p)) p = fs.existsSync(path.join(PUB, p + '.html')) ? p + '.html' : '/index.html';
  const file = path.normalize(path.join(PUB, decodeURIComponent(p)));
  if (!file.startsWith(PUB + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end('Not found'); }
  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (file.endsWith('admin.html')) res.setHeader('X-Robots-Tag', 'noindex');
  fs.createReadStream(file).pipe(res);
}).listen(process.env.PORT || 3000, () => console.log('Astro-Shree on http://localhost:' + (process.env.PORT || 3000)));
