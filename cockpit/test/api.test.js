'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { createServer } = require('../server');

async function start(opts) {
  const server = createServer(opts);
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  return { server, base };
}
const j = (base, p, method = 'GET', body, headers = {}) =>
  fetch(base + p, { method, body: body && JSON.stringify(body), headers }).then(async (r) => ({ status: r.status, body: await r.json() }));

test('lifecycle, config and summary', async () => {
  const { server, base } = await start();
  try {
    assert.strictEqual((await j(base, '/healthz')).body.status, 'ok');
    const list = (await j(base, '/api/components')).body;
    assert.ok(list.length > 5);
    assert.strictEqual((await j(base, '/api/components/gateway/stop', 'POST')).body.component.state, 'stopped');
    assert.strictEqual((await j(base, '/api/components/gateway/stop', 'POST')).status, 409);
    assert.strictEqual((await j(base, '/api/components/gateway/start', 'POST')).body.component.state, 'running');
    assert.strictEqual((await j(base, '/api/components/gateway/restart', 'POST')).body.component.restarts, 1);
    assert.strictEqual((await j(base, '/api/components/nope/start', 'POST')).status, 404);
    const cfg = await j(base, '/api/components/gateway/config', 'PUT', { rate_limit_rpm: 10, replicas: 5 });
    assert.strictEqual(cfg.body.component.config.rate_limit_rpm, 10);
    assert.strictEqual(cfg.body.component.replicas.desired, 5);
    assert.strictEqual((await j(base, '/api/components/gateway/config', 'PUT', { bogus: 1 })).status, 400);
    assert.strictEqual((await j(base, '/api/components/gateway/config', 'PUT', { rate_limit_rpm: 'x' })).status, 400);
    await j(base, '/api/actions/stop-all', 'POST');
    assert.strictEqual((await j(base, '/api/summary')).body.running, 0);
    assert.ok((await j(base, '/api/events')).body.length > 0);
  } finally { server.close(); }
});

test('token protects the API', async () => {
  const { server, base } = await start({ token: 's3cret' });
  try {
    assert.strictEqual((await j(base, '/api/components')).status, 401);
    assert.strictEqual((await j(base, '/api/components', 'GET', undefined, { Authorization: 'Bearer ' + 's3cret' })).status, 200);
    assert.strictEqual((await j(base, '/healthz')).status, 200);
  } finally { server.close(); }
});
