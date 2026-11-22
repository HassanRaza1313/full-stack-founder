// Gathers everything /founder:ceo's brief needs in one quick pass, so no agent has to search for it.
// Usage: node brief.mjs [--all]  compact JSON: ideas, products (state, newest results, stale count, blockers), unfinished runs.
//        --all adds closed ideas, issue bodies, idea folders (score, phase) and recent learnings, for /founder:portfolio.
// Reads only. Looks one level deep in the products folder, never the whole drive.
import { execFile } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { isWin, loadConfig, workspaceDir } from './lib.mjs';

const exec = promisify(execFile);
const all = process.argv.includes('--all');
const dir = workspaceDir();
const config = loadConfig(dir);
const read = (f) => (existsSync(f) ? readFileSync(f, 'utf8') : '');

async function gh(args) {
  try { return JSON.parse((await exec('gh', args, { shell: isWin, timeout: 20000, windowsHide: true })).stdout || '[]'); } catch { return null; }
}

// "key: value" lines at the top of STATE.md, plus the next step from "Where I left off".
function state(text) {
  const s = {};
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith('#')) break;
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv && ['stage', 'gate', 'next', 'interest', 'health', 'costs'].some((k) => kv[1].startsWith(k))) s[kv[1].split(' ')[0]] = kv[2];
  }
  const left = text.match(/\*\*Next step:\*\*\s*(.+)/);
  if (left) s.leftOff = left[1].trim();
  return s;
}

// The newest dated result in a folder: its date, file and summary line.
function newest(folder) {
  if (!existsSync(folder)) return null;
  const files = [];
  const walk = (d, depth) => { for (const e of readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory() && depth < 2) walk(join(d, e.name), depth + 1);
    else if (/^\d{4}-\d{2}-\d{2}.*\.md$/.test(e.name)) files.push(join(d, e.name));
  } };
  walk(folder, 0);
  const f = files.sort((a, b) => (a.split(/[\\/]/).pop() < b.split(/[\\/]/).pop() ? 1 : -1))[0];
  if (!f) return null;
  const summary = (read(f).match(/^summary:\s*(.+)$/m) ?? [])[1] ?? '';
  return { file: f, summary: summary.slice(0, 200) };
}

// Runs whose latest line for a playbook stopped or failed.
function unfinished(file, target) {
  const last = {};
  for (const line of read(file).split(/\r?\n/)) {
    const m = line.match(/^(.+?) · (.+?) · step (\d+) (.+?) · (.+?)(?: · .*)?$/);
    if (m) last[m[2]] = { target, playbook: m[2], step: Number(m[3]), title: m[4], status: m[5], when: m[1] };
  }
  return Object.values(last).filter((r) => !r.status.startsWith('done') && !r.status.startsWith('skipped'));
}

const productsDir = config.productsDir;
const productDirs = productsDir && existsSync(productsDir)
  ? readdirSync(productsDir, { withFileTypes: true }).filter((e) => e.isDirectory() && existsSync(join(productsDir, e.name, 'product', 'STATE.md'))).map((e) => join(productsDir, e.name))
  : [];

const products = productDirs.map((repo) => {
  const p = join(repo, 'product');
  const text = read(join(p, 'STATE.md'));
  const remote = (text.match(/repo https:\/\/github\.com\/([\w.-]+\/[\w.-]+)/) ?? [])[1];
  return {
    name: repo.split(/[\\/]/).pop(), repo: remote ?? null, ...state(text),
    listen: newest(join(p, 'listen')), finance: newest(join(p, 'finance')), pipeline: newest(join(p, 'sales', 'pipeline')),
    staleResults: (read(join(p, 'INDEX.md')).match(/\*\*\(stale\)\*\*/g) ?? []).length,
    runs: unfinished(join(p, 'runs.md'), repo.split(/[\\/]/).pop()),
  };
});

const ideasDir = join(dir, 'ideas');
const ideaNames = existsSync(ideasDir) ? readdirSync(ideasDir, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('_')).map((e) => e.name) : [];
const ideaRuns = ideaNames.flatMap((n) => unfinished(join(ideasDir, n, 'runs.md'), n));
// Each idea folder's latest score (the newest iterations/v<n>/scorecard.md) and its discovery phase.
const ideaFolders = !all ? undefined : ideaNames.map((n) => {
  const it = join(ideasDir, n, 'iterations');
  const vs = existsSync(it) ? readdirSync(it).filter((v) => /^v\d+$/.test(v)).sort((x, y) => Number(y.slice(1)) - Number(x.slice(1))) : [];
  const card = vs.map((v) => read(join(it, v, 'scorecard.md'))).find(Boolean) ?? '';
  const score = (card.match(/(\d+)\s*\/\s*40/) ?? [])[1];
  const phase = (read(join(ideasDir, n, 'PROGRESS.md')).split(/\r?\n/).find((l) => l.trim() && !l.startsWith('#') && !l.startsWith('---')) ?? '').slice(0, 160);
  return { slug: n, version: vs[0] ?? null, score: score ? Number(score) : null, phase: phase || null, brief: existsSync(join(ideasDir, n, '00-intake', 'brief.md')) };
});
const learnings = !all ? undefined : read(join(dir, 'LEARNINGS.md')).split(/\r?\n/).filter((l) => l.startsWith('- ')).slice(-5);

const [issues, ...blockers] = await Promise.all([
  config.studioRepo ? gh(['issue', 'list', '-R', config.studioRepo, '--state', all ? 'all' : 'open', '--limit', '200', '--json', all ? 'number,title,labels,updatedAt,state,body' : 'number,title,labels,updatedAt']) : null,
  ...products.map((p) => (p.repo ? gh(['issue', 'list', '-R', p.repo, '--state', 'open', '--label', 'launch-blocker', '--limit', '20', '--json', 'number,title']) : null)),
]);
products.forEach((p, i) => { p.blockers = blockers[i] ?? []; });

const ideas = (issues ?? []).map((i) => ({
  number: i.number, title: i.title, updated: i.updatedAt?.slice(0, 10),
  status: (i.labels.find((l) => l.name.startsWith('status:'))?.name ?? 'status:new').slice(7),
  ...(all ? { state: i.state, labels: i.labels.map((l) => l.name), body: (i.body ?? '').slice(0, 800) } : {}),
}));

console.log(JSON.stringify({
  date: new Date().toLocaleDateString('en-CA'),
  workspace: dir, studioRepo: config.studioRepo ?? null, productsDir: productsDir ?? null,
  counts: { products: products.length, ideas: ideas.length, unfinishedRuns: ideaRuns.length + products.reduce((n, p) => n + p.runs.length, 0) },
  ideas, products, ideaRuns, ideaFolders, learnings,
  ghOk: issues !== null,
}, null, 1));
