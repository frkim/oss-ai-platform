'use strict';
// In-memory component registry. Replace the adapters (start/stop/health) with calls to
// Kubernetes, Argo CD or each tool's admin API to drive real components.

const SEED = [
  ['gateway', 'LiteLLM', 'P02 AI gateway', '1.5', 3, { rate_limit_rpm: 6000, fallback_enabled: true, default_model: 'gpt-oss-120b' }],
  ['serving', 'vLLM', 'P03 Model serving', '0.8', 4, { max_model_len: 32768, gpu_memory_utilization: 0.9, tensor_parallel: 2 }],
  ['registry', 'MLflow', 'P04 Model lifecycle', '3.1', 2, { artifact_root: 's3://models', retention_days: 90 }],
  ['vectors', 'Qdrant', 'P05 Knowledge', '1.14', 3, { hnsw_m: 16, replication_factor: 2 }],
  ['agents', 'MCP gateway', 'P06 Agents', '0.9', 2, { tool_timeout_s: 30, human_approval: true }],
  ['telemetry', 'OpenTelemetry Collector', 'P07 Observability', '0.120', 2, { sampling_ratio: 0.25, genai_semconv: true }],
  ['evals', 'Promptfoo', 'P08 Evaluation', '0.100', 1, { gate_threshold: 0.85, schedule: 'nightly' }],
  ['guardrails', 'NeMo Guardrails', 'P09 Security', '0.12', 2, { block_pii: true, jailbreak_filter: true }],
  ['policy', 'OPA', 'P10 Governance', '1.4', 2, { decision_log: true, bundle_poll_s: 60 }],
  ['finops', 'OpenCost', 'P10 FinOps', '1.113', 1, { gpu_hour_price_eur: 2.5, report_interval: 'daily' }],
  ['portal', 'Backstage', 'P13 Platform experience', '1.40', 2, { catalog_refresh_s: 300 }],
];

function create(seed = SEED) {
  const now = () => new Date().toISOString();
  const events = [];
  const components = new Map();
  const log = (id, level, message) => {
    events.unshift({ ts: now(), component: id, level, message });
    if (events.length > 200) events.pop();
  };
  for (const [id, name, pillar, version, replicas, config] of seed) {
    components.set(id, {
      id, name, pillar, version, desiredReplicas: replicas, config: { ...config },
      state: 'running', startedAt: Date.now(), restarts: 0, cpu: 20 + (replicas * 7) % 40, memory: 30 + (replicas * 11) % 45,
    });
  }

  const view = (c) => {
    const running = c.state === 'running';
    const health = !running ? 'unknown' : c.cpu > 90 || c.memory > 90 ? 'degraded' : 'healthy';
    return {
      id: c.id, name: c.name, pillar: c.pillar, version: c.version, state: c.state, health,
      replicas: { desired: c.desiredReplicas, ready: running ? c.desiredReplicas : 0 },
      restarts: c.restarts, uptimeSeconds: running ? Math.floor((Date.now() - c.startedAt) / 1000) : 0,
      cpu: running ? c.cpu : 0, memory: running ? c.memory : 0, config: c.config,
    };
  };

  const get = (id) => components.get(id);
  const list = () => [...components.values()].map(view);
  const one = (id) => (get(id) ? view(get(id)) : null);

  function action(id, name) {
    const c = get(id);
    if (!c) return { error: 'not_found', status: 404 };
    if (name === 'start') {
      if (c.state === 'running') return { error: 'already running', status: 409 };
      c.state = 'running'; c.startedAt = Date.now();
    } else if (name === 'stop') {
      if (c.state === 'stopped') return { error: 'already stopped', status: 409 };
      c.state = 'stopped';
    } else if (name === 'restart') {
      c.state = 'running'; c.startedAt = Date.now(); c.restarts += 1;
    } else return { error: 'unknown action', status: 400 };
    log(id, 'info', `${name} requested for ${c.name}`);
    return { component: view(c) };
  }

  function configure(id, patch) {
    const c = get(id);
    if (!c) return { error: 'not_found', status: 404 };
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { error: 'body must be an object', status: 400 };
    for (const [k, v] of Object.entries(patch)) {
      if (k === 'replicas') {
        if (!Number.isInteger(v) || v < 0 || v > 100) return { error: 'replicas must be an integer 0-100', status: 400 };
        continue;
      }
      if (!Object.prototype.hasOwnProperty.call(c.config, k)) return { error: `unknown parameter: ${k}`, status: 400 };
      if (typeof v !== typeof c.config[k]) return { error: `parameter ${k} must be of type ${typeof c.config[k]}`, status: 400 };
    }
    for (const [k, v] of Object.entries(patch)) {
      if (k === 'replicas') c.desiredReplicas = v; else c.config[k] = v;
    }
    log(id, 'info', `configuration updated: ${Object.keys(patch).join(', ')}`);
    return { component: view(c) };
  }

  function bulk(name) {
    for (const id of components.keys()) {
      const c = get(id);
      if ((name === 'start' && c.state === 'stopped') || (name === 'stop' && c.state === 'running') || name === 'restart') action(id, name);
    }
    return list();
  }

  function summary() {
    const l = list();
    return {
      total: l.length,
      running: l.filter((c) => c.state === 'running').length,
      stopped: l.filter((c) => c.state === 'stopped').length,
      healthy: l.filter((c) => c.health === 'healthy').length,
      degraded: l.filter((c) => c.health === 'degraded').length,
    };
  }

  // Simulated live metrics drift.
  function tick() {
    for (const c of components.values()) {
      if (c.state !== 'running') continue;
      const d = () => Math.round((Math.random() - 0.5) * 10);
      c.cpu = Math.min(100, Math.max(5, c.cpu + d()));
      c.memory = Math.min(100, Math.max(10, c.memory + d() / 2));
    }
  }

  return { list, one, action, configure, bulk, summary, tick, events: () => events };
}

module.exports = { create };
