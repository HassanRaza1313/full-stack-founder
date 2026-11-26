// Runs every flow headless in a sandbox, for release checks: a throwaway workspace, a fake GitHub (local bare repos),
// one idea in the catalog and a small vibe-coded app in a "desktop" folder. Nothing touches the real GitHub or posts.
// Each case's reply, time and tokens go to <out>/results/. Needs Claude Code (`claude`) signed in. It costs real tokens:
// run it before a release, not on every change.
//
// Usage: node smoke.mjs --out <folder> [--only name,name] [--concurrency 3] [--keep]
import { spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { plugin } from './helpers.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : null)).filter(Boolean));
const out = resolve(args.out ?? 'smoke-out');
const only = args.only ? new Set(String(args.only).split(',')) : null;
const concurrency = Number(args.concurrency ?? 3);
const ws = join(out, 'ws'); const products = join(out, 'products'); const remotes = join(out, 'remotes'); const bin = join(out, 'bin');
const desktop = join(out, 'Desktop', 'Party Planner');
const g = (cwd, ...a) => spawnSync('git', ['-C', cwd, ...a], { encoding: 'utf8' });
const write = (root, files) => { for (const [f, b] of Object.entries(files)) { mkdirSync(join(root, f, '..'), { recursive: true }); writeFileSync(join(root, f), b); } };

// --fresh: a brand-new computer. No workspace, the scripts' state isolated from this machine's, and a fake GitHub that
// holds one project to link to. Its cases (fresh-*) start from the front door with an idea, notes, a folder or a link.
const fresh = Boolean(args.fresh);
const notes = join(out, 'Desktop', 'Gift Swap notes');
const home = join(out, 'Code');
if (fresh && !existsSync(join(out, 'gh.json'))) {
  for (const d of [remotes, bin, join(out, 'results'), home]) mkdirSync(d, { recursive: true });
  const fake = join(plugin, 'tests', 'fixtures', 'fakegh.mjs');
  writeFileSync(join(bin, 'gh.cmd'), `@node "${fake}" %*\r\n`);
  writeFileSync(join(bin, 'gh'), `#!/bin/sh\nexec node "${fake}" "$@"\n`, { mode: 0o755 });
  write(notes, {
    'plan.md': '# Gift Swap\n\nA secret-santa organiser for offices: everyone adds a wishlist, it draws names, and nobody sees who drew them.\n\n## Goals\n- 20 offices using it by Christmas\n- free for small teams, paid for companies over 50 people?\n\n## Open\n- not sure if HR teams or the employees themselves are the buyers\n',
    'competitor notes.txt': 'Elfster seems big. DrawNames too. Both feel cluttered.\n',
  });
  // A vibe-coded folder with no git, for the folder case.
  write(join(out, 'Desktop', 'Recipe Box'), {
    'README.md': '# Recipe Box\n\nSave recipes from any website and plan the week. Planned: shopping list, sharing with family.\n',
    'package.json': JSON.stringify({ name: 'recipe-box', version: '0.1.0', type: 'module', scripts: { start: 'node server.js', test: 'node --test' } }, null, 2),
    'server.js': "import { createServer } from 'node:http';\nconst recipes = [{ name: 'Dal' }];\ncreateServer((q, r) => { r.setHeader('content-type', 'text/html'); r.end(`<h1>Recipe Box</h1><ul>${recipes.map((x) => `<li>${x.name}</li>`).join('')}</ul>`); }).listen(4323);\n",
    'test/basic.test.js': "import { test } from 'node:test';\nimport assert from 'node:assert';\ntest('works', () => assert.ok(true));\n",
    'ideas.md': '# Ideas\n\n- import from Instagram\n- a paid plan for meal-prep coaches\n',
  });
  // Notes kept apart from the code, for the mix case (code + notes + what's only in their head).
  write(join(out, 'Documents', 'Recipe Box plans'), {
    'roadmap.md': '# Recipe Box roadmap\n\n1. Shopping list from the week plan\n2. Share a recipe box with family\n3. Recipes stay private: no public profiles, ever\n\nAudience: busy parents who cook 4-5 nights a week.\n',
  });
  // A small project already on (fake) GitHub, for the link case.
  const gb = join(out, 'seed', 'guest-book');
  write(gb, {
    'README.md': '# Guest Book\n\nVisitors leave a message on a wedding website. Planned: photo uploads, moderation, a printable book.\n',
    'package.json': JSON.stringify({ name: 'guest-book', version: '0.1.0', type: 'module', scripts: { start: 'node server.js', test: 'node --test' } }, null, 2),
    'server.js': "import { createServer } from 'node:http';\nconst notes = [];\ncreateServer((q, r) => { r.setHeader('content-type', 'text/html'); r.end(`<h1>Guest Book</h1><p>${notes.length} messages</p>`); }).listen(4322);\n",
    'test/basic.test.js': "import { test } from 'node:test';\nimport assert from 'node:assert';\ntest('works', () => assert.ok(true));\n",
  });
  spawnSync('git', ['init', '-q', '--bare', '-b', 'main', join(remotes, 'tester__guest-book.git')]);
  g(out, 'init', '-q', '-b', 'main', gb);
  g(gb, 'add', '-A'); g(gb, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', 'guest book');
  g(gb, 'push', '-q', join(remotes, 'tester__guest-book.git'), 'main');
  writeFileSync(join(out, 'gh.json'), JSON.stringify({ login: 'tester', repos: { 'tester/guest-book': { visibility: 'PRIVATE' } }, labels: {}, issues: [] }, null, 2));
}

// --- The sandbox -----------------------------------------------------------------------------------------------
if (!fresh && !existsSync(join(ws, 'studio.config.json'))) {
  for (const d of [ws, products, remotes, bin, join(out, 'results')]) mkdirSync(d, { recursive: true });
  cpSync(join(plugin, 'templates', 'workspace'), ws, { recursive: true });
  writeFileSync(join(ws, 'studio.config.json'), JSON.stringify({ studioRepo: 'tester/ws', demos: { maxLive: 2 } }, null, 2));
  writeFileSync(join(ws, 'studio.config.local.json'), JSON.stringify({ productsDir: products }, null, 2));
  spawnSync('git', ['init', '-q', '--bare', '-b', 'main', join(remotes, 'tester__ws.git')]);
  g(out, 'init', '-q', '-b', 'main', ws);
  g(ws, 'remote', 'add', 'origin', join(remotes, 'tester__ws.git'));
  g(ws, 'add', '-A'); g(ws, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', 'workspace'); g(ws, 'push', '-q', '-u', 'origin', 'main');
  writeFileSync(join(out, 'gh.json'), JSON.stringify({ login: 'tester', repos: { 'tester/ws': { visibility: 'PRIVATE' } }, labels: {}, issues: [
    { repo: 'tester/ws', number: 1, title: 'Meal planner for shift workers', state: 'OPEN', updatedAt: '2026-11-20T00:00:00Z', labels: [{ name: 'type:idea' }, { name: 'status:new' }, { name: 'source:team' }],
      body: '## Problem\n\nNurses and other shift workers eat badly on night shifts: plans assume a 9-to-5 day.\n\n## Hypothesis\n\nWe believe a meal planner built around rotating shifts will cause better eating for shift workers.\n\n<!-- studio\nslug: meal-planner\ntrack: portfolio\ndemo: none\nnext: /founder:discover meal-planner --quick\nupdated: 2026-11-20\n-->\n' },
  ] }, null, 2));
  const fake = join(plugin, 'tests', 'fixtures', 'fakegh.mjs');
  writeFileSync(join(bin, 'gh.cmd'), `@node "${fake}" %*\r\n`);
  writeFileSync(join(bin, 'gh'), `#!/bin/sh\nexec node "${fake}" "$@"\n`, { mode: 0o755 });
  // A small app someone made with an AI tool: no git, a plan in their own words, a TODO, tests that run offline.
  write(desktop, {
    'README.md': '# Party Planner\n\nPlan a party in minutes: guest list, RSVPs and a shopping list.\n\nRun `npm start` and open http://localhost:4321.\n',
    'package.json': JSON.stringify({ name: 'party-planner', version: '0.1.0', type: 'module', scripts: { start: 'node server.js', dev: 'node server.js', test: 'node --test' } }, null, 2),
    'server.js': "import { createServer } from 'node:http';\nimport { guests } from './lib.js';\ncreateServer((q, r) => { r.setHeader('content-type', 'text/html'); r.end(`<h1>Party Planner</h1><p>${guests(['Ana', 'Ben']).length} guests</p>`); }).listen(4321);\n",
    'lib.js': '// TODO: import guests from phone contacts\nexport const guests = (names) => names.filter(Boolean);\nexport const shopping = (guests) => ({ snacks: guests * 2, drinks: guests * 3 });\n',
    'test/lib.test.js': "import { test } from 'node:test';\nimport assert from 'node:assert';\nimport { guests, shopping } from '../lib.js';\ntest('guests', () => assert.equal(guests(['a', '', 'b']).length, 2));\ntest('shopping', () => assert.deepEqual(shopping(2), { snacks: 4, drinks: 6 }));\n",
    'My ideas.md': '# My ideas\n\n- a budget tracker per party\n- RSVP by text message\n- for wedding planners? they spend real money\n',
  });
}
const env = { ...process.env, STUDIO_DIR: ws, FAKEGH_STATE: join(out, 'gh.json'), FAKEGH_REMOTES: remotes, PATH: `${bin}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}` };
if (fresh) { delete env.STUDIO_DIR; env.FOUNDER_STATE_DIR = join(out, 'state'); env.FOUNDER_TRIAL_DIR = join(out, 'trial'); }
const freshRules = `This computer has never used Full Stack Founder. If a step sets up a workspace, use ${join(home, 'studio-workspace')} for it and ${home} as the products folder. Don't install or change anything outside this sandbox: no doctor --fix, no global git or Claude settings; list anything that would need installing and carry on without it.`;

// --- The cases ---------------------------------------------------------------------------------------------------
const rules = 'This is an automated test in a sandbox: `gh` is a stand-in for GitHub and the remotes are local folders, so nothing is real or public. Don\'t ask me anything: take your recommended answer at every decision, unless this message gives one. Never post, publish, send or spend. Finish with what you did, what you found and what you would have asked me, in at most 12 lines.';
const pp = join(products, 'party-planner');
const cases = [
  // phase 1: the machine check, then onboarding the vibe-coded app, which later cases work on
  { name: 'setup-check', phase: 1, cwd: ws, prompt: '/founder:setup check' },
  { name: 'adopt', phase: 1, cwd: out, prompt: `/founder:adopt "${desktop}"\n\nAnswers: yes to the preview, and yes, save it privately on GitHub. My ideas: guest list import from contacts; a budget tracker; and I feel strongly it should become a tool for wedding planners. For the brief: it's for people hosting parties at home, the problem is juggling guests and shopping in group chats, success in 90 days is 50 hosts using it. Skip the quick read for now. Yes to the lean-code rules, and yes to saving everything.` },
  // phase 2: everything else, mostly independent
  { name: 'ceo-brief', phase: 2, cwd: ws, prompt: '/founder:ceo' },
  { name: 'ceo-route', phase: 2, cwd: ws, prompt: '/founder:ceo can Party Planner make money? Plan only: don\'t run it yet.' },
  { name: 'idea-add', phase: 2, cwd: ws, prompt: '/founder:idea add a habit tracker for night-shift nurses' },
  { name: 'idea-move', phase: 2, cwd: ws, prompt: '/founder:idea move meal-planner parked too crowded for now' },
  { name: 'ask', phase: 2, cwd: ws, prompt: '/founder:ask what are the ideas for Party Planner, and what was decided?' },
  { name: 'next', phase: 2, cwd: ws, prompt: '/founder:next party-planner\n\nTell me the next step only; don\'t run it.' },
  { name: 'portfolio', phase: 2, cwd: ws, prompt: '/founder:portfolio' },
  { name: 'run-list', phase: 2, cwd: ws, prompt: '/founder:run list' },
  { name: 'check', phase: 2, cwd: ws, prompt: '/founder:check meal-planner\n\nAnswers: the first customer is Maya, an ICU nurse on rotating 12-hour shifts; she skips meals at 3am and buys vending-machine food; she has tried generic meal apps; she would pay $5 a month; success is 100 nurses using it weekly in 90 days; I have evenings only and won\'t build a recipe database.' },
  { name: 'prove', phase: 3, cwd: ws, prompt: '/founder:prove meal-planner\n\nThis is a test: use the stand-in panel instead of real conversations (marked simulated), then carry on to the board vote and the verdict, and stop at the decision.' },
  { name: 'research', phase: 2, cwd: ws, prompt: '/founder:research competitors meal-planner' },
  { name: 'board', phase: 2, cwd: ws, prompt: '/founder:board should Party Planner pivot to wedding planners?' },
  { name: 'market', phase: 2, cwd: ws, prompt: '/founder:market post party-planner a build story (copy only)' },
  { name: 'sales', phase: 2, cwd: ws, prompt: '/founder:sales icp party-planner' },
  { name: 'legal', phase: 2, cwd: ws, prompt: '/founder:legal trademark "Party Planner"' },
  { name: 'spec', phase: 2, cwd: pp, prompt: '/founder:spec mvp\n\nStop at the spec approval: don\'t approve it or make tickets.' },
  { name: 'verify', phase: 2, cwd: pp, prompt: '/founder:verify' },
  { name: 'showcase', phase: 2, cwd: pp, prompt: '/founder:showcase\n\nStop before anything goes public.' },
  { name: 'release', phase: 2, cwd: pp, prompt: '/founder:release\n\nPreview only: stop before pushing or tagging.' },
  { name: 'listen', phase: 2, cwd: ws, prompt: '/founder:listen party-planner' },
  { name: 'support', phase: 2, cwd: pp, prompt: '/founder:support triage' },
  { name: 'design', phase: 2, cwd: pp, prompt: '/founder:design\n\nStop at the first direction to pick.' },
  { name: 'finance', phase: 2, cwd: ws, prompt: '/founder:finance costs party-planner' },
  // phase 3: needs phase 2's state
  { name: 'pause', phase: 3, cwd: pp, prompt: '/founder:pause' },
  { name: 'resume', phase: 4, cwd: ws, prompt: '/founder:resume\n\nRecap only: don\'t start the next step.' },
  // --fresh only: the front door on a brand-new computer, with each kind of starting point.
  { name: 'fresh-idea', phase: 1, fresh: true, cwd: out, prompt: '/founder:ceo\n\nI have an idea: a tool that turns a nurse\'s shift rota into a weekly meal-prep plan. Just an idea for now. Stop at the verdict.' },
  { name: 'fresh-notes', phase: 1, fresh: true, cwd: out, prompt: `/founder:ceo\n\nI've been working on an idea, my notes are in "${notes}". Stop at the verdict.` },
  { name: 'fresh-folder', phase: 1, fresh: true, cwd: out, prompt: `/founder:ceo\n\nI built an app with an AI tool, it's in "${join(out, 'Desktop', 'Recipe Box')}". Bring it in; skip the Check and stop after the plan forward.` },
  { name: 'fresh-link', phase: 1, fresh: true, cwd: out, prompt: '/founder:ceo\n\nhttps://github.com/tester/guest-book is mine. Bring it in; skip the Check and stop after setup and the tests.' },
  { name: 'fresh-mix', phase: 1, fresh: true, cwd: out, prompt: `/founder:ceo\n\nI've got a few things for my recipe app: the code is in "${join(out, 'Desktop', 'Recipe Box')}", my plans are in "${join(out, 'Documents', 'Recipe Box plans')}", and in my head I want it to work offline in the kitchen. Bring it all in, skip the Check and stop once the brief is written.` },
].filter((c) => Boolean(c.fresh) === fresh).filter((c) => !only || only.has(c.name)).map((c) => (fresh ? { ...c, prompt: `${c.prompt}\n\n${freshRules}` } : c));

// --- Running and measuring -------------------------------------------------------------------------------------------
function tokens(session) {
  const root = join(homedir(), '.claude', 'projects');
  const dir = readdirSync(root).map((d) => join(root, d)).find((d) => existsSync(join(d, `${session}.jsonl`)));
  if (!dir) return null;
  const files = [join(dir, `${session}.jsonl`)];
  const sub = join(dir, session, 'subagents');
  if (existsSync(sub)) for (const f of readdirSync(sub)) if (f.endsWith('.jsonl')) files.push(join(sub, f));
  let total = 0; let agents = files.length - 1;
  for (const f of files) {
    const seen = new Set();
    for (const l of readFileSync(f, 'utf8').split(/\r?\n/)) {
      if (!l) continue; let j; try { j = JSON.parse(l); } catch { continue; }
      const u = j.type === 'assistant' && j.message?.usage; if (!u || seen.has(j.message.id)) continue; seen.add(j.message.id);
      total += (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0);
    }
  }
  return { total, agents };
}
function runCase(c) {
  return new Promise((done) => {
    const started = Date.now();
    const argv = ['-p', `${c.prompt}\n\n${rules}`, '--plugin-dir', plugin, '--output-format', 'json', '--permission-mode', 'acceptEdits',
      '--allowedTools', 'Bash', 'PowerShell', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'Task', 'Skill'];
    const child = spawn('claude', argv, { cwd: existsSync(c.cwd) ? c.cwd : out, env, shell: process.platform === 'win32' && false, windowsHide: true });
    let stdout = ''; child.stdout.on('data', (d) => { stdout += d; }); child.stderr.on('data', (d) => { stdout += d; });
    const timer = setTimeout(() => child.kill(), 20 * 60 * 1000);
    child.on('close', () => {
      clearTimeout(timer);
      let j = {}; try { j = JSON.parse(stdout.slice(stdout.indexOf('{'))); } catch {}
      const t = j.session_id ? tokens(j.session_id) : null;
      const row = { name: c.name, seconds: Math.round((Date.now() - started) / 1000), tokensK: t ? Math.round(t.total / 1000) : null, agents: t?.agents ?? null, costUsd: j.total_cost_usd ?? null, ok: !j.is_error && Boolean(j.result), session: j.session_id ?? null };
      writeFileSync(join(out, 'results', `${c.name}.md`), `# ${c.name}\n\n${JSON.stringify(row)}\n\n## Prompt\n\n${c.prompt}\n\n## Reply\n\n${j.result ?? stdout.slice(-4000)}\n`);
      console.log(JSON.stringify(row));
      done(row);
    });
  });
}
const rows = [];
for (const phase of [...new Set(cases.map((c) => c.phase))].sort()) {
  const queue = cases.filter((c) => c.phase === phase);
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, async () => { while (queue.length) rows.push(await runCase(queue.shift())); }));
}
writeFileSync(join(out, 'results', 'summary.json'), JSON.stringify(rows, null, 2));
console.log(`TOTAL ${Math.round(rows.reduce((n, r) => n + (r.tokensK ?? 0), 0))}k tokens, ${rows.length} cases, $${rows.reduce((n, r) => n + (r.costUsd ?? 0), 0).toFixed(2)}`);
