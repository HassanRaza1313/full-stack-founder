// Gathers everything /founder:ceo's brief needs in one quick pass, so no agent has to search for it.
// Usage: node brief.mjs [--all]  compact JSON: ideas, products (state, newest results, stale count, blockers), unfinished runs.
//        --all adds closed ideas, issue bodies, idea folders (score, phase) and recent learnings, for /founder:portfolio.
//
// The catalog (the workspace repo's idea issues) is the register: an idea whose metadata has `repo:` is a product.
// Each product's status lives in its own repo (product/STATE.md). It's read from the copy on this computer when there
// is one (`local:`, or <productsDir>/<repo name>), otherwise straight from GitHub. Nothing else is searched.
import { execFile } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { isWin, loadConfig, workspaceDir } from './lib.mjs';

const exec = promisify(execFile);
const all = process.argv.includes('--all');
const dir = workspaceDir();
const config = loadConfig(dir);
const read = (f) => (f && existsSync(f) ? readFileSync(f, 'utf8') : '');

async function gh(args, json = true) {
  try {
    const out = (await exec('gh', args, { shell: isWin, timeout: 20000, windowsHide: true, maxBuffer: 1 << 24 })).stdout;
    return json ? JSON.parse(out || '[]') : out;
  } catch { return null; }
}

// The `key: value` lines inside an issue's <!-- studio ... --> block.
function meta(body = '') {
  const block = (body.match(/<!--\s*studio([\s\S]*?)-->/) ?? [])[1] ?? '';
  const m = {};
  for (const line of block.split(/\r?\n/)) {
    const kv = line.match(/^\s*([\w-]+):\s*(.*?)\s*$/);
    if (kv && kv[2] && kv[2] !== '—') m[kv[1]] = kv[2];
  }
  return m;
}

// "key: value" lines at the top of STATE.md, plus the next step from "Where I left off".
function state(text) {
  const s = {};
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith('#')) break;
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv && ['stage', 'gate', 'next', 'interest', 'health', 'costs'].includes(kv[1])) s[kv[1]] = kv[2];
  }
  const left = text.match(/\*\*Next step:\*\*\s*(.+)/);
  if (left) s.leftOff = left[1].trim();
  return s;
}

// The newest dated result in a folder: its file and summary line.
function newest(folder) {
  if (!existsSync(folder)) return null;
  const files = [];
  const walk = (d, depth) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory() && depth < 2) walk(join(d, e.name), depth + 1);
      else if (/^\d{4}-\d{2}-\d{2}.*\.md$/.test(e.name)) files.push(join(d, e.name));
    }
  };
  walk(folder, 0);
  const name = (f) => f.split(/[\\/]/).pop();
  const f = files.sort((a, b) => (name(a) < name(b) ? 1 : -1))[0];
  if (!f) return null;
  return { file: f, summary: ((read(f).match(/^summary:\s*(.+)$/m) ?? [])[1] ?? '').slice(0, 200) };
}

// Runs whose latest line for a playbook stopped or failed.
function unfinished(text, target) {
  const last = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^(.+?) · (.+?) · step (\d+) (.+?) · (.+?)(?: · .*)?$/);
    if (m) last[m[2]] = { target, playbook: m[2], step: Number(m[3]), title: m[4], status: m[5], when: m[1] };
  }
  return Object.values(last).filter((r) => !r.status.startsWith('done') && !r.status.startsWith('skipped'));
}

// A file from a product's GitHub repo, for products that aren't on this computer.
async function remoteFile(repo, path) {
  const b64 = await gh(['api', `repos/${repo}/contents/${path}`, '--jq', '.content'], false);
  return b64 ? Buffer.from(b64.replace(/\s/g, ''), 'base64').toString('utf8') : '';
}

// 1. The register.
const issues = config.studioRepo
  ? await gh(['issue', 'list', '-R', config.studioRepo, '--label', 'type:idea', '--state', 'all', '--limit', '200', '--json', 'number,title,labels,updatedAt,state,body'])
  : null;
const status = (i) => (i.labels.find((l) => l.name.startsWith('status:'))?.name ?? 'status:new').slice(7);
const ended = new Set(['rejected', 'sunset', 'shelved']);
const entries = (issues ?? []).map((i) => ({ issue: i, meta: meta(i.body), status: status(i) }));

// 2. Products: each catalogued repo, read locally when it's here, otherwise from GitHub.
const products = await Promise.all(entries.filter((e) => e.meta.repo && !ended.has(e.status)).map(async ({ issue, meta: m, status: st }) => {
  const repoName = m.repo.split('/').pop();
  const local = [m.local, config.productsDir && join(config.productsDir, repoName)].find((d) => d && existsSync(join(d, 'product', 'STATE.md')));
  const p = local ? join(local, 'product') : null;
  const [stateText, runsText, blockers] = await Promise.all([
    p ? read(join(p, 'STATE.md')) : remoteFile(m.repo, 'product/STATE.md'),
    p ? read(join(p, 'runs.md')) : remoteFile(m.repo, 'product/runs.md'),
    gh(['issue', 'list', '-R', m.repo, '--state', 'open', '--label', 'launch-blocker', '--limit', '20', '--json', 'number,title']),
  ]);
  return {
    name: issue.title, slug: m.slug ?? repoName, issue: issue.number, catalogStatus: st, repo: m.repo,
    onThisComputer: Boolean(local), local: local ?? null, drive: m.drive ?? null, demo: m.demo_url ?? m.demo ?? null,
    ...(stateText ? state(stateText) : { stateMissing: true }),
    listen: p ? newest(join(p, 'listen')) : null, finance: p ? newest(join(p, 'finance')) : null, pipeline: p ? newest(join(p, 'sales', 'pipeline')) : null,
    staleResults: p ? (read(join(p, 'INDEX.md')).match(/\*\*\(stale\)\*\*/g) ?? []).length : null,
    runs: unfinished(runsText, repoName),
    blockers: blockers ?? [],
  };
}));

// 3. Ideas that aren't products yet: open ones by default. --all adds closed ideas and retired products.
const ideas = entries.filter((e) => (all ? !e.meta.repo || ended.has(e.status) : !e.meta.repo && e.issue.state === 'OPEN')).map(({ issue, meta: m, status: st }) => ({
  number: issue.number, title: issue.title, slug: m.slug ?? null, status: st, score: m.score ?? null, next: m.next ?? null,
  updated: issue.updatedAt?.slice(0, 10),
  ...(all ? { state: issue.state, labels: issue.labels.map((l) => l.name), body: (issue.body ?? '').slice(0, 800) } : {}),
}));

// 4. Idea folders in the workspace: unfinished runs, and with --all their latest score, phase and brief.
const ideasDir = join(dir, 'ideas');
const ideaNames = existsSync(ideasDir) ? readdirSync(ideasDir, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('_')).map((e) => e.name) : [];
const ideaRuns = ideaNames.flatMap((n) => unfinished(read(join(ideasDir, n, 'runs.md')), n));
const ideaFolders = !all ? undefined : ideaNames.map((n) => {
  const it = join(ideasDir, n, 'iterations');
  const vs = existsSync(it) ? readdirSync(it).filter((v) => /^v\d+$/.test(v)).sort((x, y) => Number(y.slice(1)) - Number(x.slice(1))) : [];
  const card = vs.map((v) => read(join(it, v, 'scorecard.md'))).find(Boolean) ?? '';
  const score = (card.match(/(\d+)\s*\/\s*40/) ?? [])[1];
  const phase = (read(join(ideasDir, n, 'PROGRESS.md')).split(/\r?\n/).find((l) => l.trim() && !l.startsWith('#') && !l.startsWith('---')) ?? '').slice(0, 160);
  return { slug: n, version: vs[0] ?? null, score: score ? Number(score) : null, phase: phase || null, brief: existsSync(join(ideasDir, n, '00-intake', 'brief.md')), moved: existsSync(join(ideasDir, n, 'MOVED.md')) };
});
const learnings = !all ? undefined : read(join(dir, 'LEARNINGS.md')).split(/\r?\n/).filter((l) => l.startsWith('- ')).slice(-5);

console.log(JSON.stringify({
  date: new Date().toLocaleDateString('en-CA'),
  workspace: dir, studioRepo: config.studioRepo ?? null,
  ghOk: issues !== null,
  counts: { products: products.length, ideas: ideas.length, notOnThisComputer: products.filter((p) => !p.onThisComputer).length, unfinishedRuns: ideaRuns.length + products.reduce((n, p) => n + p.runs.length, 0) },
  products, ideas, ideaRuns, ideaFolders, learnings,
}, null, 1));
