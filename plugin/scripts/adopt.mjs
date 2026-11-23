// Brings an existing GitHub repo into Full Stack Founder without restructuring it: a catalog entry, a knowledge folder
// (product/) from the template, product labels, a media folder, and the idea's research moved in if there was one.
// The code is never touched. /founder:adopt then fills STATE.md, the roadmap and the engineering notes from the repo.
//
// Usage: node adopt.mjs --repo owner/name [--knowledge repo|workspace] [--name "Product Name"] [--slug s] [--from-idea <slug>]
//                       [--no-clone] [--no-labels] [--dry-run]
//   --knowledge  where product/ lives: in the repo (default for private repos) or in the workspace at products/<repo>/
//                (default for public repos, so research and pricing never go public)
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, loadConfig, parseArgs, run, step, workspaceDir } from './lib.mjs';

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = parseArgs();
const repo = args.repo;
if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) fail('Usage: adopt.mjs --repo owner/name [--knowledge repo|workspace] [--name "Product Name"] [--slug s] [--from-idea <slug>] [--no-clone] [--no-labels] [--dry-run]');
const studio = workspaceDir();
const config = loadConfig(studio);
const dry = Boolean(args['dry-run']);

// 1. The repo, as GitHub sees it.
const info = JSON.parse(run('gh', ['repo', 'view', repo, '--json', 'name,description,visibility,defaultBranchRef,primaryLanguage,homepageUrl,isArchived'], { capture: true }).out);
const repoName = info.name;
const name = args.name ?? repoName.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const slug = args.slug ?? repoName.toLowerCase();
const isPublic = info.visibility === 'PUBLIC';
const knowledge = args.knowledge ?? (isPublic ? 'workspace' : 'repo');
if (!['repo', 'workspace'].includes(knowledge)) fail('--knowledge must be repo or workspace');

const local = config.productsDir ? join(config.productsDir, repoName) : '';
const kDir = knowledge === 'workspace' ? join(studio, 'products', repoName, 'product') : join(local, 'product');
const media = config.driveRoot ? join(config.driveRoot, name) : '';

const plan = {
  repo, name, slug, visibility: info.visibility, language: info.primaryLanguage?.name ?? null, description: info.description || null,
  local: local || null, localExists: Boolean(local && existsSync(join(local, '.git'))), knowledge, knowledgeDir: kDir,
  media: media || null, fromIdea: args['from-idea'] ?? null,
  warning: isPublic && knowledge === 'repo' ? 'This repo is public: research, pricing and plans in product/ would be public too.' : null,
};
if (dry) { console.log(JSON.stringify(plan, null, 1)); process.exit(0); }

// 2. A copy on this computer, for the code work later. Status is always read from GitHub.
if (local && !plan.localExists && !args['no-clone']) {
  step(`Cloning ${repo} to ${local}`);
  run('gh', ['repo', 'clone', repo, local]);
}
if (knowledge === 'repo' && !existsSync(join(local, '.git'))) fail(`The knowledge folder goes in the repo, but there's no copy at ${local}. Clone it, or use --knowledge workspace.`);

// 3. The knowledge folder, from the template. Existing files are never overwritten.
step(`Creating the knowledge folder at ${kDir}`);
const tpl = join(pluginRoot, 'templates', 'product', 'product');
const fill = (s) => s.replaceAll('{{REPO}}', repo).replaceAll('{{DRIVE}}', media || '—').replaceAll('{{NAME}}', name).replaceAll('{{SLUG}}', slug);
const copyMissing = (src, dest) => {
  for (const e of readdirSync(src)) {
    const s = join(src, e); const d = join(dest, e);
    if (statSync(s).isDirectory()) { mkdirSync(d, { recursive: true }); copyMissing(s, d); }
    else if (!existsSync(d)) { mkdirSync(dirname(d), { recursive: true }); writeFileSync(d, fill(readFileSync(s, 'utf8'))); }
  }
};
copyMissing(tpl, kDir);
// An adopted product starts with no services listed; /founder:adopt fills them from what the repo uses.
const services = join(kDir, 'services.json');
const sv = JSON.parse(readFileSync(services, 'utf8'));
if (sv.services?.length === 1 && sv.services[0].id === 'supabase' && !existsSync(join(local, 'supabase'))) { sv.services = []; writeFileSync(services, `${JSON.stringify(sv, null, 2)}\n`); }

// 4. The idea's research, if this repo grew out of an idea in the workspace.
const ideaFolder = args['from-idea'] ? join(studio, 'ideas', args['from-idea']) : '';
if (ideaFolder && existsSync(ideaFolder)) {
  step(`Moving ideas/${args['from-idea']} into the knowledge folder`);
  const departments = new Set(['discovery', 'iterations', 'features', 'research', 'finance', 'design', 'audits', 'marketing', 'showcase', 'sales', 'listen', 'decisions', 'enablement']);
  for (const e of readdirSync(ideaFolder)) {
    if (e === 'INDEX.md' || e === 'MOVED.md') continue;
    const src = join(ideaFolder, e);
    const dest = e === 'runs.md' ? join(kDir, e) : statSync(src).isDirectory() && departments.has(e) ? join(kDir, e) : join(kDir, 'discovery', e);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest, { recursive: true });
    rmSync(src, { recursive: true, force: true });
  }
  writeFileSync(join(ideaFolder, 'MOVED.md'), `# Moved\n\nThis idea is now the product ${name} (${repo}). Its research lives in ${knowledge === 'workspace' ? `products/${repoName}/product/` : `${repo} under product/`}.\n`);
}
run('node', [join(pluginRoot, 'scripts', 'index.mjs'), dirname(kDir)], { allowFail: true });

// 5. Labels the flows use. Existing labels with the same name are left as they are.
if (!args['no-labels']) {
  step('Adding product labels (existing ones are kept)');
  const have = new Set(JSON.parse(run('gh', ['label', 'list', '-R', repo, '--limit', '200', '--json', 'name'], { capture: true }).out).map((l) => l.name));
  for (const l of JSON.parse(readFileSync(join(pluginRoot, 'templates', 'labels-product.json'), 'utf8'))) {
    if (!have.has(l.name)) run('gh', ['label', 'create', l.name, '-R', repo, '--color', l.color, '--description', l.description], { allowFail: true });
  }
}

// 6. The media folder.
let mediaOk = false;
if (media) {
  try {
    for (const sub of ['Finance', 'Research', 'Brand', 'Marketing', 'Sales', 'Shared']) mkdirSync(join(media, sub), { recursive: true });
    mediaOk = true;
  } catch {
    console.warn(`The media folder isn't reachable (${config.driveRoot}): is Google Drive running? Skipped; run adopt again later to create it.`);
  }
}

// 7. The catalog entry: machine-independent values only.
step('Updating the catalog');
const meta = { slug, track: 'product', repo, drive: media ? name : '', knowledge, adopted: new Date().toLocaleDateString('en-CA'), next: '/founder:adopt (finish)', updated: new Date().toLocaleDateString('en-CA') };
const issues = JSON.parse(run('gh', ['issue', 'list', '-R', config.studioRepo, '--label', 'type:idea', '--state', 'all', '--limit', '200', '--json', 'number,body,labels,title'], { capture: true }).out);
const existing = issues.find((i) => new RegExp(`^(slug|repo):\\s*(${slug}|${repo})\\s*$`, 'mi').test(i.body));
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
  run('gh', edit);
  number = existing.number;
} else {
  writeFileSync(bodyFile, `## Problem\n\n${info.description || '—'}\n\n## Source\n\nAn existing repo, adopted on ${meta.adopted}: https://github.com/${repo}\n\n<!-- studio\n${Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join('\n')}\n-->\n`);
  const out = run('gh', ['issue', 'create', '-R', config.studioRepo, '--title', name, '--body-file', bodyFile, '--label', 'type:idea', '--label', 'status:building', '--label', 'source:team'], { capture: true }).out;
  number = Number((out.match(/\/issues\/(\d+)/) ?? [])[1]);
}
rmSync(bodyFile, { force: true });

console.log(JSON.stringify({ ...plan, mediaCreated: mediaOk, localExists: Boolean(local && existsSync(join(local, '.git'))), catalogIssue: number, next: 'Fill STATE.md, roadmap.md, services.json and engineering.md from the repo, then commit the knowledge folder where it lives.' }, null, 1));
