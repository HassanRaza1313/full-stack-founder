// Brings an existing codebase into Full Stack Founder without restructuring it. The code can be a GitHub repo or a folder
// on this computer (with or without a GitHub repo). It gets one home in the products folder, a catalog entry, a knowledge
// folder from the template, product labels, a media folder, and its own install, run and test commands. Other copies on
// this computer are found; with --consolidate, their local-only files (data, settings, specs) join the main copy and the
// copies are moved aside, never deleted. The code itself is never changed. /founder:adopt does the rest.
//
// Usage: node adopt.mjs (--repo owner/name | --path <folder>) [--knowledge repo|workspace] [--name "Product Name"] [--slug s]
//                       [--from-idea <slug>] [--in-place] [--consolidate] [--create-repo] [--no-labels] [--dry-run]
//   --repo         a GitHub repo (or its https://github.com/... address)
//   --path         a folder on this computer; a GitHub remote is picked up from it
//   --knowledge    where product/ lives: in the repo, or in the workspace at products/<name>/ (default for public repos and
//                  for folders with no GitHub repo, so research, pricing and plans stay private)
//   --in-place     leave a --path folder where it is (by default it moves into the products folder)
//   --consolidate  merge the other copies this computer has (see above)
//   --create-repo  for a folder with no GitHub repo: create a private one and push to it
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, join, parse, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, loadConfig, parseArgs, run, step, workspaceDir } from './lib.mjs';

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = parseArgs();
const usage = 'Usage: adopt.mjs (--repo owner/name | --path <folder>) [--knowledge repo|workspace] [--name "Product Name"] [--slug s] [--from-idea <slug>] [--in-place] [--consolidate] [--create-repo] [--no-labels] [--dry-run]';
const studio = workspaceDir();
const config = loadConfig(studio);
const dry = Boolean(args['dry-run']);
const today = new Date().toLocaleDateString('en-CA');
const git = (cwd, ...a) => { const r = spawnSync('git', ['-C', cwd, ...a], { encoding: 'utf8' }); return r.status === 0 ? r.stdout.trim() : null; };
const ghRepoOf = (url) => (url ?? '').match(/github\.com[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/)?.[1] ?? null;
const sameDrive = (a, b) => parse(resolve(a)).root.toLowerCase() === parse(resolve(b)).root.toLowerCase();

// 1. The source: a GitHub repo, or a folder (which may have a GitHub remote).
let repo = args.repo ? (ghRepoOf(args.repo) ?? args.repo) : null;
const given = args.path ? resolve(args.path) : null;
if (!repo && !given) fail(usage);
if (given && !existsSync(given)) fail(`There's no folder at ${given}.`);
if (given && !repo) repo = ghRepoOf(git(given, 'remote', 'get-url', 'origin'));
if (repo && !/^[\w.-]+\/[\w.-]+$/.test(repo)) fail(usage);
const info = repo ? JSON.parse(run('gh', ['repo', 'view', repo, '--json', 'name,description,visibility,defaultBranchRef,primaryLanguage,homepageUrl,isArchived'], { capture: true }).out) : null;
// The code's folder in the products folder is named like its repo, so every computer finds it from the catalog. A folder
// with no repo gets the slug ("Party Planner" -> party-planner), which is also its repo name if one is created.
const toSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const slug = args.slug ?? toSlug(info?.name ?? basename(given));
const folderName = info?.name ?? slug;
const label = info?.name ?? basename(given);
const name = args.name ?? (/[A-Z ]/.test(label) ? label : label.split(/[-_\s]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' '));
const isPublic = info?.visibility === 'PUBLIC';
const localOnly = !repo;
const knowledge = args.knowledge ?? (isPublic || localOnly ? 'workspace' : 'repo');
if (!['repo', 'workspace'].includes(knowledge)) fail('--knowledge must be repo or workspace');
if (localOnly && knowledge === 'repo' && !args['create-repo']) fail('A folder with no GitHub repo keeps its knowledge in the workspace (or use --create-repo).');

// 2. Every copy of this code on this computer. The home is <productsDir>/<name>.
if (!config.productsDir) fail('No products folder is set. Run /founder:setup first.');
const home = join(config.productsDir, folderName);
const skipDirs = new Set(['node_modules', '.venv', 'venv', '$RECYCLE.BIN', 'System Volume Information', 'AppData', 'Library', '.cache', 'site-packages', 'dist', 'build', '.git']);
function findCopies() {
  const roots = [...new Set([dirname(config.productsDir), config.productsDir, homedir(), given && dirname(given)].filter(Boolean).map((r) => resolve(r)))];
  const found = new Set();
  const visit = (d, depth) => {
    let entries; try { entries = readdirSync(d, { withFileTypes: true }); } catch { return; }
    if (entries.some((e) => e.name === '.git')) {
      const origin = git(d, 'remote', 'get-url', 'origin');
      if (repo ? ghRepoOf(origin)?.toLowerCase() === repo.toLowerCase() : resolve(d) === given) found.add(resolve(d));
      return;
    }
    if (depth >= 3) return;
    for (const e of entries) if (e.isDirectory() && !skipDirs.has(e.name) && !e.name.startsWith('.')) visit(join(d, e.name), depth + 1);
  };
  for (const r of roots) visit(r, 0);
  if (given) found.add(given);
  return [...found].filter((d) => !d.toLowerCase().includes(`${join('.claude', 'plugins').toLowerCase()}`) && !d.toLowerCase().includes('_retired'));
}
// Files only this copy has: untracked or ignored, minus what can be rebuilt (packages, environments, caches, builds).
const rebuildable = /(^|\/)(node_modules|\.venv|venv|__pycache__|\.pytest_cache|\.mypy_cache|\.ruff_cache|\.cache|dist|build|\.next|\.turbo|coverage|target|[^/]+\.egg-info)(\/|$)|\.(pyc|tsbuildinfo)$|(^|\/)\.coverage$/;
function describe(d) {
  const isRepo = Boolean(git(d, 'rev-parse', '--git-dir'));
  const status = isRepo ? (git(d, 'status', '--porcelain=v1', '--ignored', '--untracked-files=all') ?? '') : '';
  const lines = status.split(/\r?\n/).filter(Boolean);
  const localFiles = lines.filter((l) => l.startsWith('?? ') || l.startsWith('!! ')).map((l) => l.slice(3).replace(/^"|"$/g, '')).filter((f) => !rebuildable.test(f));
  return {
    dir: d, isRepo,
    changed: lines.filter((l) => !l.startsWith('?? ') && !l.startsWith('!! ')).length,
    ahead: isRepo ? Number(git(d, 'rev-list', '--count', '@{u}..HEAD') ?? 0) : 0,
    stashes: isRepo ? (git(d, 'stash', 'list') ?? '').split(/\r?\n/).filter(Boolean).length : 0,
    lastCommit: isRepo ? git(d, 'log', '-1', '--format=%cI') : null,
    localFiles: localFiles.slice(0, 50), localFileCount: localFiles.length,
  };
}
const copies = findCopies().map(describe);
const atHome = copies.find((c) => resolve(c.dir).toLowerCase() === resolve(home).toLowerCase());
// The main copy: the one already at home; else the folder given; else the copy with the most local-only work.
const main = atHome ?? copies.find((c) => c.dir === given) ?? [...copies].sort((a, b) => b.localFileCount - a.localFileCount || String(b.lastCommit).localeCompare(String(a.lastCommit)))[0] ?? null;
const others = copies.filter((c) => c !== main);
const moveMain = Boolean(main && !atHome && !(args['in-place'] && main.dir === given));
const unsafe = (c) => c.changed > 0 || c.ahead > 0 || c.stashes > 0;

const kDir = knowledge === 'workspace' ? join(studio, 'products', folderName, 'product') : join(home, 'product');
const media = config.driveRoot ? join(config.driveRoot, name) : '';
const plan = {
  source: repo ? 'github' : 'folder', repo, name, slug, visibility: info?.visibility ?? 'LOCAL (no GitHub repo)', language: info?.primaryLanguage?.name ?? null, description: info?.description || null,
  home: moveMain || atHome ? home : (main?.dir ?? home), action: atHome ? 'already in the products folder' : moveMain ? `move ${main.dir} into the products folder` : main ? 'leave the folder where it is' : 'clone from GitHub',
  copies: others.map((c) => ({ dir: c.dir, localFiles: c.localFileCount, examples: c.localFiles.slice(0, 8), unsaved: unsafe(c) ? `${c.changed} changed files, ${c.ahead} unpushed commits, ${c.stashes} stashes` : null })),
  main: main ? { dir: main.dir, unsaved: unsafe(main) ? `${main.changed} changed files, ${main.ahead} unpushed commits` : null } : null,
  knowledge, knowledgeDir: kDir, media: media || null, fromIdea: args['from-idea'] ?? null, createRepo: localOnly && Boolean(args['create-repo']),
  warning: isPublic && knowledge === 'repo' ? 'This repo is public: research, pricing and plans in product/ would be public too.' : null,
};
if (dry) { console.log(JSON.stringify(plan, null, 1)); process.exit(0); }

// 3. One home for the code: move the main copy in (same drive), or clone it.
let codeDir = plan.home;
if (moveMain) {
  if (existsSync(home)) fail(`${home} already exists but isn't a copy of this code. Move it aside first, or use --in-place.`);
  if (!sameDrive(main.dir, home)) fail(`${main.dir} is on another drive than the products folder. Copy it across yourself (or use --in-place), then run adopt again.`);
  step(`Moving ${main.dir} to ${home}`);
  try { renameSync(main.dir, home); } catch (e) { fail(`Couldn't move ${main.dir} (${e.code}). A window, terminal or program has it open: close it and run adopt again. Nothing was changed.`); }
} else if (!main && repo) {
  step(`Cloning ${repo} to ${home}`);
  run('gh', ['repo', 'clone', repo, home]);
}

// 4. The other copies: their local-only files join the main copy (never overwriting), then the copy moves aside.
const retired = [];
if (args.consolidate) {
  for (const c of others) {
    if (unsafe(c)) { retired.push({ dir: c.dir, kept: true, why: 'it has work that is not on GitHub; save or push it first' }); continue; }
    const carried = [];
    for (const f of describe(c.dir).localFiles) {
      const src = join(c.dir, f); const dest = join(codeDir, f);
      if (!existsSync(dest)) { mkdirSync(dirname(dest), { recursive: true }); cpSync(src, dest, { recursive: true }); carried.push(f); }
    }
    const aside = join(config.productsDir, '_retired', `${basename(c.dir)}-${today}`);
    let moved = false;
    if (sameDrive(c.dir, aside)) { try { mkdirSync(dirname(aside), { recursive: true }); renameSync(c.dir, aside); moved = true; } catch {} }
    retired.push({ dir: c.dir, carried, movedTo: moved ? aside : null, why: moved ? null : 'could not be moved (open in a program, or another drive): remove it yourself once you have checked it' });
  }
}

// 5. A GitHub repo for a folder that has none: private, with secrets kept out.
if (localOnly && args['create-repo']) {
  const owner = run('gh', ['api', 'user', '--jq', '.login'], { capture: true }).out;
  if (!git(codeDir, 'rev-parse', '--git-dir')) run('git', ['-C', codeDir, 'init', '-b', 'main']);
  const gi = join(codeDir, '.gitignore');
  const ignore = existsSync(gi) ? readFileSync(gi, 'utf8') : '';
  const need = ['.env', '.env.*', '!.env.example', 'node_modules/', '.venv/', '__pycache__/'].filter((l) => !ignore.split(/\r?\n/).includes(l));
  if (need.length) writeFileSync(gi, `${ignore}${ignore && !ignore.endsWith('\n') ? '\n' : ''}${need.join('\n')}\n`);
  const leaks = spawnSync('gitleaks', ['detect', '--no-git', '--source', codeDir, '--no-banner', '--exit-code', '3'], { encoding: 'utf8', shell: process.platform === 'win32' });
  if (leaks.status === 3) fail('gitleaks found what look like secrets in the code. Nothing was pushed. Move them to .env (ignored), then run adopt again.');
  run('git', ['-C', codeDir, 'add', '-A']);
  if (git(codeDir, 'status', '--porcelain')) run('git', ['-C', codeDir, '-c', 'user.email=' + (git(codeDir, 'config', 'user.email') || `${owner}@users.noreply.github.com`), '-c', 'user.name=' + (git(codeDir, 'config', 'user.name') || owner), 'commit', '-m', 'Initial commit']);
  run('gh', ['repo', 'create', `${owner}/${slug}`, '--private', '--source', codeDir, '--remote', 'origin', '--push']);
  repo = `${owner}/${slug}`;
}

// 6. The knowledge folder, from the template. Existing files are never overwritten.
step(`Creating the knowledge folder at ${kDir}`);
const tpl = join(pluginRoot, 'templates', 'product', 'product');
const fill = (s) => s.replaceAll('{{REPO}}', repo ?? '—').replaceAll('{{DRIVE}}', media ? name : '—').replaceAll('{{NAME}}', name).replaceAll('{{SLUG}}', slug);
const created = [];
const copyMissing = (src, dest) => {
  for (const e of readdirSync(src)) {
    const s = join(src, e); const d = join(dest, e);
    if (statSync(s).isDirectory()) { mkdirSync(d, { recursive: true }); copyMissing(s, d); }
    else if (!existsSync(d)) { mkdirSync(dirname(d), { recursive: true }); writeFileSync(d, fill(readFileSync(s, 'utf8'))); created.push(relative(kDir, d)); }
  }
};
copyMissing(tpl, kDir);
// The template's commands and paths are for its own stack: replace them with what this code actually uses.
const services = join(kDir, 'services.json');
if (created.includes('services.json')) {
  const sv = JSON.parse(readFileSync(services, 'utf8'));
  sv.services = (sv.services ?? []).filter((s) => !(s.id === 'supabase' && !existsSync(join(codeDir, 'supabase'))));
  delete sv.commands; delete sv.paths;
  writeFileSync(services, `${JSON.stringify(sv, null, 2)}\n`);
  run('node', [join(pluginRoot, 'scripts', 'env.mjs'), 'detect', '--dir', codeDir, '--write', services], { capture: true, allowFail: true });
}
// An adopted product isn't ready to build until the onboarding checklist is done.
const stateFile = join(kDir, 'STATE.md');
if (created.includes('STATE.md')) {
  const st = readFileSync(stateFile, 'utf8').replace(/^stage: .*$/m, 'stage: onboarding').replace(/^next: .*$/m, 'next: /founder:adopt (finish onboarding)');
  writeFileSync(stateFile, st.replace(/^(next: .*)$/m, '$1\nready: your ideas — · brief — · build plan — · ideas reviewed — · setup — · tests —'));
}

// 7. The idea's research, if this code grew out of an idea in the workspace.
const ideaFolder = args['from-idea'] ? join(studio, 'ideas', args['from-idea']) : '';
if (ideaFolder && existsSync(ideaFolder)) {
  step(`Moving ideas/${args['from-idea']} into the knowledge folder`);
  const departments = new Set(['discovery', 'iterations', 'features', 'research', 'finance', 'design', 'audits', 'marketing', 'showcase', 'sales', 'listen', 'decisions', 'enablement', '00-intake']);
  for (const e of readdirSync(ideaFolder)) {
    if (e === 'INDEX.md' || e === 'MOVED.md') continue;
    const src = join(ideaFolder, e);
    const dest = e === 'runs.md' ? join(kDir, e) : statSync(src).isDirectory() && departments.has(e) ? join(kDir, e) : join(kDir, 'discovery', e);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest, { recursive: true });
    rmSync(src, { recursive: true, force: true });
  }
  writeFileSync(join(ideaFolder, 'MOVED.md'), `# Moved\n\nThis idea is now the product ${name}${repo ? ` (${repo})` : ''}. Its research lives in ${knowledge === 'workspace' ? `products/${folderName}/product/` : `${repo} under product/`}.\n`);
}
run('node', [join(pluginRoot, 'scripts', 'index.mjs'), dirname(kDir)], { allowFail: true, capture: true });

// 8. Labels the flows use. Existing labels with the same name are left as they are.
if (repo && !args['no-labels']) {
  step('Adding product labels (existing ones are kept)');
  const have = new Set(JSON.parse(run('gh', ['label', 'list', '-R', repo, '--limit', '200', '--json', 'name'], { capture: true }).out).map((l) => l.name));
  for (const l of JSON.parse(readFileSync(join(pluginRoot, 'templates', 'labels-product.json'), 'utf8'))) {
    if (!have.has(l.name)) run('gh', ['label', 'create', l.name, '-R', repo, '--color', l.color, '--description', l.description], { allowFail: true, capture: true });
  }
}

// 9. The media folder.
let mediaOk = false;
if (media) {
  try {
    for (const sub of ['Finance', 'Research', 'Brand', 'Marketing', 'Sales', 'Shared']) mkdirSync(join(media, sub), { recursive: true });
    mediaOk = true;
  } catch {
    console.warn(`The media folder isn't reachable (${config.driveRoot}): is Google Drive running? Skipped; run adopt again later to create it.`);
  }
}

// 10. The catalog entry: values that hold on every computer (a repo, or the folder's name in the products folder).
step('Updating the catalog');
const meta = { slug, track: 'product', ...(repo ? { repo } : { local: folderName }), drive: media ? name : '', knowledge, adopted: today, next: '/founder:adopt (finish onboarding)', updated: today };
const issues = JSON.parse(run('gh', ['issue', 'list', '-R', config.studioRepo, '--label', 'type:idea', '--state', 'all', '--limit', '200', '--json', 'number,body,labels,title,state'], { capture: true }).out);
const esc = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const keys = [slug, repo, folderName].filter(Boolean).map(esc).join('|');
const existing = issues.find((i) => i.state === 'OPEN' && new RegExp(`^(slug|repo|local):\\s*(${keys})\\s*$`, 'mi').test(i.body)) ?? issues.find((i) => new RegExp(`^(slug|repo|local):\\s*(${keys})\\s*$`, 'mi').test(i.body));
const bodyFile = join(tmpdir(), `studio-adopt-${slug}.md`);
let number;
if (existing) {
  let body = existing.body.includes('<!-- studio') ? existing.body : `${existing.body}\n\n<!-- studio\n-->`;
  for (const [k, v] of Object.entries(meta)) {
    const re = new RegExp(`^${k}:.*$`, 'm');
    body = re.test(body) ? body.replace(re, `${k}: ${v}`) : body.replace(/^-->/m, `${k}: ${v}\n-->`);
  }
  writeFileSync(bodyFile, body);
  const edit = ['issue', 'edit', String(existing.number), '-R', config.studioRepo, '--body-file', bodyFile, '--add-label', 'status:building'];
  for (const l of existing.labels.map((x) => x.name).filter((n) => n.startsWith('status:') && n !== 'status:building')) edit.push('--remove-label', l);
  run('gh', edit, { capture: true });
  if (existing.state !== 'OPEN') run('gh', ['issue', 'reopen', String(existing.number), '-R', config.studioRepo], { capture: true, allowFail: true });
  number = existing.number;
} else {
  writeFileSync(bodyFile, `## Problem\n\n${info?.description || '—'}\n\n## Source\n\nExisting code, adopted on ${today}${repo ? `: https://github.com/${repo}` : ' from a folder on a computer (no GitHub repo yet)'}\n\n<!-- studio\n${Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join('\n')}\n-->\n`);
  const out = run('gh', ['issue', 'create', '-R', config.studioRepo, '--title', name, '--body-file', bodyFile, '--label', 'type:idea', '--label', 'status:building', '--label', 'source:team'], { capture: true }).out;
  number = Number((out.match(/\/issues\/(\d+)/) ?? [])[1]);
}
rmSync(bodyFile, { force: true });

console.log(JSON.stringify({ ...plan, repo, codeDir, retired, mediaCreated: mediaOk, catalogIssue: number, next: 'Ask the user for their ideas (intake.mjs), then fill the brief, build plan, idea review and setup (env.mjs), per /founder:adopt.' }, null, 1));
