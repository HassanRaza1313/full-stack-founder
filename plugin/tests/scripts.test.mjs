// The other scripts: environment setup, intake, the brief, knowledge folders, pinned skills, the demo recorder, the index.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
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

test('env test: runs the tests once and counts them (node --test output)', () => {
  const s = sandbox();
  const code = join(s.root, 'nodeapp');
  write(code, { 'package.json': JSON.stringify({ type: 'module', scripts: { test: 'node --test' } }), 'test/a.test.js': "import { test } from 'node:test';\ntest('a', () => {});\ntest('b', () => {});\n" });
  const r = json(s.run('env.mjs', ['test', '--dir', code]));
  assert.equal(r.ok, true, r.tail);
  assert.equal(r.passed, 2);
});

test('where: a product repo finds its knowledge folder in the workspace', () => {
  const s = sandbox();
  const repo = join(s.products, 'pubapp'); mkdirSync(repo, { recursive: true });
  write(join(s.ws, 'products', 'pubapp', 'product'), { 'services.json': '{"services":[]}' });
  const r = json(s.run('where.mjs', ['--dir', repo]));
  assert.equal(r.knowledge, join(s.ws, 'products', 'pubapp', 'product'));
  assert.equal(r.knowledgeRepo, s.ws);
  const none = json(s.run('where.mjs', ['--dir', join(s.root)]));
  assert.equal(none.knowledge, null);
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

test('update --hook: one line when a newer release is out, silence otherwise, and an off switch', () => {
  const s = sandbox();
  const hook = (env) => spawnSync('node', [script('update.mjs'), '--hook'], { env: { ...s.env, ...env }, encoding: 'utf8' });
  const { version } = JSON.parse(readFileSync(join(plugin, '.claude-plugin', 'plugin.json'), 'utf8'));
  const out = hook({ FOUNDER_LATEST: '99.0.0' });
  assert.equal(out.status, 0);
  const msg = JSON.parse(out.stdout);
  assert.ok(msg.systemMessage.includes(`99.0.0 is out (you have ${version}). Say "update founder"`), msg.systemMessage);
  assert.equal(msg.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.equal(hook({ FOUNDER_LATEST: version }).stdout, '');
  assert.equal(hook({ FOUNDER_LATEST: '0.0.1' }).stdout, '');
  assert.equal(hook({ FOUNDER_LATEST: '99.0.0', FOUNDER_UPDATE_CHECK: 'off' }).stdout, '');
  writeFileSync(join(s.ws, 'studio.config.local.json'), JSON.stringify({ updateCheck: false }));
  assert.equal(hook({ FOUNDER_LATEST: '99.0.0' }).stdout, '');
});

test('update --hook: a development copy stays quiet and never fails the session', () => {
  const s = sandbox();
  const r = spawnSync('node', [script('update.mjs'), '--hook'], { env: s.env, encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
});

test('the session-start hook points at a script that exists', () => {
  const hooks = JSON.parse(readFileSync(join(plugin, 'hooks', 'hooks.json'), 'utf8'));
  const cmd = hooks.hooks.SessionStart[0].hooks[0].command;
  const file = cmd.match(/scripts\/([\w-]+\.mjs)/)[1];
  assert.ok(existsSync(script(file)), file);
});

const verdictFile = (stage, light, extra = '') => `---\ntopic: verdict\nstage: ${stage}\nlight: ${light}          # green | yellow | red\n${extra}call: Worth proving as a profile builder.\ndate: 2026-11-26\n---\n\n# X\n`;

test('card: the idea card shows the stage and the verdict at the top of the issue, and rebuilds in place', () => {
  const meta = 'x\n\n<!-- studio\nslug: pm\nnext: say "prove pm" in a new chat\n-->';
  const s = sandbox({ issues: [{ repo: 'tester/ws', number: 7, title: 'PM', body: meta, labels: [{ name: 'type:idea' }, { name: 'status:exploring' }], state: 'OPEN' }] });
  write(join(s.ws, 'ideas', 'pm'), { 'verdict.md': verdictFile('checked', 'yellow') });
  assert.equal(s.run('card.mjs', ['pm']).status, 0);
  let body = s.gh().issues[0].body;
  assert.match(body, /^<!-- card -->\n\*\*Where it stands:\*\* ✅ Idea → ✅ Checked → ⬜ Proven → ⬜ Built → ⬜ Live/);
  assert.match(body, /\*\*Verdict:\*\* 🟡 Worth proving as a profile builder\. · \[read it\]\(https:\/\/github\.com\/tester\/ws\/blob\/main\/ideas\/pm\/verdict\.md\)/);
  assert.match(body, /\*\*Next:\*\* say "prove pm" in a new chat/);
  // Prove: proven, with a score, rebuilt in place (one card, the rest of the body kept).
  write(join(s.ws, 'ideas', 'pm'), { 'verdict.md': verdictFile('proven', 'green', 'score: 7/10\n') });
  const st = s.gh(); st.issues[0].labels = [{ name: 'type:idea' }, { name: 'status:researching' }]; writeFileSync(s.env.FAKEGH_STATE, JSON.stringify(st));
  s.run('card.mjs', ['pm']);
  body = s.gh().issues[0].body;
  assert.equal(body.match(/<!-- card -->/g).length, 1);
  assert.match(body, /✅ Proven → ⬜ Built/);
  assert.match(body, /🟢 Worth proving as a profile builder\. · 7\/10/);
  assert.match(body, /<!-- studio\nslug: pm/);
});

test('card: a parked idea says so, with its reason', () => {
  const s = sandbox({ issues: [{ repo: 'tester/ws', number: 1, title: 'Old', body: 'x\n\n<!-- studio\nslug: old\nreason: too crowded\n-->', labels: [{ name: 'type:idea' }, { name: 'status:parked' }], state: 'OPEN' }] });
  const r = s.run('card.mjs', ['old', '--dry-run']);
  assert.match(r.stdout, /\*\*Parked\*\* \(too crowded\) · ✅ Idea → ⬜ Checked/);
  assert.match(r.stdout, /not checked yet/);
});

test('brief --all: an idea folder reports its verdict', () => {
  const s = sandbox();
  write(join(s.ws, 'ideas', 'pm'), { 'verdict.md': verdictFile('proven', 'green', 'score: 7/10\n') });
  const idea = json(s.run('brief.mjs', ['--all'])).ideaFolders.find((i) => i.slug === 'pm');
  assert.deepEqual(idea.verdict, { stage: 'proven', light: 'green', call: 'Worth proving as a profile builder.', score: '7/10' });
});

const goodVerdict = `---\ntopic: verdict\nstage: checked\nlight: yellow\ncall: Worth proving as a pack plan.\n---\n\n# X · 🟡\n\n**The call:** Real problem; prove the pack plan first.\n\n**What's promising**\n- Common problem ([case for](01-discovery/case-for.md)).\n\n**What's risky**\n- Two apps already exist ([case against](01-discovery/case-against.md)).\n\n**Next:** Say: **prove x**.\n\n<details>${'word '.repeat(400)}</details>\n`;

test('stage --lint: a plain verdict passes; shorthand, missing parts and length are named', () => {
  const s = sandbox();
  const f = join(s.root, 'v.md');
  writeFileSync(f, goodVerdict);
  assert.equal(s.run('stage.mjs', ['--lint', f]).status, 0, 'details are not counted');
  writeFileSync(f, goodVerdict.replace('**What\'s risky**', 'Risks: WTP is unproven (E§4), see [assumption].').replace('light: yellow', 'light: amber') + 'word '.repeat(0));
  const r = s.run('stage.mjs', ['--lint', f]);
  assert.equal(r.status, 1);
  const p = JSON.parse(r.stdout).problems.join(' | ');
  for (const bit of ["missing **What's risky**", 'light: must be', 'WTP', 'E§4', '[assumption]']) assert.ok(p.includes(bit), bit);
  writeFileSync(f, goodVerdict.replace('**The call:** ', `**The call:** ${'long '.repeat(300)}`));
  assert.match(JSON.parse(s.run('stage.mjs', ['--lint', f]).stdout).problems[0], /words above the details/);
});

test('stage --record: one call labels, updates metadata and card, logs, commits only the idea folder', () => {
  const s = sandbox({ issues: [{ repo: 'tester/ws', number: 3, title: 'X', body: 'x\n\n<!-- studio\nslug: x\nnext: old\n-->', labels: [{ name: 'type:idea' }, { name: 'status:new' }], state: 'OPEN' }] });
  execFileSync('git', ['init', '-q', s.ws]);
  write(join(s.ws, 'ideas', 'x'), { 'verdict.md': goodVerdict });
  writeFileSync(join(s.ws, 'other.md'), 'someone else\'s work in progress');
  const r = s.run('stage.mjs', ['--record', 'x', '--stage', 'check', '--light', 'yellow', '--next', 'say: prove x', '--tokens', '600k']);
  assert.equal(r.status, 0, r.stderr);
  const i = s.gh().issues[0];
  assert.deepEqual(i.labels.map((l) => l.name).sort(), ['status:exploring', 'type:idea']);
  assert.match(i.body, /^light: yellow$/m);
  assert.match(i.body, /^next: say: prove x$/m);
  assert.match(i.body, /^<!-- card -->/);
  assert.match(readFileSync(join(s.ws, 'ideas', 'x', 'runs.md'), 'utf8'), /· check · done · yellow · 600k tokens/);
  const committed = execFileSync('git', ['-C', s.ws, 'show', '--name-only', '--format=%s', 'HEAD'], { encoding: 'utf8' });
  assert.match(committed, /^check\(x\): yellow/);
  assert.doesNotMatch(committed, /other\.md/);
  assert.match(committed, /ideas\/x\/README\.md/);
  const start = readFileSync(join(s.ws, 'ideas', 'x', 'README.md'), 'utf8');
  assert.match(start, /^# X\n/);
  assert.match(start, /- \*\*\[Where it stands\]\(verdict\.md\)\*\*: the verdict, in one screen/);
  assert.doesNotMatch(start, /case-for/, 'only files that exist are listed');
});
