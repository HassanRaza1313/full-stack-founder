// /founder:adopt's script, end to end against a fake GitHub: folders and repos, copies, the catalog entry, the knowledge folder.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { gitRepo, json, sandbox } from './helpers.mjs';

const app = { 'package.json': JSON.stringify({ name: 'my-app', scripts: { dev: 'vite', test: 'vitest run', build: 'vite build' }, devDependencies: { vite: '5' } }), 'package-lock.json': '{}', 'plan.md': '# Plan\n- add dark mode\n', 'src/main.js': '// TODO: handle errors\n' };

test('a folder with no GitHub repo: moves home, knowledge in the workspace, catalog entry without paths', () => {
  const s = sandbox();
  const folder = join(s.root, 'Desktop', 'My App');
  mkdirSync(folder, { recursive: true });
  for (const [f, b] of Object.entries(app)) { mkdirSync(join(folder, f, '..'), { recursive: true }); writeFileSync(join(folder, f), b); }

  const plan = json(s.run('adopt.mjs', ['--path', folder, '--dry-run']));
  assert.equal(plan.source, 'folder');
  assert.equal(plan.knowledge, 'workspace');
  assert.match(plan.action, /^move /);
  assert.ok(existsSync(folder), 'a dry run changes nothing');

  const r = s.run('adopt.mjs', ['--path', folder, '--no-labels']);
  assert.equal(r.status, 0, r.stderr);
  const out = json(r);
  const home = join(s.products, 'My App');
  assert.ok(existsSync(join(home, 'plan.md')) && !existsSync(folder), 'moved into the products folder');
  const k = join(s.ws, 'products', 'My App', 'product');
  const state = readFileSync(join(k, 'STATE.md'), 'utf8');
  assert.match(state, /^stage: onboarding$/m);
  assert.match(state, /^ready: your ideas — · brief — · build plan — · ideas reviewed — · setup — · tests —$/m);
  const sv = JSON.parse(readFileSync(join(k, 'services.json'), 'utf8'));
  assert.equal(sv.commands.install, 'npm ci');
  assert.equal(sv.commands.url, 'http://localhost:5173');
  assert.equal(sv.paths, undefined, "the template's paths are dropped");
  assert.deepEqual(sv.services, [], 'no supabase without a supabase folder');

  const issue = s.gh().issues[0];
  assert.equal(out.catalogIssue, 1);
  assert.match(issue.body, /^local: My App$/m);
  assert.doesNotMatch(issue.body, /^repo:/m);
  assert.doesNotMatch(issue.body, /[A-Za-z]:\\|\/tmp\/|founder-test-/, 'no path from this computer in the catalog');
});

test('a GitHub repo: public defaults to workspace knowledge; private to the repo; labels are added, existing kept', () => {
  const s = sandbox({ repos: { 'tester/pub': { visibility: 'PUBLIC' }, 'tester/priv': { visibility: 'PRIVATE' } }, labels: { 'tester/priv': ['type:idea'] } });
  assert.equal(json(s.run('adopt.mjs', ['--repo', 'https://github.com/tester/pub.git', '--dry-run'])).knowledge, 'workspace');
  assert.equal(json(s.run('adopt.mjs', ['--repo', 'tester/priv', '--dry-run'])).knowledge, 'repo');
  const r = s.run('adopt.mjs', ['--repo', 'tester/priv']);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(join(s.products, 'priv', '.git')), 'cloned into the products folder');
  assert.ok(existsSync(join(s.products, 'priv', 'product', 'STATE.md')), 'knowledge in the repo');
  const labels = s.gh().labels['tester/priv'];
  assert.equal(labels.filter((l) => l === 'type:idea').length, 1, 'an existing label is not created again');
  assert.ok(labels.includes('status:building'));
});

test('copies: local-only files join the main copy, rebuildable ones do not, the copy moves aside', () => {
  const s = sandbox({ repos: { 'tester/app': { visibility: 'PRIVATE' } } });
  const remote = 'https://github.com/tester/app.git';
  gitRepo(join(s.products, 'app'), app, remote);
  const old = gitRepo(join(s.root, 'Old Projects', 'app copy'), { ...app, '.gitignore': 'data/\nnode_modules/\n' }, remote);
  mkdirSync(join(old, 'data'), { recursive: true }); writeFileSync(join(old, 'data', 'books.txt'), 'only here');
  mkdirSync(join(old, 'node_modules', 'x'), { recursive: true }); writeFileSync(join(old, 'node_modules', 'x', 'i.js'), '');

  const plan = json(s.run('adopt.mjs', ['--repo', 'tester/app', '--dry-run']));
  assert.equal(plan.action, 'already in the products folder');
  assert.equal(plan.copies.length, 1);
  assert.ok(plan.copies[0].examples.some((f) => f.startsWith('data')));

  const out = json(s.run('adopt.mjs', ['--repo', 'tester/app', '--consolidate', '--no-labels']));
  assert.ok(existsSync(join(s.products, 'app', 'data', 'books.txt')), 'local-only data carried over');
  assert.ok(!existsSync(join(s.products, 'app', 'node_modules')), 'packages are not carried');
  assert.ok(out.retired[0].movedTo && existsSync(out.retired[0].movedTo), 'the copy is moved aside, not deleted');
  assert.ok(!existsSync(old));
});

test('a copy with unsaved work is left alone', () => {
  const s = sandbox({ repos: { 'tester/app': { visibility: 'PRIVATE' } } });
  const remote = 'https://github.com/tester/app.git';
  gitRepo(join(s.products, 'app'), app, remote);
  const old = gitRepo(join(s.root, 'elsewhere', 'app'), app, remote);
  writeFileSync(join(old, 'plan.md'), '# Plan\n- changed, not committed\n');
  const out = json(s.run('adopt.mjs', ['--repo', 'tester/app', '--consolidate', '--no-labels']));
  assert.equal(out.retired[0].kept, true);
  assert.ok(existsSync(old));
});

test('no copy at home: the richest copy moves in instead of a fresh clone', () => {
  const s = sandbox({ repos: { 'tester/app': { visibility: 'PRIVATE' } } });
  const old = gitRepo(join(s.root, 'Training', 'App Project'), { ...app, '.gitignore': 'data/\n' }, 'https://github.com/tester/app.git');
  mkdirSync(join(old, 'data')); writeFileSync(join(old, 'data', 'x.txt'), 'x');
  const plan = json(s.run('adopt.mjs', ['--repo', 'tester/app', '--dry-run']));
  assert.match(plan.action, /^move .*App Project/);
  const r = s.run('adopt.mjs', ['--repo', 'tester/app', '--no-labels']);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(join(s.products, 'app', 'data', 'x.txt')));
  assert.ok(!s.gh().calls.some((c) => c.startsWith('repo clone')), 'no clone');
});

test('--create-repo: a folder gets a private repo, with .env kept out', () => {
  const s = sandbox();
  const folder = join(s.root, 'vibe');
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, 'index.html'), '<h1>hi</h1>'); writeFileSync(join(folder, '.env'), 'KEY=abc');
  const r = s.run('adopt.mjs', ['--path', folder, '--create-repo', '--no-labels']);
  assert.equal(r.status, 0, r.stderr);
  const st = s.gh();
  assert.equal(st.repos['tester/vibe'].visibility, 'PRIVATE');
  const home = join(s.products, 'vibe');
  assert.match(readFileSync(join(home, '.gitignore'), 'utf8'), /^\.env$/m);
  const tracked = execFileSync('git', ['-C', home, 'ls-files'], { encoding: 'utf8' });
  assert.doesNotMatch(tracked, /^\.env$/m);
  assert.match(st.issues[0].body, /^repo: tester\/vibe$/m);
});
