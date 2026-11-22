// Creates a product repo from the studio template: scaffold, overlay, install, first commit, and (unless --local) the
// GitHub repo, labels, media folders, the move of the idea's knowledge files, and the idea issue's metadata.
// Usage: node setup-product.mjs --slug meal-planner --name "Meal Planner" [--local] [--out <folder>] [--skip-install]
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, loadConfig, parseArgs, run, step, workspaceDir } from './lib.mjs';

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = parseArgs();
const { slug, name } = args;
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || !name) fail('Usage: setup-product.mjs --slug <kebab-case> --name "<Product Name>" [--local] [--out <folder>] [--skip-install]');

const local = Boolean(args.local);
const studio = local ? workspaceDir({ required: false }) : workspaceDir();
const config = loadConfig(studio);
const owner = config.githubOwner;
const repoName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const parent = args.out ?? config.productsDir;
if (!parent) fail('No products folder. Run /setup, or pass --out <folder>.');
const target = join(resolve(parent), repoName);
const template = join(pluginRoot, 'templates', 'product');
const mediaFolder = config.driveRoot ? join(config.driveRoot, name) : '';
if (existsSync(target)) fail(`${target} already exists. Pick another name or remove it first.`);
if (!local && !owner) fail('githubOwner is missing from studio.config.json. Run /setup.');

const inTarget = (cmd, a) => run(cmd, a, { cwd: target });
const writeUtf8 = (p, text) => writeFileSync(p, text, 'utf8');

// --- Scaffold -----------------------------------------------------------------
step(`Scaffolding ${target}`);
mkdirSync(join(target, 'apps'), { recursive: true }); // create-next-app needs an existing, writable parent
inTarget('npx', ['-y', 'create-next-app@latest', 'apps/web', '--ts', '--tailwind', '--biome', '--app', '--use-pnpm',
  '--skip-install', '--disable-git', '--yes', '--no-agent-feedback', '--import-alias', '@/*']);
// One Biome config and one workspace file, at the root.
for (const f of ['apps/web/biome.json', 'apps/web/pnpm-workspace.yaml']) rmSync(join(target, f), { force: true });

step('Applying the studio template');
const replacements = {
  '{{NAME}}': name, '{{SLUG}}': slug, '{{OWNER}}': owner ?? 'you', '{{REPO}}': `${owner ?? 'you'}/${repoName}`,
  '{{OWNER_NAME}}': run('git', ['config', 'user.name'], { capture: true, allowFail: true }).out || owner || '',
  '{{YEAR}}': String(new Date().getFullYear()), '{{DRIVE}}': mediaFolder || 'not set',
};
function overlay(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const src = join(dir, e.name);
    const dest = join(target, relative(template, src));
    if (e.isDirectory()) { mkdirSync(dest, { recursive: true }); overlay(src); continue; }
    let text = readFileSync(src, 'utf8');
    for (const [k, v] of Object.entries(replacements)) text = text.split(k).join(v);
    writeUtf8(dest, text);
  }
}
overlay(template);

step('Wiring the workspace');
inTarget('npm', ['pkg', 'set', `packageManager=pnpm@${run('pnpm', ['-v'], { capture: true }).out}`]);
run('npm', ['pkg', 'delete', 'scripts.lint', 'scripts.format'], { cwd: join(target, 'apps/web') });
run('npm', ['pkg', 'set', 'scripts.typecheck=next typegen && tsc --noEmit', 'scripts.test=vitest run --passWithNoTests'], { cwd: join(target, 'apps/web') });

if (!args['skip-install']) {
  step('Installing dependencies');
  inTarget('pnpm', ['add', '-w', '-D', 'turbo', '@biomejs/biome', 'typescript', 'vitest', 'supabase']);
  inTarget('pnpm', ['--filter', '@repo/shared', 'add', 'zod']);
  inTarget('pnpm', ['--filter', '@repo/shared', 'add', '-D', 'typescript', 'vitest', '@types/node']);
  inTarget('pnpm', ['--filter', 'web', 'add', '@repo/shared@workspace:*']);
  inTarget('pnpm', ['--filter', 'web', 'add', '-D', 'vitest']);

  step('Configuring Biome and Supabase');
  inTarget('pnpm', ['exec', 'biome', 'init']);
  const biomePath = join(target, 'biome.json');
  const biome = JSON.parse(readFileSync(biomePath, 'utf8'));
  biome.vcs = { enabled: true, clientKind: 'git', useIgnoreFile: true };
  biome.css = { parser: { tailwindDirectives: true } };
  writeUtf8(biomePath, `${JSON.stringify(biome, null, 2)}\n`);
  inTarget('pnpm', ['exec', 'supabase', 'init', '--force']);
  inTarget('pnpm', ['exec', 'biome', 'check', '--write', '.']);
}

// --- The idea's knowledge moves into the repo (skipped with --local) ---------------
const ideaFolder = studio ? join(studio, 'ideas', slug) : '';
if (!local && ideaFolder && existsSync(ideaFolder)) {
  step('Moving the idea\'s research into the repo');
  // Department folders keep their names; startup-design's numbered folders and loose files go under discovery/.
  const departments = new Set(['discovery', 'iterations', 'features', 'research', 'finance', 'design', 'audits', 'marketing', 'showcase', 'sales', 'listen', 'decisions', 'enablement']);
  for (const e of readdirSync(ideaFolder)) {
    if (e === 'INDEX.md' || e === 'MOVED.md') continue;
    const src = join(ideaFolder, e);
    const dest = e === 'runs.md' ? join(target, 'product', e)
      : statSync(src).isDirectory() && departments.has(e) ? join(target, 'product', e)
      : join(target, 'product', 'discovery', e);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest, { recursive: true });
    rmSync(join(dest, '.gitkeep'), { force: true });
    rmSync(src, { recursive: true, force: true });
  }
  writeUtf8(join(ideaFolder, 'MOVED.md'), `# Moved\n\nThis idea's research now lives in https://github.com/${owner}/${repoName} under product/.\n`);
}
run('node', [join(pluginRoot, 'scripts', 'index.mjs'), target]);

step('First commit');
inTarget('git', ['init', '-q', '-b', 'main']);
inTarget('git', ['add', '-A']);
inTarget('git', ['commit', '-q', '-m', `Scaffold ${name} from the studio template`]);

if (!local) {
  step(`Creating the private GitHub repo ${owner}/${repoName}`);
  inTarget('gh', ['repo', 'create', `${owner}/${repoName}`, '--private', '--source', '.', '--remote', 'origin', '--push']);
  for (const l of JSON.parse(readFileSync(join(pluginRoot, 'templates', 'labels-product.json'), 'utf8'))) {
    inTarget('gh', ['label', 'create', l.name, '--repo', `${owner}/${repoName}`, '--color', l.color, '--description', l.description, '--force']);
  }

  if (mediaFolder) {
    step(`Setting up the media folder ${mediaFolder}`);
    const ideaMedia = join(config.driveRoot, '_Ideas', slug);
    if (existsSync(ideaMedia) && !existsSync(mediaFolder)) {
      cpSync(ideaMedia, mediaFolder, { recursive: true });
      rmSync(ideaMedia, { recursive: true, force: true });
    }
    for (const sub of ['Finance', 'Research', 'Brand', 'Marketing', 'Sales', 'Shared']) mkdirSync(join(mediaFolder, sub), { recursive: true });
  }

  step('Updating the idea issue');
  const issues = JSON.parse(run('gh', ['issue', 'list', '--repo', config.studioRepo, '--label', 'type:idea', '--state', 'all', '--limit', '200', '--json', 'number,body,labels'], { capture: true }).out);
  const issue = issues.find((i) => new RegExp(`^slug:\\s*${slug}\\s*$`, 'm').test(i.body));
  if (issue) {
    let body = issue.body;
    const values = { repo: `${owner}/${repoName}`, local: target, drive: mediaFolder, next: '/spec', updated: new Date().toLocaleDateString('en-CA') };
    for (const [k, v] of Object.entries(values)) {
      const re = new RegExp(`^${k}:.*$`, 'm');
      body = re.test(body) ? body.replace(re, `${k}: ${v}`) : body.replace(/^-->/m, `${k}: ${v}\n-->`);
    }
    const bodyFile = join(tmpdir(), `studio-issue-${issue.number}.md`);
    writeUtf8(bodyFile, body);
    const edit = ['issue', 'edit', String(issue.number), '--repo', config.studioRepo, '--body-file', bodyFile, '--add-label', 'status:building'];
    for (const l of issue.labels.map((x) => x.name).filter((n) => n.startsWith('status:') && n !== 'status:building')) edit.push('--remove-label', l);
    run('gh', edit);
    rmSync(bodyFile, { force: true });
  } else {
    console.warn(`No idea issue with slug '${slug}' in ${config.studioRepo}; metadata not updated.`);
  }
}

console.log(`\nCreated ${target}`);
