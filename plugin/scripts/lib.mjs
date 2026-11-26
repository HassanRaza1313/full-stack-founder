// Shared helpers for Full Stack Founder's scripts. Node 22+, no dependencies, Windows, macOS and Linux.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const platform = { win32: 'win', darwin: 'mac' }[process.platform] ?? 'linux';
export const isWin = platform === 'win';

// Small machine-level state (the workspace pointer, the doctor's cache) lives here, never in a repo.
// FOUNDER_STATE_DIR and FOUNDER_TRIAL_DIR let a test run as a brand-new computer without touching the real ones.
export const stateDir = process.env.FOUNDER_STATE_DIR || join(homedir(), '.claude', 'founder');
// Ideas checked before setup live here (Claude Code blocks writes inside ~/.claude); setup moves them into the workspace.
export const trialDir = process.env.FOUNDER_TRIAL_DIR || join(homedir(), 'founder-trial');
export function readState(file, fallback = {}) {
  try { return JSON.parse(readFileSync(join(stateDir, file), 'utf8')); } catch { return fallback; }
}
export function writeState(file, data) {
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(join(stateDir, file), `${JSON.stringify(data, null, 2)}\n`);
}

// The workspace is the user's private repo (ideas, portfolio, settings). Found from STUDIO_DIR, then the pointer
// /founder:setup writes, then (Windows) the user environment, so it works without restarting terminals.
export function workspaceDir({ required = true } = {}) {
  const isolated = Boolean(process.env.FOUNDER_STATE_DIR);
  const candidates = [process.env.STUDIO_DIR, readState('state.json').workspace, isWin && !isolated ? readUserEnv('STUDIO_DIR') : ''];
  const dir = candidates.find((d) => d && existsSync(join(d, 'studio.config.json')));
  if (dir) return dir;
  if (required) fail('No workspace found. Run /founder:setup in Claude Code first.');
  return '';
}

// A product's knowledge folder: <repo>/product/, or <workspace>/products/<repo name>/product/ for products whose knowledge
// lives in the workspace (`knowledge: workspace`, chosen by /founder:adopt for public repos or repos you keep clean).
export function productDir(repoDir) {
  const inRepo = join(repoDir, 'product');
  if (existsSync(inRepo)) return inRepo;
  const ws = workspaceDir({ required: false });
  const alt = ws ? join(ws, 'products', repoDir.split(/[\\/]/).filter(Boolean).pop(), 'product') : '';
  return alt && existsSync(alt) ? alt : inRepo;
}

// studio.config.json (shared) overlaid by studio.config.local.json (this machine's paths).
export function loadConfig(dir = workspaceDir({ required: false })) {
  if (!dir) return {};
  const read = (f) => (existsSync(join(dir, f)) ? JSON.parse(readFileSync(join(dir, f), 'utf8')) : {});
  return { ...read('studio.config.json'), ...read('studio.config.local.json') };
}

export function getPath(obj, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

// Runs a program. On Windows a shell is needed for .cmd shims (npx, pnpm), so arguments are quoted; elsewhere the
// arguments go straight to the program, so nothing is globbed or expanded. With no args, `cmd` is a shell command line.
const quote = (a) => (/^[\w@%+=:,./\\*-]+$/.test(a) ? a : `"${String(a).replace(/"/g, '\\"')}"`);
export function run(cmd, args = [], { cwd, capture = false, allowFail = false, input } = {}) {
  // An open stdin pipe makes some tools (pnpm) wait forever, so stdin is only a pipe when there's input to send.
  const stdio = [input === undefined ? 'inherit' : 'pipe', capture ? 'pipe' : 'inherit', capture ? 'pipe' : 'inherit'];
  const direct = !isWin && args.length > 0;
  const line = [cmd, ...args.map(quote)].join(' ');
  const r = direct
    ? spawnSync(cmd, args, { cwd, encoding: 'utf8', input, stdio })
    : spawnSync(line, { cwd, shell: true, encoding: 'utf8', input, stdio });
  if (r.status !== 0 && !allowFail) fail(`Failed (exit ${r.status}): ${line}${capture ? `\n${r.stderr}` : ''}`);
  return { code: r.status ?? 1, out: (r.stdout ?? '').trim(), err: (r.stderr ?? '').trim() };
}

// True when a shell command line exits 0. Output is swallowed.
export const ok = (line, cwd) => spawnSync(line, { cwd, shell: true, stdio: 'ignore' }).status === 0;

// Windows environment from the registry: about 30 ms, against about 250 ms for a PowerShell call.
const expand = (v) => v.replace(/%([^%]+)%/g, (m, k) => process.env[k] ?? m);
export function readRegEnv(name, scope = 'User') {
  const key = scope === 'User' ? 'HKCU\\Environment' : 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment';
  const r = spawnSync('reg', ['query', key, '/v', name], { encoding: 'utf8' });
  const m = (r.stdout ?? '').match(new RegExp(`^\\s*${name}\\s+REG_\\w+\\s+(.*)$`, 'im'));
  return m ? expand(m[1].trim()) : '';
}
export const readUserEnv = (name) => (isWin ? readRegEnv(name, 'User') : (process.env[name] ?? ''));

export function setUserEnv(name, value) {
  process.env[name] = value;
  if (!isWin) return `Add to your shell profile: export ${name}="${value}"`;
  run('powershell', ['-NoProfile', '-Command', `[Environment]::SetEnvironmentVariable('${name}','${value.replace(/'/g, "''")}','User')`]);
  return `${name}=${value}`;
}

export function addUserPath(dir) {
  if (!isWin) return `Add to your shell profile: export PATH="${dir}:$PATH"`;
  const current = spawnSync('reg', ['query', 'HKCU\\Environment', '/v', 'Path'], { encoding: 'utf8' }).stdout?.match(/Path\s+REG_\w+\s+(.*)$/im)?.[1]?.trim() ?? '';
  if (!expand(current).toLowerCase().split(';').includes(dir.toLowerCase())) setUserEnv('Path', current ? `${current};${dir}` : dir);
  return `${dir} is on your PATH`;
}

export const step = (msg) => console.log(`\n-> ${msg}`);
export function fail(msg) {
  console.error(msg);
  process.exit(1);
}

// --flag value / --switch parsing.
export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) out._.push(a);
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[a.slice(2)] = argv[++i];
    else out[a.slice(2)] = true;
  }
  return out;
}
