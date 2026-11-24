// The other scripts: environment setup, intake, the brief, knowledge folders, pinned skills, the demo recorder, the index.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { json, plugin, sandbox, script } from './helpers.mjs';

const write = (root, files) => { for (const [f, b] of Object.entries(files)) { mkdirSync(join(root, f, '..'), { recursive: true }); writeFileSync(join(root, f), b); } };

test('env detect: each part of a mixed stack, its commands run in its own folder', () => {
  const s = sandbox();
  const code = join(s.root, 'mixed');
  write(code, {
    'backend/pyproject.toml': '[project]\nname="x"\ndependencies=["fastapi"]\n[dependency-groups]\ndev=["pytest>=8", "ruff>=0.5"]\n[tool.uv]\n', 'backend/uv.lock': '', 'backend/tests/test_a.py': '',
    'frontend/package.json': JSON.stringify({ scripts: { dev: 'vite', test: 'vitest', lint: 'eslint .' }, devDependencies: { vite: '5' } }),
    'deploy/compose.yaml': 'services: {}\n',
  });
  const r = json(s.run('env.mjs', ['detect', '--dir', code]));
  assert.equal(r.commands.install, '(cd backend && uv sync --frozen --inexact) && (cd frontend && npm install)');
  assert.equal(r.commands.test, '(cd backend && uv run pytest -q) && (cd frontend && npm run test)');
  assert.equal(r.commands.check, '(cd backend && uv run ruff check .) && (cd frontend && npm run lint)');
  assert.equal(r.commands.dev, '(cd frontend && npm run dev)');
  assert.equal(r.services[0].use, 'docker');
});

test('env detect --write keeps values already in services.json', () => {
  const s = sandbox();
  const code = join(s.root, 'app');
  write(code, { 'package.json': JSON.stringify({ scripts: { dev: 'next dev' }, dependencies: { next: '15' } }) });
  const file = join(s.root, 'services.json');
  writeFileSync(file, JSON.stringify({ services: [], commands: { dev: './run.sh dev' } }));
  s.run('env.mjs', ['detect', '--dir', code, '--write', file]);
  const sv = JSON.parse(readFileSync(file, 'utf8'));
  assert.equal(sv.commands.dev, './run.sh dev');
  assert.equal(sv.commands.url, 'http://localhost:3000');
});

test('env check: a Python environment moved from another folder is caught, with its fix', () => {
  const s = sandbox();
  const code = join(s.root, 'py');
  const site = process.platform === 'win32' ? '.venv/Lib/site-packages' : '.venv/lib/python3.12/site-packages';
  write(code, { 'pyproject.toml': '[project]\nname="x"\n[tool.uv]\n', 'uv.lock': '', [`${site}/__editable__.x.pth`]: process.platform === 'win32' ? 'C:\\gone\\old\\src\n' : '/gone/old/src\n' });
  const r = json(s.run('env.mjs', ['check', '--dir', code]));
  const moved = r.issues.find((i) => i.kind === 'moved-environment');
  assert.ok(moved, JSON.stringify(r.issues));
  assert.match(moved.fix, /--reinstall/);
});

test('intake: copies plans and documents (Word too), gathers TODOs, never moves the originals', () => {
  const s = sandbox();
  const code = join(s.root, 'proj'); const out = join(s.root, 'k');
  write(code, { 'plan.md': '# plan', 'README.md': '# readme', 'docs/spec/Idea.docx': 'binary', 'notes/random.md': 'n', 'src/a.ts': 'x // TODO: retry on failure\n', 'node_modules/p/plan.md': 'no' });
  const r = json(s.run('intake.mjs', ['--dir', code, '--out', out]));
  assert.deepEqual([...r.copied].sort(), ['docs/spec/Idea.docx', 'notes/random.md', 'plan.md']);
  assert.equal(r.todos, 1);
  assert.ok(existsSync(join(code, 'plan.md')), 'the original stays');
  const manifest = readFileSync(join(out, '00-intake', 'existing-ideas', 'MANIFEST.md'), 'utf8');
  assert.match(manifest, /inputs for the brief/i);
});

test('brief: a folder-only product is a product; a closed catalog entry is not', () => {
  const meta = (m) => `x\n\n<!-- studio\n${m}\n-->`;
  const s = sandbox({ issues: [
    { repo: 'tester/ws', number: 1, title: 'Vibe App', body: meta('slug: vibe\nlocal: vibe\nknowledge: workspace'), labels: [{ name: 'type:idea' }, { name: 'status:building' }], state: 'OPEN' },
    { repo: 'tester/ws', number: 2, title: 'Old Test', body: meta('slug: old\nrepo: someone/old'), labels: [{ name: 'type:idea' }], state: 'CLOSED' },
    { repo: 'tester/ws', number: 3, title: 'An Idea', body: meta('slug: idea'), labels: [{ name: 'type:idea' }, { name: 'status:new' }], state: 'OPEN' },
  ] });
  write(join(s.ws, 'products', 'vibe', 'product'), { 'STATE.md': 'stage: onboarding\nready: your ideas ✓ · brief —\n\n## Where I left off\n\n- **Last session:** 2026-11-20\n- **Next step:** the brief\n' });
  const r = json(s.run('brief.mjs', []));
  assert.deepEqual(r.products.map((p) => p.name), ['Vibe App']);
  const p = r.products[0];
  assert.equal(p.localOnly, true);
  assert.equal(p.stage, 'onboarding');
  assert.equal(p.lastSession, '2026-11-20');
  assert.match(p.ready, /^your ideas ✓/);
  assert.deepEqual(r.ideas.map((i) => i.title), ['An Idea']);
});

test('knowledge folders: services are found in the workspace for workspace-knowledge products', () => {
  const s = sandbox();
  const repo = join(s.products, 'pubapp'); mkdirSync(repo, { recursive: true });
  write(join(s.ws, 'products', 'pubapp', 'product'), { 'services.json': JSON.stringify({ services: [{ id: 'ollama', start: 'ollama serve', stop: 'ollama stop', check: 'ollama list' }] }) });
  const r = s.run('session.mjs', ['status', '--dir', repo]);
  assert.match(r.stdout + r.stderr, /ollama/);
});

test('every skill the flows name resolves to its pinned copy', () => {
  const names = [...new Set([...readFileSync(join(plugin, 'references', 'skills.md'), 'utf8').matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1]))]
    .filter((n) => !['impeccable', 'hyperframes', 'brag', 'security-audit', 'compliance-check', 'review-contract', 'triage-nda', 'ticket-triage', 'draft-response', 'kb-article'].includes(n) && !n.startsWith('gsap'));
  const missing = names.filter((n) => spawnSync('node', [script('skill.mjs'), n], { encoding: 'utf8' }).status !== 0);
  assert.deepEqual(missing, []);
});

test('pinned skills match their lock and licences', () => {
  const r = spawnSync('node', [script('vendor.mjs'), 'verify'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('demo recorder needs a steps file', () => {
  const r = spawnSync('node', [script('demo-walkthrough.mjs')], { encoding: 'utf8' });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /--steps/);
});

test('index: results listed by department, newest first', () => {
  const s = sandbox();
  const k = join(s.root, 'prod', 'product');
  write(k, {
    'research/customers/2026-01-01-a.md': '---\ntopic: customers\nsummary: older\nfresh_until: 2020-01-01\n---\n',
    'research/customers/2026-02-01-b.md': '---\ntopic: customers\nsummary: newer\nfresh_until: 2999-01-01\n---\n',
  });
  const r = s.run('index.mjs', [join(s.root, 'prod')]);
  assert.equal(r.status, 0, r.stderr);
  const idx = readFileSync(join(k, 'INDEX.md'), 'utf8');
  assert.ok(idx.indexOf('newer') < idx.indexOf('older'));
  assert.match(idx, /stale/);
});
