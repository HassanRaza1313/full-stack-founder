// Shared test setup: a throwaway workspace, products folder and fake GitHub CLI, so scripts run end to end offline.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const plugin = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const script = (name) => join(plugin, 'scripts', name);

export function sandbox(ghState = {}) {
  const root = mkdtempSync(join(tmpdir(), 'founder-test-'));
  const ws = join(root, 'workspace'); const products = join(root, 'products'); const bin = join(root, 'bin');
  for (const d of [ws, products, bin]) mkdirSync(d, { recursive: true });
  writeFileSync(join(ws, 'studio.config.json'), JSON.stringify({ studioRepo: 'tester/ws' }));
  writeFileSync(join(ws, 'studio.config.local.json'), JSON.stringify({ productsDir: products }));
  const state = join(root, 'gh.json');
  writeFileSync(state, JSON.stringify({ login: 'tester', repos: {}, issues: [], labels: {}, ...ghState }));
  const fake = join(plugin, 'tests', 'fixtures', 'fakegh.mjs');
  writeFileSync(join(bin, 'gh.cmd'), `@node "${fake}" %*\r\n`);
  writeFileSync(join(bin, 'gh'), `#!/bin/sh\nexec node "${fake}" "$@"\n`, { mode: 0o755 });
  // gitleaks off the PATH unless the machine has it; HOME points into the sandbox so the copy search stays inside it.
  const { NODE_TEST_CONTEXT: _nested, ...outer } = process.env; // a nested `node --test` would report to this runner instead
  const env = { ...outer, STUDIO_DIR: ws, FAKEGH_STATE: state, PATH: `${bin}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}`, HOME: root, USERPROFILE: root };
  const runScript = (name, args, opts = {}) => spawnSync('node', [script(name), ...args], { env, encoding: 'utf8', cwd: opts.cwd ?? root });
  const gh = () => JSON.parse(readFileSync(state, 'utf8'));
  return { root, ws, products, env, run: runScript, gh };
}

export function gitRepo(dir, files = {}, remote) {
  mkdirSync(dir, { recursive: true });
  for (const [f, body] of Object.entries(files)) { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), body); }
  execFileSync('git', ['init', '-q', '-b', 'main', dir]);
  if (remote) execFileSync('git', ['-C', dir, 'remote', 'add', 'origin', remote]);
  execFileSync('git', ['-C', dir, 'add', '-A']);
  execFileSync('git', ['-C', dir, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', 'init']);
  return dir;
}

export const json = (r) => { try { return JSON.parse(r.stdout.slice(r.stdout.indexOf('{'))); } catch { throw new Error(`not JSON:\n${r.stdout}\n${r.stderr}`); } };
