'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { create } = require('./registry');

const PUBLIC = path.join(__dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

function createServer({ token = process.env.COCKPIT_TOKEN || '', registry = create() } = {}) {
  const commonHeaders = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
  const send = (res, status, body) => {
    res.writeHead(status, { ...commonHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };
  const readBody = (req) => new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (ch) => { data += ch; if (data.length > 1e5) { reject(new Error('too large')); req.destroy(); } });
    req.on('error', reject);
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
  });
  const reply = (res, r) => (r.error ? send(res, r.status, { error: r.error }) : send(res, 200, r));

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const p = url.pathname;
    if (p === '/healthz') return send(res, 200, { status: 'ok' });

    if (p.startsWith('/api/')) {
      if (token && req.headers.authorization !== 'Bearer ' + token) return send(res, 401, { error: 'unauthorized' });
      try {
        const m = req.method;
        if (m === 'GET' && p === '/api/summary') return send(res, 200, registry.summary());
        if (m === 'GET' && p === '/api/events') return send(res, 200, registry.events());
        if (m === 'GET' && p === '/api/components') return send(res, 200, registry.list());

        let g;
        if (m === 'POST' && (g = p.match(/^\/api\/actions\/(start|stop|restart)-all$/))) return send(res, 200, registry.bulk(g[1]));
        g = p.match(/^\/api\/components\/([\w-]+)$/);
        if (m === 'GET' && g) { const c = registry.one(g[1]); return c ? send(res, 200, c) : send(res, 404, { error: 'not_found' }); }
        g = p.match(/^\/api\/components\/([\w-]+)\/(start|stop|restart)$/);
        if (m === 'POST' && g) return reply(res, registry.action(g[1], g[2]));
        g = p.match(/^\/api\/components\/([\w-]+)\/config$/);
        if (m === 'PUT' && g) return reply(res, registry.configure(g[1], await readBody(req)));
        return send(res, 404, { error: 'not_found' });
      } catch (e) {
        return send(res, 400, { error: 'invalid request' });
      }
    }

    if (req.method !== 'GET') return send(res, 405, { error: 'method not allowed' });
    const rel = p === '/' ? 'index.html' : p.slice(1);
    const file = path.join(PUBLIC, rel);
    if (!file.startsWith(PUBLIC + path.sep)) return send(res, 403, { error: 'forbidden' });
    fs.readFile(file, (err, buf) => {
      if (err) return send(res, 404, { error: 'not_found' });
      res.writeHead(200, { ...commonHeaders, 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(buf);
    });
  });
  const timer = setInterval(registry.tick, 3000);
  timer.unref();
  server.on('close', () => clearInterval(timer));
  return server;
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 8080;
  createServer().listen(port, () => console.log(`Cockpit listening on http://localhost:${port}`));
}

module.exports = { createServer };
