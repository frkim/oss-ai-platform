'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const http = require('node:http');

const root = path.resolve(__dirname, '..');
const powershell = process.platform === 'win32' ? 'powershell.exe' : 'pwsh';
const available = !spawnSync(powershell, ['-NoProfile', '-Command', 'exit 0']).error;
const psTest = (name, fn) => test(name, { skip: !available && 'PowerShell is not installed' }, fn);
const bootstrap = `
$ErrorActionPreference = 'Stop'
function Record-Call($Call) {
    $Call | ConvertTo-Json -Compress -Depth 10 | Add-Content -LiteralPath $env:TEST_CALLS
}
function docker {
    $global:LASTEXITCODE = 0
    Record-Call @{ kind = 'docker'; arguments = @($args) }
    if ($args[0] -eq 'compose' -and $args[1] -eq 'version') {
        $env:TEST_COMPOSE_VERSION
    } elseif ($args[0] -eq 'info') {
        $env:TEST_DOCKER_OS
    } elseif ($env:TEST_FAIL_OPERATION -and $args -contains $env:TEST_FAIL_OPERATION) {
        $global:LASTEXITCODE = 1
    }
}
function Invoke-WebRequest {
    param($Uri, [switch]$UseBasicParsing, $TimeoutSec)
    Record-Call @{ kind = 'ready'; uri = $Uri; timeout = $TimeoutSec }
    if ($env:TEST_HTTP_FAIL) { throw 'service unavailable' }
}
function Invoke-RestMethod {
    param($Uri, $Method, $ContentType, $Body, $TimeoutSec, $Headers)
    Record-Call @{ kind = 'http'; uri = $Uri; method = $Method; body = ($Body | ConvertFrom-Json); headers = $Headers }
    if ($env:TEST_PULL_ERROR) { return @{ error = 'model not found' } }
    return @{ status = 'success' }
}
function Start-Sleep { param($Seconds) }
function Read-Host { param($Prompt) $env:TEST_CONFIRM }
& (Join-Path $env:TEST_PACKAGE 'deploy.ps1') $env:TEST_COMMAND
exit $LASTEXITCODE
`;

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'oss windows-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(root, dir, { recursive: true, filter: (source) => !['test', '.env'].includes(path.basename(source)) });
  const wrapper = path.join(dir, 'mock.ps1');
  const calls = path.join(dir, 'calls.jsonl');
  fs.writeFileSync(wrapper, bootstrap);
  return {
    dir,
    run(command, env = {}) {
      fs.writeFileSync(calls, '');
      const result = spawnSync(powershell, ['-NoProfile', '-File', wrapper], {
        cwd: os.tmpdir(),
        encoding: 'utf8',
        env: {
          ...process.env,
          TEST_PACKAGE: dir, TEST_COMMAND: command, TEST_CALLS: calls,
          TEST_COMPOSE_VERSION: '2.38.2', TEST_DOCKER_OS: 'linux',
          TEST_FAIL_OPERATION: '', TEST_HTTP_FAIL: '', TEST_PULL_ERROR: '', TEST_CONFIRM: '',
          ...env
        }
      });
      return {
        ...result,
        calls: fs.readFileSync(calls, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line.replace(/^\uFEFF/, '')))
      };
    }
  };
}

function success(result) {
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
}

function composeCalls(result) {
  return result.calls.filter((c) => c.kind === 'docker' && c.arguments.includes('-f'));
}

psTest('up creates secrets, uses the Windows override, pulls models and checks readiness', (t) => {
  const f = fixture(t);
  const result = f.run('up');
  success(result);
  const env = fs.readFileSync(path.join(f.dir, '.env'), 'utf8');
  assert.ok(!env.startsWith('\uFEFF'));
  for (const key of ['POSTGRES_PASSWORD', 'LITELLM_MASTER_KEY', 'WEBUI_SECRET_KEY', 'LANGFUSE_NEXTAUTH_SECRET',
    'LANGFUSE_SALT', 'LANGFUSE_PUBLIC_KEY', 'LANGFUSE_SECRET_KEY', 'LANGFUSE_ADMIN_PASSWORD']) {
    assert.match(env, new RegExp(`^${key}=(?:sk-|pk-lf-|sk-lf-)?[a-f0-9]{16,32}$`, 'm'));
  }
  const compose = composeCalls(result);
  assert.strictEqual(compose.length, 2);
  for (const call of compose) {
    assert.deepStrictEqual(call.arguments.slice(0, 7), [
      'compose', '--env-file', '.env', '-f', 'docker-compose.yml', '-f', 'docker-compose.windows.yml'
    ]);
    assert.ok(!call.arguments.includes('ollama'));
  }
  assert.deepStrictEqual(compose[0].arguments.slice(7), ['up', '-d']);
  assert.ok(compose[1].arguments.includes('http://host.docker.internal:11434/api/tags'));
  assert.deepStrictEqual(result.calls.filter((c) => c.kind === 'http').map((c) => c.body), [
    { name: 'llama3.2:3b', stream: false }, { name: 'nomic-embed-text', stream: false }
  ]);
  assert.deepStrictEqual(result.calls.filter((c) => c.kind === 'ready').map((c) => c.uri), [
    'http://localhost:11434/api/tags', 'http://localhost:4000/health/liveliness',
    'http://localhost:6333/readyz', 'http://localhost:3000'
  ]);
  assert.match(result.stdout, /native Windows Ollama/);
});

psTest('status preserves existing secrets, fills missing secrets and handles CRLF', (t) => {
  const f = fixture(t);
  const envPath = path.join(f.dir, '.env');
  const original = fs.readFileSync(path.join(f.dir, '.env.example'), 'utf8')
    .replace('POSTGRES_PASSWORD=', 'POSTGRES_PASSWORD=keep-existing-password')
    .replace('LANGFUSE_SALT=\n', '').replace(/\r?\n/g, '\r\n');
  fs.writeFileSync(envPath, original);
  success(f.run('status'));
  const first = fs.readFileSync(envPath, 'utf8');
  assert.match(first, /^POSTGRES_PASSWORD=keep-existing-password\r?$/m);
  assert.match(first, /^LANGFUSE_SALT=[a-f0-9]{32}\r?$/m);
  success(f.run('status'));
  assert.strictEqual(fs.readFileSync(envPath, 'utf8'), first);
});

psTest('test sends authenticated chat JSON to the configured gateway', (t) => {
  const f = fixture(t);
  success(f.run('status'));
  const envPath = path.join(f.dir, '.env');
  fs.writeFileSync(envPath, fs.readFileSync(envPath, 'utf8').replace('GATEWAY_PORT=4000', 'GATEWAY_PORT=4500'));
  const result = f.run('test');
  success(result);
  const request = result.calls.find((c) => c.kind === 'http');
  const key = fs.readFileSync(envPath, 'utf8').match(/^LITELLM_MASTER_KEY=(.+)$/m)[1];
  assert.strictEqual(request.headers.Authorization, 'Bearer ' + key);
  assert.strictEqual(request.uri, 'http://localhost:4500/v1/chat/completions');
  assert.deepStrictEqual(request.body, {
    model: 'chat', messages: [{ role: 'user', content: 'Say hello in five words.' }]
  });
});

psTest('model discovery supports quoted models, ignores comments and deduplicates', (t) => {
  const f = fixture(t);
  success(f.run('status'));
  const envPath = path.join(f.dir, '.env');
  fs.writeFileSync(envPath, fs.readFileSync(envPath, 'utf8').replace('OLLAMA_PORT=11434', 'OLLAMA_PORT=11435'));
  fs.writeFileSync(path.join(f.dir, 'config/litellm.yaml'), `
  model: "ollama_chat/custom:tag" # chat
  # model: ollama/ignored
  model: ollama_chat/custom:tag
  model: 'ollama/embedding'
  model: openai/remote
`);
  const result = f.run('up');
  success(result);
  const pulls = result.calls.filter((c) => c.kind === 'http');
  assert.deepStrictEqual(pulls.map((c) => c.body.name), ['custom:tag', 'embedding']);
  assert.ok(pulls.every((c) => c.uri === 'http://localhost:11435/api/pull'));
  assert.ok(composeCalls(result)[1].arguments.includes('http://host.docker.internal:11435/api/tags'));
});

psTest('down, logs and reset use the override and reset requires exact confirmation', (t) => {
  const f = fixture(t);
  success(f.run('status'));
  for (const [command, options, expected] of [
    ['down', {}, ['down']],
    ['logs', {}, ['logs', '-f', '--tail=100']],
    ['reset', { TEST_CONFIRM: 'yes' }, ['down', '-v']]
  ]) {
    const result = f.run(command, options);
    success(result);
    assert.deepStrictEqual(composeCalls(result)[0].arguments.slice(7), expected);
  }
  for (const answer of ['', 'no', 'YES']) {
    const result = f.run('reset', { TEST_CONFIRM: answer });
    success(result);
    assert.strictEqual(composeCalls(result).length, 0);
  }
});

psTest('preflight rejects old Compose and Windows containers', (t) => {
  const f = fixture(t);
  for (const options of [
    { TEST_COMPOSE_VERSION: '2.24.3' },
    { TEST_COMPOSE_VERSION: 'not-a-version' },
    { TEST_DOCKER_OS: 'windows' }
  ]) {
    const result = f.run('up', options);
    assert.strictEqual(result.status, 1);
    assert.strictEqual(composeCalls(result).length, 0);
    assert.ok(!fs.existsSync(path.join(f.dir, '.env')));
  }
});

psTest('deployment fails on Docker errors, unreachable services and model download errors', (t) => {
  const f = fixture(t);
  for (const options of [
    { TEST_FAIL_OPERATION: 'up' },
    { TEST_FAIL_OPERATION: 'exec' },
    { TEST_HTTP_FAIL: '1' },
    { TEST_PULL_ERROR: '1' }
  ]) {
    const result = f.run('up', options);
    assert.strictEqual(result.status, 1, result.stdout + result.stderr);
    assert.doesNotMatch(result.stdout, /AI platform is running/);
    if (options.TEST_FAIL_OPERATION === 'exec') {
      assert.match(result.stderr, /LiteLLM cannot reach native Ollama/);
      assert.strictEqual(result.calls.filter((c) => c.kind === 'http').length, 0);
    }
    if (options.TEST_HTTP_FAIL) {
      assert.strictEqual(composeCalls(result).length, 0);
      assert.strictEqual(result.calls.filter((c) => c.kind === 'ready').length, 60);
    }
  }
});

psTest('smoke-test CLI makes a real HTTP request with a single-message array', async (t) => {
  const f = fixture(t);
  success(f.run('status'));
  const requests = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      requests.push({ url: req.url, authorization: req.headers.authorization, body: JSON.parse(body) });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ choices: [{ message: { content: 'Hello from the test gateway.' } }] }));
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const envPath = path.join(f.dir, '.env');
  const env = fs.readFileSync(envPath, 'utf8').replace('GATEWAY_PORT=4000', `GATEWAY_PORT=${server.address().port}`);
  fs.writeFileSync(envPath, env);
  const wrapper = path.join(f.dir, 'http.ps1');
  fs.writeFileSync(wrapper, `
function docker { $global:LASTEXITCODE = 0; '2.38.2' }
& (Join-Path $env:TEST_PACKAGE 'deploy.ps1') test
exit $LASTEXITCODE
`);
  const result = await new Promise((resolve, reject) => {
    const child = spawn(powershell, ['-NoProfile', '-File', wrapper], {
      cwd: os.tmpdir(), env: { ...process.env, TEST_PACKAGE: f.dir }
    });
    let stdout = '', stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (status) => resolve({ status, stdout, stderr }));
  });
  success(result);
  assert.strictEqual(requests.length, 1);
  assert.strictEqual(requests[0].url, '/v1/chat/completions');
  assert.strictEqual(requests[0].authorization, 'Bearer ' + env.match(/^LITELLM_MASTER_KEY=(.+)$/m)[1]);
  assert.ok(Array.isArray(requests[0].body.messages));
  assert.match(result.stdout, /Hello from the test gateway/);
});

test('Compose overrides isolate native Windows Ollama without changing the base stack', {
  skip: spawnSync('docker', ['compose', 'version']).status !== 0 && 'Docker Compose is not installed'
}, () => {
  function config(extra, env = {}) {
    const result = spawnSync('docker', ['compose', '--env-file', '.env.example',
      '-f', 'docker-compose.yml', ...extra, 'config', '--format', 'json'], {
      cwd: root, encoding: 'utf8', env: { ...process.env, ...env }
    });
    success(result);
    return JSON.parse(result.stdout);
  }
  const base = config([]);
  assert.ok(base.services.ollama);
  assert.strictEqual(base.services.litellm.environment.OLLAMA_API_BASE, 'http://ollama:11434');
  assert.strictEqual(base.services.litellm.depends_on.ollama.condition, 'service_healthy');
  const windows = config(['-f', 'docker-compose.windows.yml']);
  assert.deepStrictEqual(Object.keys(windows.services).sort(), ['langfuse', 'litellm', 'open-webui', 'postgres', 'qdrant']);
  assert.strictEqual(windows.services.litellm.environment.OLLAMA_API_BASE, 'http://host.docker.internal:11434');
  assert.deepStrictEqual(Object.keys(windows.services.litellm.depends_on), ['postgres']);
  assert.strictEqual(config(['-f', 'docker-compose.windows.yml'], { OLLAMA_PORT: '11435' })
    .services.litellm.environment.OLLAMA_API_BASE, 'http://host.docker.internal:11435');
  const gpu = config(['-f', 'docker-compose.gpu.yml']);
  assert.strictEqual(gpu.services.ollama.deploy.resources.reservations.devices[0].driver, 'nvidia');
});
