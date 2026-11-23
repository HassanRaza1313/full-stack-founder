// The user's private studio workspace: ideas, portfolio view, lessons and settings.
// Usage:
//   node workspace.mjs show                         merged settings as JSON, plus "workspace" (its folder)
//   node workspace.mjs init --repo owner/name --dir <folder> [--products <folder>] [--media <folder>] [--tools <folder>]
//        Clones the repo if it already exists on GitHub (a new machine); otherwise creates it from the template.
//   node workspace.mjs set <key> <value> [--local]  saves a setting (dot keys allowed); --local for this machine only
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, getPath, loadConfig, parseArgs, readState, run, setUserEnv, stateDir, step, workspaceDir, writeState } from './lib.mjs';

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = parseArgs();
const [command, ...rest] = args._;

const readJson = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {});
const writeJson = (f, o) => writeFileSync(f, `${JSON.stringify(o, null, 2)}\n`);
function setPath(obj, key, value) {
  const keys = key.split('.');
  let o = obj;
  for (const k of keys.slice(0, -1)) o = o[k] ??= {};
  o[keys.at(-1)] = value;
}

if (command === 'show') {
  const dir = workspaceDir();
  console.log(JSON.stringify({ workspace: dir, ...loadConfig(dir) }, null, 2));
} else if (command === 'set') {
  const [key, value] = rest;
  if (!key || value === undefined) fail('Usage: workspace.mjs set <key> <value> [--local]');
  const file = join(workspaceDir(), args.local ? 'studio.config.local.json' : 'studio.config.json');
  const cfg = readJson(file);
  setPath(cfg, key, value);
  writeJson(file, cfg);
  console.log(`${key} = ${value}${args.local ? ' (this machine)' : ''}`);
} else if (command === 'init') {
  if (!args.repo || !args.dir) fail('Usage: workspace.mjs init --repo owner/name --dir <folder> [...]');
  const dir = resolve(args.dir);
  const [owner] = args.repo.split('/');
  const exists = run('gh', ['repo', 'view', args.repo, '--json', 'name'], { capture: true, allowFail: true }).code === 0;

  if (existsSync(join(dir, 'studio.config.json'))) {
    step(`Using the existing workspace at ${dir}`);
  } else if (exists) {
    step(`Cloning your workspace ${args.repo} to ${dir}`);
    run('gh', ['repo', 'clone', args.repo, dir]);
  } else {
    step(`Creating your private workspace ${args.repo} at ${dir}`);
    mkdirSync(dir, { recursive: true });
    cpSync(join(pluginRoot, 'templates', 'workspace'), dir, { recursive: true });
    writeJson(join(dir, 'studio.config.json'), {
      studioRepo: args.repo,
      githubOwner: owner,
      site: {},
      demos: { maxLive: 2 },
      research: { buildDepth: 'deep' },
    });
    run('git', ['init', '-q', '-b', 'main'], { cwd: dir });
    run('git', ['add', '-A'], { cwd: dir });
    run('git', ['commit', '-q', '-m', 'Create studio workspace'], { cwd: dir });
    run('gh', ['repo', 'create', args.repo, '--private', '--source', '.', '--remote', 'origin', '--push'], { cwd: dir });
  }

  // This machine's paths.
  const localFile = join(dir, 'studio.config.local.json');
  const local = readJson(localFile);
  for (const [flag, key] of [['products', 'productsDir'], ['media', 'driveRoot'], ['tools', 'toolsDir'], ['docker', 'dockerDir']]) {
    if (args[flag]) local[key] = resolve(args[flag]);
  }
  if (local.productsDir) mkdirSync(local.productsDir, { recursive: true });
  writeJson(localFile, local);

  step('Pointing Full Stack Founder at the workspace');
  // The pointer file works everywhere without a terminal restart; STUDIO_DIR is kept for scripts and other tools.
  writeState('state.json', { ...readState('state.json'), workspace: dir });
  console.log(setUserEnv('STUDIO_DIR', dir));
  // Quick reads made before setup (trial mode) move into the workspace's ideas/.
  // Claude Code blocks writes inside ~/.claude, so trial reads live in ~/founder-trial (older ones may be in ~/.claude/founder/trial).
  const moved = [];
  for (const trial of [join(homedir(), 'founder-trial'), join(stateDir, 'trial')]) {
    const names = existsSync(trial) ? readdirSync(trial).filter((n) => !existsSync(join(dir, 'ideas', n))) : [];
    for (const n of names) {
      cpSync(join(trial, n), join(dir, 'ideas', n), { recursive: true });
      rmSync(join(trial, n), { recursive: true, force: true });
      moved.push(n);
    }
  }
  if (moved.length) console.log(`Moved your first quick read(s) into ideas/: ${moved.join(', ')}. Track them with /founder:idea add.`);
  console.log(`\nWorkspace ready: ${dir}${getPath(loadConfig(dir), 'studioRepo') ? ` (${args.repo})` : ''}`);
} else {
  fail('Usage: workspace.mjs show | init ... | set <key> <value> [--local]');
}
