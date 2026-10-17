'use strict';
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let components = [];
let editing = null;

async function api(path, method = 'GET', body) {
  const token = $('#token').value;
  const res = await fetch(path, {
    method, body: body && JSON.stringify(body),
    headers: token ? { Authorization: 'Bearer ' + token } : {},
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}
function toast(msg, err) {
  const t = $('#toast');
  t.textContent = msg; t.className = 'show' + (err ? ' err' : '');
  setTimeout(() => { t.className = ''; }, 2500);
}
const fmtUp = (s) => (s >= 3600 ? Math.floor(s / 3600) + 'h ' : '') + Math.floor((s % 3600) / 60) + 'm ' + (s % 60) + 's';
const bar = (label, v) => `<div class="lbl"><span>${label}</span><span>${Math.round(v)}%</span></div><div class="bar ${v > 80 ? 'hot' : ''}"><i style="width:${v}%"></i></div>`;

function renderSummary(s) {
  const card = (cls, n, l) => `<div class="card ${cls}"><b>${n}</b><span>${l}</span></div>`;
  $('#summary').innerHTML = card('', s.total, 'Components') + card('ok', s.running, 'Running') + card('bad', s.stopped, 'Stopped') +
    card('ok', s.healthy, 'Healthy') + card('warn', s.degraded, 'Degraded');
}
function renderComponents() {
  const q = $('#filter').value.toLowerCase();
  $('#components').innerHTML = components.filter((c) => (c.name + c.pillar).toLowerCase().includes(q)).map((c) => `
    <article class="comp">
      <header><div><h3>${esc(c.name)}</h3><div class="pillar">${esc(c.pillar)} · v${esc(c.version)}</div></div>
        <span class="badge ${c.health}">${c.state === 'running' ? c.health : 'stopped'}</span></header>
      <div class="meta"><span>Replicas ${c.replicas.ready}/${c.replicas.desired}</span><span>Restarts ${c.restarts}</span><span>Up ${c.state === 'running' ? fmtUp(c.uptimeSeconds) : '–'}</span></div>
      ${bar('CPU', c.cpu)}${bar('Memory', c.memory)}
      <div class="actions">
        <button data-act="start" data-id="${esc(c.id)}" ${c.state === 'running' ? 'disabled' : ''}>Start</button>
        <button data-act="stop" data-id="${esc(c.id)}" class="danger" ${c.state === 'stopped' ? 'disabled' : ''}>Stop</button>
        <button data-act="restart" data-id="${esc(c.id)}">Restart</button>
        <button data-act="config" data-id="${esc(c.id)}" class="ghost">Configure</button>
      </div>
    </article>`).join('');
}
async function refresh() {
  try {
    const [s, c, e] = await Promise.all([api('/api/summary'), api('/api/components'), api('/api/events')]);
    components = c; renderSummary(s); renderComponents();
    $('#events').innerHTML = e.slice(0, 30).map((x) => `<li><time>${esc(x.ts.slice(11, 19))}</time>${esc(x.message)}</li>`).join('');
  } catch (err) { toast(err.message, true); }
}
function openConfig(id) {
  const c = components.find((x) => x.id === id);
  editing = c;
  $('#cfgTitle').textContent = 'Configure ' + c.name;
  const fields = { replicas: c.replicas.desired, ...c.config };
  $('#cfgFields').innerHTML = Object.entries(fields).map(([k, v]) => {
    const t = typeof v;
    const input = t === 'boolean' ? `<input type="checkbox" name="${esc(k)}" data-t="boolean" ${v ? 'checked' : ''}>`
      : `<input name="${esc(k)}" data-t="${t}" type="${t === 'number' ? 'number' : 'text'}" step="any" value="${esc(v)}">`;
    return `<label>${esc(k)}${input}</label>`;
  }).join('');
  $('#cfg').showModal();
}
async function saveConfig() {
  const patch = {};
  document.querySelectorAll('#cfgFields input').forEach((i) => {
    const t = i.dataset.t;
    patch[i.name] = t === 'boolean' ? i.checked : t === 'number' ? Number(i.value) : i.value;
  });
  try { await api(`/api/components/${editing.id}/config`, 'PUT', patch); toast('Configuration applied'); } catch (e) { toast(e.message, true); }
  refresh();
}
document.addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.bulk) {
    if (b.dataset.bulk === 'stop' && !confirm('Stop ALL components?')) return;
    try { await api(`/api/actions/${b.dataset.bulk}-all`, 'POST'); toast(`${b.dataset.bulk} all done`); } catch (x) { toast(x.message, true); }
    return refresh();
  }
  if (b.dataset.act === 'config') return openConfig(b.dataset.id);
  if (b.dataset.act) {
    try { await api(`/api/components/${b.dataset.id}/${b.dataset.act}`, 'POST'); toast(`${b.dataset.act} ok`); } catch (x) { toast(x.message, true); }
    refresh();
  }
});
$('#cfg').addEventListener('close', () => { if ($('#cfg').returnValue === 'save') saveConfig(); $('#cfg').returnValue = ''; });
$('#filter').addEventListener('input', renderComponents);
refresh();
setInterval(refresh, 5000);
