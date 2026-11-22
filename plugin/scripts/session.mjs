// Starts and stops what a product needs while you work on it (product/services.json).
// Usage (from the product repo, or with --dir <repo>):
//   node session.mjs status            what's listed, and what's running
//   node session.mjs up [id ...]        start the listed services (or just these), with what they depend on
//   node session.mjs down              stop everything: listed services, leftover dev processes, Docker and WSL
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { freemem } from 'node:os';
import { join, resolve } from 'node:path';
import { fail, isWin, ok, parseArgs, platform, run } from './lib.mjs';

const args = parseArgs();
const [command, ...ids] = args._;
const dir = resolve(args.dir ?? '.');
const file = join(dir, 'product', 'services.json');
const listed = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).services ?? [] : [];
const stateDir = join(dir, '.studio');
const pidFile = join(stateDir, 'pids.json');
const pids = existsSync(pidFile) ? JSON.parse(readFileSync(pidFile, 'utf8')) : {};
const savePids = () => { mkdirSync(stateDir, { recursive: true }); writeFileSync(pidFile, JSON.stringify(pids, null, 2)); };
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Built-in services. Docker is implied by supabase and never listed on its own unless a product runs other containers.
const engineUp = () => ok('docker info --format "{{.ID}}"');
const builtins = {
  docker: {
    needs: [],
    running: engineUp,
    async start() {
      if (engineUp()) return;
      if (platform === 'mac' && ok('orb version')) run('orb', ['start']);
      else if (platform !== 'linux') run('docker', ['desktop', 'start', '--timeout', '180'], { allowFail: true });
      for (let i = 0; i < 90 && !engineUp(); i++) await sleep(2000);
      if (!engineUp()) throw new Error('Docker did not start within 3 minutes. Open Docker Desktop to see why.');
    },
    stop() {
      if (platform === 'mac' && ok('orb version')) run('orb', ['stop'], { allowFail: true });
      else if (platform !== 'linux') run('docker', ['desktop', 'stop', '--timeout', '120'], { allowFail: true, capture: true });
      if (isWin) run('wsl', ['--shutdown'], { allowFail: true });
    },
  },
  supabase: {
    needs: ['docker'],
    running: () => engineUp() && ok('pnpm exec supabase status', dir),
    start: () => run('pnpm', ['exec', 'supabase', 'start'], { cwd: dir }),
    stop: () => engineUp() && run('pnpm', ['exec', 'supabase', 'stop'], { cwd: dir, allowFail: true }),
  },
};

// A listed service: a built-in ("use"), a background command ("run"), or explicit start/stop commands.
function service(s) {
  if (s.use) return { id: s.id, ...builtins[s.use], needs: [...(builtins[s.use]?.needs ?? []), ...(s.needs ?? [])] };
  if (s.run) {
    return {
      id: s.id, needs: s.needs ?? [],
      running: () => Boolean(pids[s.id]) && alive(pids[s.id]),
      start() {
        mkdirSync(stateDir, { recursive: true });
        const log = openSync(join(stateDir, `${s.id}.log`), 'a');
        const child = spawn(s.run, { cwd: dir, shell: true, detached: true, stdio: ['ignore', log, log], windowsHide: true });
        child.unref();
        pids[s.id] = child.pid;
        savePids();
      },
      stop() {
        const pid = pids[s.id];
        if (pid && alive(pid)) {
          if (isWin) spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
          else try { process.kill(-pid); } catch { /* already gone */ }
        }
        delete pids[s.id];
        savePids();
      },
    };
  }
  return { id: s.id, needs: s.needs ?? [], running: () => (s.check ? ok(s.check, dir) : false), start: () => run(s.start, [], { cwd: dir }), stop: () => run(s.stop, [], { cwd: dir, allowFail: true }) };
}

const services = Object.fromEntries(listed.map((s) => [s.id, service(s)]));
for (const s of Object.values(services)) for (const n of s.needs) if (!services[n] && builtins[n]) services[n] = { id: n, ...builtins[n] };

// Dependency order: needs first.
function ordered(wanted) {
  const out = [];
  const visit = (id) => {
    if (out.includes(id)) return;
    if (!services[id]) throw new Error(`"${id}" isn't in product/services.json`);
    services[id].needs.forEach(visit);
    out.push(id);
  };
  wanted.forEach(visit);
  return out;
}

// Dev servers, test browsers and build watchers started from this folder that outlived their terminal.
function leftovers() {
  const names = /^(node|chrome|chromium|msedge|headless_shell|next-server|esbuild|turbo|vitest)(\.exe)?$/i;
  const protectedPids = new Set([process.pid, process.ppid]);
  let procs = [];
  if (isWin) {
    const ps = run('powershell', ['-NoProfile', '-Command', 'Get-CimInstance Win32_Process | Select-Object ProcessId,Name,CommandLine | ConvertTo-Json -Compress'], { capture: true, allowFail: true }).out;
    procs = (ps ? [].concat(JSON.parse(ps)) : []).map((p) => ({ pid: p.ProcessId, name: p.Name, cmd: p.CommandLine ?? '' }));
  } else {
    procs = run('ps', ['-eo', 'pid=,comm=,args='], { capture: true, allowFail: true }).out.split('\n').map((l) => {
      const m = l.trim().match(/^(\d+)\s+(\S+)\s+(.*)$/);
      return m && { pid: Number(m[1]), name: m[2].split('/').pop(), cmd: m[3] };
    }).filter(Boolean);
  }
  const needle = dir.toLowerCase();
  return procs.filter((p) => names.test(p.name) && p.cmd.toLowerCase().includes(needle) && !protectedPids.has(p.pid) && !/claude/i.test(p.cmd));
}

const gb = (b) => `${(b / 2 ** 30).toFixed(1)} GB`;

if (command === 'status') {
  if (!listed.length) console.log('This product lists no services, so nothing needs to run for it.');
  for (const id of Object.keys(services)) console.log(`${services[id].running() ? '●' : '○'} ${id}`);
  console.log(`Free memory: ${gb(freemem())}`);
} else if (command === 'up') {
  const order = ordered(ids.length ? ids : listed.map((s) => s.id));
  if (!order.length) console.log('Nothing to start: this product lists no services.');
  for (const id of order) {
    if (services[id].running()) { console.log(`● ${id} already running`); continue; }
    console.log(`-> starting ${id}`);
    try { await services[id].start(); } catch (e) { fail(`${id} didn't start: ${e.message}`); }
    console.log(`● ${id} running`);
  }
} else if (command === 'down') {
  const before = freemem();
  const order = ordered(Object.keys(services)).reverse();
  for (const id of order) {
    if (id === 'docker') continue; // last, after everything that runs inside it
    if (services[id].running()) { console.log(`-> stopping ${id}`); await services[id].stop(); }
  }
  const strays = leftovers();
  for (const p of strays) {
    if (isWin) spawnSync('taskkill', ['/PID', String(p.pid), '/T', '/F'], { stdio: 'ignore' });
    else try { process.kill(p.pid); } catch { /* gone */ }
  }
  if (strays.length) console.log(`-> stopped ${strays.length} leftover process(es): ${[...new Set(strays.map((p) => p.name))].join(', ')}`);
  // Docker and WSL go down even if this product doesn't list them, so nothing from any project keeps running.
  if (builtins.docker.running() || (isWin && ok('wsl --list --running --quiet'))) {
    console.log('-> stopping Docker' + (isWin ? ' and WSL' : ''));
    builtins.docker.stop();
  }
  await sleep(3000);
  const freed = freemem() - before;
  console.log(`\nEverything for this product is stopped. Free memory: ${gb(freemem())}${freed > 2 ** 28 ? ` (${gb(freed)} released)` : ''}.`);
} else {
  fail('Usage: session.mjs status | up [id ...] | down   [--dir <product repo>]');
}
