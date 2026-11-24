// Gathers everything /founder:ceo's brief needs in one quick pass, so no agent has to search for it.
// Usage: node brief.mjs [--all]  compact JSON: ideas, products (state, newest results, stale count, blockers), unfinished runs.
//        --all adds closed ideas, issue bodies, idea folders (score, phase) and recent learnings, for /founder:portfolio.
//
// One source for status, so every computer gives the same brief:
// - The catalog (the workspace repo's idea issues) is the register: an idea whose metadata has `repo:` is a product.
// - Each product's status is read from GitHub: product/STATE.md and friends at the default branch (two calls per product).
// - The copy on this computer (<productsDir>/<repo name>) is only checked for sync: changes not pushed yet, commits
//   not pulled yet. It's used for status only when GitHub can't be reached, and then it says so.
import { execFile, spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { isWin, loadConfig, workspaceDir } from './lib.mjs';

const exec = promisify(execFile);
const all = process.argv.includes('--all');
const dir = workspaceDir();
const config = loadConfig(dir);
const read = (f) => (f && existsSync(f) ? readFileSync(f, 'utf8') : '');
const quote = (a) => (/^[\w@%+=:,./\\-]+$/.test(a) ? a : `"${String(a).replace(/"/g, '\\"')}"`);

// gh, with an optional stdin. On Windows a shell finds gh's shims, so arguments are quoted.
function gh(args, { json = true, input } = {}) {
  return new Promise((done) => {
    const child = spawn(isWin ? `gh ${args.map(quote).join(' ')}` : 'gh', isWin ? [] : args, { shell: isWin, windowsHide: true });
    let out = '';
    const timer = setTimeout(() => child.kill(), 20000);
    child.stdout.on('data', (d) => { out += d; });
    child.on('error', () => { clearTimeout(timer); done(null); });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) return done(null);
      try { done(json ? JSON.parse(out || '[]') : out); } catch { done(null); }
    });
    if (input) child.stdin.end(input); else child.stdin.end();
  });
}
const graphql = (query, variables) => gh(['api', 'graphql', '--input', '-'], { input: JSON.stringify({ query, variables }) }).then((r) => r?.data ?? null);
const git = async (cwd, args, timeout = 15000) => {
  try { return (await exec('git', ['-C', cwd, ...args], { timeout, windowsHide: true })).stdout; } catch { return null; }
};

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
    if (kv && ['stage', 'gate', 'next', 'interest', 'health', 'costs', 'ready'].includes(kv[1])) s[kv[1]] = kv[2];
  }
  const left = text.match(/\*\*Next step:\*\*\s*(.+)/);
  if (left) s.leftOff = left[1].trim();
  const last = text.match(/\*\*Last session:\*\*\s*(\d{4}-\d{2}-\d{2})/);
  if (last) s.lastSession = last[1];
  return s;
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

const summaryOf = (text) => ((text.match(/^summary:\s*(.+)$/m) ?? [])[1] ?? '').slice(0, 200);
const stale = (text) => (text.match(/\*\*\(stale\)\*\*/g) ?? []).length;
const dated = (n) => /^\d{4}-\d{2}-\d{2}.*\.md$/.test(n);
const FOLDERS = { listen: 'listen', finance: 'finance', pipeline: 'sales/pipeline' };

// A product's status from GitHub: one call for the files and folder listings, one for the newest results' summaries.
const TREE = 'fragment T on Tree { entries { name type object { ... on Tree { entries { name type } } } } }';
// `base` is the knowledge folder inside that repo: product/ in the product repo, or products/<repo>/product in the workspace.
async function fromGitHub(repo, base = 'product') {
  const [owner, name] = repo.split('/');
  const blob = (alias, path) => `${alias}: object(expression: "HEAD:${path}") { ... on Blob { text } }`;
  const tree = (alias, path) => `${alias}: object(expression: "HEAD:${path}") { ...T }`;
  const q1 = `query($owner: String!, $name: String!) { repository(owner: $owner, name: $name) {
    ${blob('state', `${base}/STATE.md`)} ${blob('runs', `${base}/runs.md`)} ${blob('index', `${base}/INDEX.md`)}
    ${Object.entries(FOLDERS).map(([k, p]) => tree(k, `${base}/${p}`)).join(' ')} } } ${TREE}`;
  const r = (await graphql(q1, { owner, name }))?.repository;
  if (!r) return null;
  // The newest dated file in each folder, one level of subfolders deep (names start with their date).
  const newestPath = (k) => {
    const files = [];
    for (const e of r[k]?.entries ?? []) {
      if (e.type === 'blob' && dated(e.name)) files.push(`${base}/${FOLDERS[k]}/${e.name}`);
      for (const s of e.object?.entries ?? []) if (s.type === 'blob' && dated(s.name)) files.push(`${base}/${FOLDERS[k]}/${e.name}/${s.name}`);
    }
    return files.sort((a, b) => (a.split('/').pop() < b.split('/').pop() ? 1 : -1))[0] ?? null;
  };
  const paths = Object.fromEntries(Object.keys(FOLDERS).map((k) => [k, newestPath(k)]));
  const wanted = Object.entries(paths).filter(([, p]) => p);
  const r2 = wanted.length
    ? (await graphql(`query($owner: String!, $name: String!) { repository(owner: $owner, name: $name) { ${wanted.map(([k, p]) => blob(k, p.replace(/"/g, '\\"'))).join(' ')} } }`, { owner, name }))?.repository ?? {}
    : {};
  const result = (k) => (paths[k] ? { file: `https://github.com/${repo}/blob/HEAD/${paths[k]}`, summary: summaryOf(r2[k]?.text ?? '') } : null);
  return {
    stateText: r.state?.text ?? '', runsText: r.runs?.text ?? '', staleResults: stale(r.index?.text ?? ''),
    listen: result('listen'), finance: result('finance'), pipeline: result('pipeline'),
  };
}

// The same, from the copy on this computer: used only when GitHub can't be reached.
function fromLocal(p) {
  const newest = (folder) => {
    if (!existsSync(folder)) return null;
    const files = [];
    for (const e of readdirSync(folder, { withFileTypes: true })) {
      if (e.isFile() && dated(e.name)) files.push(join(folder, e.name));
      if (e.isDirectory()) for (const s of readdirSync(join(folder, e.name))) if (dated(s)) files.push(join(folder, e.name, s));
    }
    const f = files.sort((a, b) => (a.split(/[\\/]/).pop() < b.split(/[\\/]/).pop() ? 1 : -1))[0];
    return f ? { file: f, summary: summaryOf(read(f)) } : null;
  };
  return {
    stateText: read(join(p, 'STATE.md')), runsText: read(join(p, 'runs.md')), staleResults: stale(read(join(p, 'INDEX.md'))),
    listen: newest(join(p, 'listen')), finance: newest(join(p, 'finance')), pipeline: newest(join(p, 'sales', 'pipeline')),
  };
}

// How the copy on this computer differs from GitHub: changes not committed, commits not pushed, commits not pulled.
async function sync(local) {
  const fetched = (await git(local, ['fetch', '--quiet'])) !== null;
  const status = await git(local, ['status', '--porcelain=v1', '--branch'], 5000);
  if (status === null) return null;
  const [head, ...rest] = status.split(/\r?\n/).filter(Boolean);
  const n = (word) => Number((head.match(new RegExp(`${word} (\\d+)`)) ?? [])[1] ?? 0);
  return { uncommitted: rest.length, unpushed: n('ahead'), notPulled: fetched ? n('behind') : null, inSync: rest.length === 0 && n('ahead') === 0 && (!fetched || n('behind') === 0) };
}

// 1. The register.
const issues = config.studioRepo
  ? await gh(['issue', 'list', '-R', config.studioRepo, '--label', 'type:idea', '--state', 'all', '--limit', '200', '--json', 'number,title,labels,updatedAt,state,body'])
  : null;
const status = (i) => (i.labels.find((l) => l.name.startsWith('status:'))?.name ?? 'status:new').slice(7);
const ended = new Set(['rejected', 'sunset', 'shelved']); // A closed catalog issue also retires a product.
const entries = (issues ?? []).map((i) => ({ issue: i, meta: meta(i.body), status: status(i) }));

// 2. Products: status from GitHub; the local copy only for sync, or as the fallback when offline.
// A product is an idea with a GitHub repo (`repo:`), or adopted from a folder with no repo yet (`local:`, its name in the
// products folder; its knowledge always lives in the workspace).
const isProduct = (m) => Boolean(m.repo || m.local);
const products = await Promise.all(entries.filter((e) => isProduct(e.meta) && !ended.has(e.status) && e.issue.state === 'OPEN').map(async ({ issue, meta: m, status: st }) => {
  const repoName = m.repo ? m.repo.split('/').pop() : m.local;
  const local = config.productsDir && existsSync(join(config.productsDir, repoName, '.git')) ? join(config.productsDir, repoName) : null;
  // Knowledge in the workspace (public repos, or repos kept clean): read it from the workspace repo instead.
  const inWorkspace = m.knowledge === 'workspace' || !m.repo;
  const [kRepo, kBase] = inWorkspace ? [config.studioRepo, `products/${repoName}/product`] : [m.repo, 'product'];
  const kLocal = inWorkspace ? join(dir, 'products', repoName, 'product') : local && join(local, 'product');
  const [remote, localSync, blockers] = await Promise.all([
    fromGitHub(kRepo, kBase),
    local ? sync(local) : null,
    m.repo ? gh(['issue', 'list', '-R', m.repo, '--state', 'open', '--label', 'launch-blocker', '--limit', '20', '--json', 'number,title']) : [],
  ]);
  const src = remote ?? (kLocal && existsSync(kLocal) ? fromLocal(kLocal) : null);
  const media = m.drive && config.driveRoot ? join(config.driveRoot, m.drive) : null;
  return {
    name: issue.title, slug: m.slug ?? repoName, issue: issue.number, catalogStatus: st, repo: m.repo ?? null, localOnly: !m.repo,
    source: remote ? 'github' : src ? 'this computer (GitHub unreachable)' : 'unavailable', knowledge: inWorkspace ? 'workspace' : 'repo',
    ...(src?.stateText ? state(src.stateText) : { stateMissing: true }),
    listen: src?.listen ?? null, finance: src?.finance ?? null, pipeline: src?.pipeline ?? null,
    staleResults: src?.staleResults ?? null,
    runs: unfinished(src?.runsText ?? '', repoName),
    blockers: blockers ?? [],
    onThisComputer: Boolean(local), sync: localSync,
    media: media && existsSync(media) ? media : null, demo: m.demo_url ?? m.demo ?? null,
  };
}));

// 3. Ideas that aren't products yet: open ones by default. --all adds closed ideas and retired products.
const ideas = entries.filter((e) => (all ? !isProduct(e.meta) || ended.has(e.status) || e.issue.state !== 'OPEN' : !isProduct(e.meta) && e.issue.state === 'OPEN')).map(({ issue, meta: m, status: st }) => ({
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
  counts: {
    products: products.length, ideas: ideas.length,
    outOfSync: products.filter((p) => p.sync && !p.sync.inSync).length,
    offline: products.filter((p) => p.source.startsWith('this computer')).length,
    unavailable: products.filter((p) => p.source === 'unavailable').length,
    unfinishedRuns: ideaRuns.length + products.reduce((n, p) => n + p.runs.length, 0),
  },
  products, ideas, ideaRuns, ideaFolders, learnings,
}, null, 1));
