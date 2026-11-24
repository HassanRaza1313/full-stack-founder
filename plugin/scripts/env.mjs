// Gets a product's code ready to work on, whatever its stack: detects how to install, run, test and build it, checks
// the environment on this computer (missing tools, a moved or stale Python environment, missing packages), installs,
// and runs the tests once. Used by /founder:adopt; any flow can re-run it.
//
// Usage: node env.mjs detect  --dir <code>                 what it is and the commands, as JSON (changes nothing)
//        node env.mjs check   --dir <code>                 what's missing or broken on this computer
//        node env.mjs install --dir <code>                 runs the install commands (and the fixes from check)
//        node env.mjs test    --dir <code>                 runs the test command once and reports the result
//        add --write <services.json> to detect to save `commands` (and found services) there; existing values are kept
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fail, isWin, loadConfig, parseArgs } from './lib.mjs';

const args = parseArgs();
const [cmd] = args._;
const dir = resolve(args.dir ?? '.');
if (!['detect', 'check', 'install', 'test'].includes(cmd) || !existsSync(dir)) fail('Usage: env.mjs detect|check|install|test --dir <code> [--write <services.json>]');
const has = (...p) => existsSync(join(dir, ...p));
const read = (...p) => (has(...p) ? readFileSync(join(dir, ...p), 'utf8') : '');
const json = (...p) => { try { return JSON.parse(read(...p)); } catch { return null; } };
const skip = new Set(['node_modules', '.git', '.venv', 'venv', 'dist', 'build', '.next', 'target', '__pycache__', 'vendor']);

// Tools may be installed without being on PATH (uv under a tools folder, for example), so look in the usual places too.
const config = loadConfig();
function findTool(name) {
  const exe = isWin ? `${name}.exe` : name;
  const onPath = spawnSync(isWin ? 'where' : 'which', [name], { encoding: 'utf8' });
  if (onPath.status === 0) return name;
  const places = [config.toolsDir && join(config.toolsDir, name, 'bin'), config.toolsDir && join(config.toolsDir, 'bin'), join(homedir(), '.local', 'bin'), join(homedir(), '.cargo', 'bin'),
    config.productsDir && join(config.productsDir, '..', `.${name}-tool`, 'bin')].filter(Boolean);
  const hit = places.map((p) => join(p, exe)).find((p) => existsSync(p));
  return hit ? `"${hit}"` : null;
}

// Each part of the code that has its own stack: the root, plus first-level folders like backend/ and frontend/.
const parts = ['.', ...readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && !skip.has(e.name) && !e.name.startsWith('.')).map((e) => e.name)];
const stacks = [];
for (const p of parts) {
  const at = (...f) => join(p, ...f);
  const pkg = json(at('package.json'));
  if (pkg && !(p !== '.' && json('package.json')?.workspaces)) {
    const pm = has(at('pnpm-lock.yaml')) || has('pnpm-lock.yaml') ? 'pnpm' : has(at('yarn.lock')) ? 'yarn' : has(at('bun.lockb')) || has(at('bun.lock')) ? 'bun' : 'npm';
    const s = pkg.scripts ?? {};
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const runIt = (k) => (s[k] ? `${pm} run ${k}` : null);
    stacks.push({
      part: p, kind: 'node', tool: pm,
      install: pm === 'npm' && has(at('package-lock.json')) ? 'npm ci' : `${pm} install`,
      dev: runIt('dev') ?? runIt('start'), test: runIt('test'), check: runIt('check') ?? runIt('lint'), typecheck: runIt('typecheck'), build: runIt('build'),
      audit: pm === 'bun' ? null : `${pm} audit --audit-level high`,
      url: deps.next ? 'http://localhost:3000' : deps.vite ? 'http://localhost:5173' : null,
      ready: has(at('node_modules')),
    });
  }
  const pyproject = read(at('pyproject.toml'));
  if (pyproject || has(at('requirements.txt'))) {
    const uv = Boolean(pyproject) && (has(at('uv.lock')) || /\[tool\.uv\]/.test(pyproject));
    const mentions = (w) => new RegExp(`["'\\s]${w}[\\s>=<~\\["']`, 'i').test(pyproject + read(at('requirements.txt')) + read(at('requirements-dev.txt')));
    const prefix = uv ? 'uv run ' : '';
    stacks.push({
      part: p, kind: 'python', tool: uv ? 'uv' : 'pip',
      install: uv ? `uv sync${has(at('uv.lock')) ? ' --frozen' : ''} --inexact` : pyproject ? 'python -m pip install -e .' : 'python -m pip install -r requirements.txt',
      test: mentions('pytest') || has(at('tests')) ? `${prefix}pytest -q` : null,
      check: mentions('ruff') ? `${prefix}ruff check .` : null,
      typecheck: mentions('mypy') ? `${prefix}mypy .` : null,
      audit: uv ? 'uvx pip-audit' : null,
      url: mentions('fastapi') || mentions('uvicorn') ? 'http://localhost:8000' : null,
      ready: has(at('.venv')),
    });
  }
  if (has(at('go.mod'))) stacks.push({ part: p, kind: 'go', tool: 'go', install: 'go mod download', test: 'go test ./...', build: 'go build ./...', check: 'go vet ./...', ready: true });
  if (has(at('Cargo.toml'))) stacks.push({ part: p, kind: 'rust', tool: 'cargo', install: 'cargo fetch', test: 'cargo test', build: 'cargo build', check: 'cargo clippy', ready: has(at('target')) });
}
const compose = ['compose.yaml', 'compose.yml', 'docker-compose.yml', 'docker-compose.yaml', 'deploy/compose.yaml', 'deploy/docker-compose.yml'].find((f) => has(f));

// One command per kind for the whole product: each part's command, run in its folder.
const inPart = (s, c) => (s.part === '.' ? c : `(cd ${s.part} && ${c})`);
const join2 = (k) => { const cs = stacks.filter((s) => s[k]).map((s) => inPart(s, s[k])); return cs.length ? cs.join(' && ') : undefined; };
const commands = Object.fromEntries(['install', 'dev', 'test', 'check', 'typecheck', 'build', 'audit'].map((k) => [k, k === 'dev' ? stacks.filter((s) => s.dev).map((s) => inPart(s, s.dev))[0] : join2(k)]).filter(([, v]) => v));
const url = stacks.find((s) => s.url)?.url;
if (url) commands.url = url;
const services = compose ? [{ id: 'stack', use: 'docker', why: `The Docker stack (${compose}); only for work that needs it` }] : [];

// What's missing or broken on this computer.
function check() {
  const issues = [];
  const tools = { node: 'node', pnpm: 'pnpm', yarn: 'yarn', bun: 'bun', npm: 'npm', uv: 'uv', pip: 'python', go: 'go', cargo: 'cargo' };
  for (const t of new Set(stacks.map((s) => s.tool))) if (!findTool(tools[t])) issues.push({ kind: 'tool', tool: tools[t], fix: `install ${tools[t]}` });
  for (const s of stacks) {
    if (!s.ready) issues.push({ kind: 'not-installed', part: s.part, fix: inPart(s, s.install) });
    // A Python environment that was moved or copied still points at its old folder: its launchers and editable installs break.
    const venv = join(dir, s.part, '.venv');
    if (s.kind === 'python' && existsSync(venv)) {
      const site = isWin ? join(venv, 'Lib', 'site-packages') : (readdirSync(join(venv, 'lib')).map((v) => join(venv, 'lib', v, 'site-packages')).find(existsSync) ?? '');
      const stale = existsSync(site) && readdirSync(site).filter((f) => f.endsWith('.pth')).some((f) => readFileSync(join(site, f), 'utf8').split(/\r?\n/)
        .some((l) => /^[A-Za-z]:[\\/]|^\//.test(l.trim()) && !existsSync(l.trim())));
      if (stale) issues.push({ kind: 'moved-environment', part: s.part, fix: inPart(s, s.tool === 'uv' ? 'uv sync --frozen --inexact --reinstall' : 'python -m pip install --force-reinstall -e .') });
    }
  }
  if (compose && !findTool('docker')) issues.push({ kind: 'tool', tool: 'docker', fix: 'install Docker (only for the Docker stack)', optional: true });
  return issues;
}

// Runs a command line in the code folder, with tools found off PATH swapped in.
function sh(line) {
  const swapped = line.replace(/\b(uv|uvx|pnpm|yarn|bun)\b(?=\s)/g, (t) => (t === 'uvx' ? (findTool('uvx') ?? findTool('uv')?.replace(/uv(\.exe)?"?$/, (m) => m.replace('uv', 'uvx')) ?? t) : findTool(t) ?? t));
  const r = spawnSync(swapped, { cwd: dir, shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, UV_LINK_MODE: process.env.UV_LINK_MODE ?? 'copy' } });
  return { line, code: r.status ?? 1, tail: `${r.stdout ?? ''}\n${r.stderr ?? ''}`.trim().split(/\r?\n/).slice(-8).join('\n') };
}

const result = { dir, stacks: stacks.map(({ part, kind, tool, ready }) => ({ part, kind, tool, installed: ready })), commands, services, docker: compose ?? null };
if (cmd === 'detect') {
  if (args.write) {
    const sv = existsSync(args.write) ? JSON.parse(readFileSync(args.write, 'utf8')) : { services: [] };
    sv.commands = { ...commands, ...(sv.commands ?? {}) };
    for (const s of services) if (!(sv.services ?? []).some((x) => x.id === s.id)) (sv.services ??= []).push(s);
    writeFileSync(args.write, `${JSON.stringify(sv, null, 2)}\n`);
    result.written = args.write;
  }
  console.log(JSON.stringify(result, null, 1));
} else if (cmd === 'check') {
  const issues = check();
  console.log(JSON.stringify({ ...result, ready: issues.filter((i) => !i.optional).length === 0, issues }, null, 1));
} else if (cmd === 'install') {
  const issues = check();
  const missingTools = issues.filter((i) => i.kind === 'tool' && !i.optional);
  if (missingTools.length) { console.log(JSON.stringify({ ok: false, missingTools }, null, 1)); process.exit(2); }
  const fixes = issues.filter((i) => i.kind === 'moved-environment').map((i) => i.fix);
  const steps = [...new Set([...fixes, ...stacks.map((s) => inPart(s, s.install))])];
  const ran = [];
  for (const line of steps) { const r = sh(line); ran.push(r); if (r.code !== 0) break; }
  console.log(JSON.stringify({ ok: ran.every((r) => r.code === 0), ran }, null, 1));
  process.exit(ran.every((r) => r.code === 0) ? 0 : 1);
} else {
  const line = commands.test;
  if (!line) { console.log(JSON.stringify({ ok: null, note: 'No test command found. Say so in the ready checklist.' })); process.exit(0); }
  const r = sh(line);
  // pytest, vitest and jest say "3 passed"; node --test says "# pass 3" or "ℹ pass 3", depending on its reporter.
  const count = (re) => [...r.tail.matchAll(re)].reduce((n, m) => n + Number(m[1]), 0);
  const passed = count(/(\d+) passed/g) + count(/^(?:#|ℹ) pass (\d+)/gm);
  const failed = count(/(\d+) failed/g) + count(/^(?:#|ℹ) fail (\d+)/gm);
  console.log(JSON.stringify({ ok: r.code === 0, line, passed, failed, tail: r.tail }, null, 1));
  process.exit(r.code === 0 ? 0 : 1);
}
