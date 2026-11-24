// Checks (and with --fix, installs) everything in requirements.json.
// Usage: node doctor.mjs [--stage ideas|build|showcase|graduate] [--product <dir>] [--only id,id] [--fix] [--json [--all] | --quiet]
// --quiet is for flow gates: one line, and items that passed in the last 7 days aren't re-checked (--fresh re-checks all).
// --json lists only what's missing, for /founder:setup. Plain output is the full checklist.
// Exit code 0 when every required item for the stage is in place, 2 otherwise.
import { exec } from 'node:child_process';
import { promises as dns } from 'node:dns';
import { existsSync, mkdirSync, readdirSync, readFileSync, statfsSync, writeFileSync } from 'node:fs';
import { homedir, totalmem } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { addUserPath, getPath, isWin, loadConfig, ok, parseArgs, platform, productDir, readRegEnv, readState, readUserEnv, run, setUserEnv, workspaceDir, writeState } from './lib.mjs';

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reqs = JSON.parse(readFileSync(join(pluginRoot, 'requirements.json'), 'utf8'));
const stageNames = Object.keys(reqs.stages);
const args = parseArgs();
const target = args.stage ?? 'build';
if (!stageNames.includes(target)) throw new Error(`--stage must be one of ${stageNames.join(', ')}`);

let config = loadConfig();
const claudeSettingsPath = join(homedir(), '.claude', 'settings.json');

// Windows: pick up PATH changes from installs made after this terminal opened.
function refreshPath() {
  if (!isWin) return;
  process.env.Path = [readRegEnv('Path', 'Machine'), readUserEnv('Path'), process.env.Path].filter(Boolean).join(';');
}
refreshPath();

function vars() {
  const toolsDir = config.toolsDir ?? '';
  const dockerDir = config.dockerDir ?? (toolsDir ? join(toolsDir, '..', 'Docker') : '');
  return { ...config, toolsDir, dockerDir, home: homedir(), pluginRoot };
}
// Replaces {{key}} with config values. Returns null when any value is empty, so callers can skip the line.
function render(text) {
  let empty = false;
  const out = text.replace(/\{\{([\w.]+)\}\}/g, (_, k) => {
    const v = getPath(vars(), k);
    if (v === undefined || v === '') empty = true;
    return v ?? '';
  });
  return empty ? null : out;
}
const renderObj = (o) => JSON.parse(JSON.stringify(o), (_, v) => (typeof v === 'string' ? (render(v) ?? '') : v));

// Products (and so services) this machine has: each <productsDir>/* repo's services.json, from its knowledge folder
// (in the repo, or in the workspace for products adopted with `knowledge: workspace`).
function productServices() {
  const dirs = args.product ? [resolve(args.product)] : [];
  if (!args.product && config.productsDir && existsSync(config.productsDir)) {
    for (const d of readdirSync(config.productsDir, { withFileTypes: true })) if (d.isDirectory()) dirs.push(join(config.productsDir, d.name));
  }
  const byService = {};
  for (const dir of dirs) {
    const file = join(productDir(dir), 'services.json');
    if (!existsSync(file)) continue;
    for (const s of JSON.parse(readFileSync(file, 'utf8')).services ?? []) {
      for (const id of [s.id, s.use, ...(s.use === 'supabase' ? ['docker'] : [])].filter(Boolean)) (byService[id] ??= []).push(dir.split(/[\\/]/).pop());
    }
  }
  return byService;
}
const services = productServices();

function applies(item) {
  const w = item.when ?? {};
  if (w.platform && w.platform !== platform) return { applies: false };
  if (w.config && !getPath(config, w.config)) return { applies: false };
  if (w.service) {
    const users = services[w.service];
    return users ? { applies: true, note: `needed by ${[...new Set(users)].join(', ')}` } : { applies: false, note: 'only for products that need it' };
  }
  return { applies: true };
}

// --- Checks ---------------------------------------------------------------------
const skillDir = join(homedir(), '.claude', 'skills');
const claudeEnv = () => (existsSync(claudeSettingsPath) ? JSON.parse(readFileSync(claudeSettingsPath, 'utf8')).env ?? {} : {});
const norm = (p) => resolve(p).toLowerCase();
// Checks run concurrently, so a fresh check takes about as long as the slowest single command.
const sh = (line) => new Promise((res) => exec(line, { windowsHide: true, timeout: 20000 }, (err, stdout) => res({ ok: !err, out: String(stdout ?? '').trim() })));
const okAsync = async (line) => (await sh(line)).ok;
let pluginListPromise;

const checks = {
  cmd: async (c) => (c.equals === undefined ? okAsync(c.cmd) : (await sh(c.cmd)).out === c.equals),
  nodeVersion: (c) => Number(process.versions.node.split('.')[0]) >= c.min,
  machine(c) {
    const ram = totalmem() / 2 ** 30;
    const disk = config.productsDir && existsSync(config.productsDir) ? config.productsDir : homedir();
    const s = statfsSync(disk);
    const free = (s.bavail * s.bsize) / 2 ** 30;
    const note = `${ram.toFixed(0)} GB RAM${ram < c.goodRamGb ? ' (works; 16 GB is comfortable)' : ''}, ${free.toFixed(0)} GB free on ${disk}`;
    return { ok: ram >= c.minRamGb && free >= c.minFreeGb, note };
  },
  npmPrefixUnder: async (c) => norm((await sh('npm config get prefix')).out || '.').startsWith(norm(c.dir)),
  workspace: () => Boolean(workspaceDir({ required: false })),
  ghLabel: async (c) => Boolean(c.repo) && (await sh(`gh label list --repo ${c.repo} --search ${c.label} --json name`)).out.includes(`"${c.label}"`),
  claudeEnv: (c) => claudeEnv()[c.key] === c.value,
  // Skills, plus an optional command that must also work (a CLI and the skill that teaches Claude to use it).
  skills: async (c) => {
    const missing = c.names.filter((n) => !existsSync(join(skillDir, n, 'SKILL.md')));
    if (c.alsoCmd && !(await okAsync(c.alsoCmd))) missing.push(c.alsoCmd.split(' ')[0]);
    return { ok: missing.length === 0, note: missing.length ? `missing: ${missing.join(', ')}` : '' };
  },
  async plugin(c) {
    pluginListPromise ??= sh('claude plugin list --json').then((r) => { try { return JSON.parse(r.out || '[]'); } catch { return []; } });
    return (await pluginListPromise).some((p) => p.id.split('@')[0] === c.name && p.enabled);
  },
  // User-scope MCP servers live in ~/.claude.json: reading it is instant, while `claude mcp get` takes seconds.
  mcp(c) {
    try { if (JSON.parse(readFileSync(join(homedir(), '.claude.json'), 'utf8')).mcpServers?.[c.name]) return true; } catch { /* fall through */ }
    return okAsync(`claude mcp get ${c.name}`);
  },
  userEnv: (c) => c.names.every((n) => readUserEnv(n)),
  wslConfig: () => existsSync(join(homedir(), '.wslconfig')),
  configSet: (c) => Boolean(getPath(config, c.key)),
  configAny: (c) => c.keys.some((k) => Boolean(getPath(config, k))),
  configPath: (c) => Boolean(getPath(config, c.key)) && existsSync(getPath(config, c.key)),
  // A registered domain has nameservers, even before any site is deployed on it.
  async domain(c) {
    const d = getPath(config, c.key);
    if (!d) return false;
    return dns.resolveNs(d).then(() => ({ ok: true, note: d }), () => ({ ok: false, note: `${d} isn't registered yet` }));
  },
  async nameservers(c) {
    const d = getPath(config, c.key);
    if (!d) return false;
    return dns.resolveNs(d).then((ns) => ns.some((n) => n.includes(c.contains)), () => false);
  },
};

// --- Fixes ----------------------------------------------------------------------
const fixes = {
  cmd: (f) => run(f.cmd),
  moveNpmPrefix(f) {
    mkdirSync(f.dir, { recursive: true });
    run('npm', ['config', 'set', 'prefix', f.dir]);
    addUserPath(isWin ? f.dir : join(f.dir, 'bin'));
  },
  gitIdentity() {
    const u = JSON.parse(run('gh', ['api', 'user'], { capture: true }).out);
    if (!ok('git config --global user.name')) run('git', ['config', '--global', 'user.name', u.name || u.login]);
    if (!ok('git config --global user.email')) run('git', ['config', '--global', 'user.email', `${u.id}+${u.login}@users.noreply.github.com`]);
  },
  createLabels(f) {
    for (const l of JSON.parse(readFileSync(join(pluginRoot, f.file), 'utf8'))) {
      run('gh', ['label', 'create', l.name, '--repo', f.repo, '--color', l.color, '--description', l.description, '--force']);
    }
  },
  claudeEnv(f) {
    const s = existsSync(claudeSettingsPath) ? JSON.parse(readFileSync(claudeSettingsPath, 'utf8')) : {};
    s.env = { ...s.env, [f.key]: f.value };
    mkdirSync(dirname(claudeSettingsPath), { recursive: true });
    writeFileSync(claudeSettingsPath, `${JSON.stringify(s, null, 2)}\n`);
  },
  // One call per source (one download), pinned with owner/repo@<tag>.
  installSkills(f) {
    for (const [source, names] of Object.entries(f.sources)) {
      const todo = names.filter((n) => !existsSync(join(skillDir, n, 'SKILL.md')));
      if (todo.length) run('npx', ['-y', 'skills', 'add', source, ...todo.flatMap((n) => ['--skill', n]), '--global', '--agent', 'claude-code', '--yes']);
    }
  },
  userEnv: (f) => Object.entries(f.values).forEach(([k, v]) => setUserEnv(k, resolve(v))),
  wslConfig() {
    const gb = Math.min(12, Math.max(2, Math.floor((totalmem() / 2 ** 30) * 0.375)));
    const { dockerDir } = vars();
    const swap = dockerDir ? `swapFile=${resolve(dockerDir, 'wsl-swap.vhdx').replace(/\\/g, '\\\\')}\n` : '';
    writeFileSync(join(homedir(), '.wslconfig'), `[wsl2]\nmemory=${gb}GB\nswap=2GB\n${swap}\n[experimental]\nautoMemoryReclaim=gradual\nsparseVhd=true\n`);
  },
  winget(f) {
    const loc = config.toolsDir && f.toolsSub ? ['--location', join(config.toolsDir, f.toolsSub)] : [];
    run('winget', ['install', '--id', f.id, '-e', '--source', 'winget', '--accept-source-agreements', '--accept-package-agreements', ...loc]);
  },
};

const fixFor = (item) => {
  const f = item.fix && (item.fix.fn ? item.fix : (item.fix[platform] ?? item.fix.all));
  if (!f) return null;
  return typeof f === 'string' ? { fn: 'cmd', cmd: render(f) ?? f } : renderObj(f);
};
const manualFor = (item) => {
  const m = Array.isArray(item.manual) ? item.manual : (item.manual?.[platform] ?? []);
  return m.map(render).filter((line) => line !== null);
};

// --- Run ------------------------------------------------------------------------
async function evaluate(item) {
  const scope = applies(item);
  const base = {
    id: item.id, stage: item.stage, title: render(item.title) ?? item.title, why: item.why, cost: item.cost, url: item.url,
    needs: item.needs ?? [], auto: Boolean(fixFor(item)), manual: manualFor(item),
  };
  if (!scope.applies) return { ...base, status: 'n/a', note: scope.note };
  if (!item.check) return { ...base, status: 'reminder', note: scope.note };
  if (useCache && cache[item.id] > Date.now() - CACHE_MS) return { ...base, status: 'ok', note: scope.note, cached: true };
  const c = renderObj(item.check);
  let r;
  const t0 = Date.now();
  try {
    r = await checks[c.fn ?? 'cmd'](c);
  } catch (e) {
    r = { ok: false, note: e.message };
  }
  if (args.timing) console.error(`${String(Date.now() - t0).padStart(6)} ms  ${item.id}`);
  const res = typeof r === 'object' ? r : { ok: r };
  return { ...base, status: res.ok ? 'ok' : 'missing', note: [scope.note, res.note].filter(Boolean).join('; ') };
}

// Gates trust items that passed recently, so a flow starts in well under a second; failures are always re-checked.
const CACHE_MS = 7 * 24 * 3600 * 1000;
const cache = readState('doctor-cache.json');
let useCache = Boolean(args.quiet) && !args.fresh;
const saveCache = (list) => {
  for (const r of list) if (r.status === 'ok' && !r.cached) cache[r.id] = Date.now(); else if (r.status === 'missing') delete cache[r.id];
  writeState('doctor-cache.json', cache);
};

const only = args.only ? String(args.only).split(',') : null;
const inScope = reqs.items.filter((i) => stageNames.indexOf(i.stage) <= stageNames.indexOf(target) && (!only || only.includes(i.id)));
const evaluateAll = () => Promise.all(inScope.map(evaluate));

let results = await evaluateAll();

if (args.fix) {
  // Items that don't apply here (another platform, an unused service) count as satisfied for dependencies.
  const done = new Set(results.filter((r) => r.status === 'ok' || r.status === 'n/a').map((r) => r.id));
  for (const r of results) {
    if (r.status !== 'missing' || !r.auto) continue;
    const blocked = r.needs.filter((n) => !done.has(n) && inScope.some((i) => i.id === n));
    if (blocked.length) {
      console.log(`\n-- Skipping ${r.title}: needs ${blocked.join(', ')} first`);
      continue;
    }
    console.log(`\n-> ${r.title}`);
    try {
      fixes[fixFor(inScope.find((i) => i.id === r.id)).fn](fixFor(inScope.find((i) => i.id === r.id)));
      done.add(r.id);
    } catch (e) {
      console.log(`   failed: ${e.message}`);
    }
    refreshPath();
    config = loadConfig();
    pluginListPromise = undefined;
  }
  useCache = false;
  results = await evaluateAll();
}
saveCache(results);

const required = results.filter((r) => r.status === 'missing');
const counts = Object.fromEntries(['ok', 'missing', 'reminder', 'n/a'].map((s) => [s, results.filter((r) => r.status === s).length]));
if (args.quiet) {
  // For flow gates: one line when ready; otherwise just what's missing.
  console.log(required.length ? `Missing for "${target}": ${required.map((r) => `${r.id} (${r.auto ? 'automatic' : 'you'})`).join(', ')}` : `Ready for ${target}.`);
} else if (args.json) {
  // Compact: only what needs doing (plus reminders with --all), without empty fields.
  const show = results.filter((r) => r.status === 'missing' || (args.all && r.status !== 'ok'));
  const slim = show.map(({ needs, manual, ...r }) => ({ ...r, ...(manual.length && { manual }), ...(needs.length && { needs }) }));
  console.log(JSON.stringify({ stage: target, ready: required.length === 0, counts, items: slim }));
} else {
  const icon = { ok: '✓', missing: '✗', 'n/a': '·', reminder: '○' };
  for (const stage of stageNames.slice(0, stageNames.indexOf(target) + 1)) {
    console.log(`\n${reqs.stages[stage]}`);
    for (const r of results.filter((x) => x.stage === stage)) {
      const who = r.status === 'missing' ? (r.auto ? (r.manual.length ? '  [automatic, then you]' : '  [automatic]') : '  [you]') : '';
      console.log(`  ${icon[r.status]} ${r.title}${who}${r.note ? `  (${r.note})` : ''}`);
    }
  }
  console.log(required.length ? `\n${required.length} to do before "${reqs.stages[target]}".` : `\nReady for: ${reqs.stages[target]}.`);
}
process.exit(required.length ? 2 : 0);
