// A stand-in for the GitHub CLI, for tests: answers the gh calls the scripts make from a JSON state file
// (FAKEGH_STATE), and records every call in it. Nothing touches GitHub.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const file = process.env.FAKEGH_STATE;
const st = JSON.parse(readFileSync(file, 'utf8'));
const a = process.argv.slice(2);
st.calls = [...(st.calls ?? []), a.join(' ')];
const save = () => writeFileSync(file, JSON.stringify(st, null, 2));
const alias = { '-R': '--repo', '--title': '-t', '--body': '-b', '--body-file': '-F', '--label': '-l' };
const opt = (k) => { const i = a.findIndex((v) => v === k || v === alias[k]); return i >= 0 ? a[i + 1] : undefined; };
const isLabel = (v) => v === '--label' || v === '-l' || v === '--add-label';
const out = (v) => { save(); process.stdout.write(typeof v === 'string' ? v : JSON.stringify(v)); process.exit(0); };
const die = (msg) => { save(); process.stderr.write(msg); process.exit(1); };
const [x, y] = a;
// With FAKEGH_REMOTES set, every repo is a bare git repo in that folder, so clones and pushes work offline.
const remoteOf = (name) => {
  if (!process.env.FAKEGH_REMOTES) return `https://github.com/${name}.git`;
  const bare = join(process.env.FAKEGH_REMOTES, `${name.replace('/', '__')}.git`);
  if (!existsSync(bare)) execFileSync('git', ['init', '-q', '--bare', '-b', 'main', bare]);
  return bare;
};
const issueOf = () => (st.issues ?? []).find((v) => v.number === Number(a[2]) && (!opt('-R') || v.repo === opt('-R')));

if (x === 'repo' && y === 'view') {
  const r = st.repos?.[a[2]];
  if (!r) die(`Could not resolve to a Repository with the name '${a[2]}'.`);
  out({ name: a[2].split('/')[1], description: r.description ?? '', visibility: r.visibility ?? 'PRIVATE', defaultBranchRef: { name: 'main' }, primaryLanguage: null, homepageUrl: '', isArchived: false });
}
if (x === 'repo' && y === 'clone') {
  const dir = a[3];
  mkdirSync(dir, { recursive: true });
  const url = remoteOf(a[2]);
  if (process.env.FAKEGH_REMOTES) execFileSync('git', ['clone', '-q', url, dir]);
  else { execFileSync('git', ['init', '-q', '-b', 'main', dir]); execFileSync('git', ['-C', dir, 'remote', 'add', 'origin', url]); }
  out('');
}
if (x === 'repo' && y === 'create') {
  const name = a[2];
  (st.repos ??= {})[name] = { visibility: a.includes('--private') ? 'PRIVATE' : 'PUBLIC', created: true };
  const src = opt('--source');
  if (src && existsSync(src)) {
    execFileSync('git', ['-C', src, 'remote', 'add', 'origin', remoteOf(name)]);
    if (a.includes('--push') && process.env.FAKEGH_REMOTES) execFileSync('git', ['-C', src, 'push', '-q', '-u', 'origin', 'HEAD']);
  }
  out(`https://github.com/${name}\n`);
}
if (x === 'api' && y === 'user') out(st.login ?? 'tester');
if (x === 'api' && y === 'graphql') out({ data: {} });
if (x === 'label' && y === 'list') out((st.labels?.[opt('-R')] ?? []).map((n) => ({ name: n })));
if (x === 'label' && y === 'create') { ((st.labels ??= {})[opt('-R')] ??= []).push(a[2]); out(''); }
if (x === 'issue' && y === 'list') {
  const repo = opt('-R'); const label = opt('--label');
  out((st.issues ?? []).filter((i) => i.repo === repo && (!label || i.labels.some((l) => l.name === label))).map(({ repo: _r, ...i }) => i));
}
if (x === 'issue' && y === 'create') {
  const repo = opt('-R'); const number = (st.issues ?? []).length + 1;
  const labels = a.flatMap((v, i) => (isLabel(a[i - 1]) ? v.split(',') : [])).map((n) => ({ name: n }));
  (st.issues ??= []).push({ repo, number, title: opt('--title'), body: opt('--body-file') ? readFileSync(opt('--body-file'), 'utf8') : (opt('--body') ?? ''), labels, state: 'OPEN', updatedAt: new Date().toISOString() });
  out(`https://github.com/${repo}/issues/${number}\n`);
}
if (x === 'issue' && y === 'edit') {
  const i = st.issues.find((v) => v.number === Number(a[2]) && v.repo === opt('-R'));
  if (opt('--body-file')) i.body = readFileSync(opt('--body-file'), 'utf8'); else if (opt('--body')) i.body = opt('--body');
  a.forEach((v, k) => { if (a[k - 1] === '--add-label' && !i.labels.some((l) => l.name === v)) i.labels.push({ name: v }); if (a[k - 1] === '--remove-label') i.labels = i.labels.filter((l) => l.name !== v); });
  out('');
}
if (x === 'issue' && y === 'view') { const i = issueOf(); if (!i) die('issue not found'); out({ ...i, comments: i.comments ?? [], url: `https://github.com/${i.repo}/issues/${i.number}` }); }
if (x === 'issue' && y === 'comment') { const i = issueOf(); if (!i) die('issue not found'); (i.comments ??= []).push({ body: opt('--body') ?? readFileSync(opt('--body-file'), 'utf8'), createdAt: new Date().toISOString() }); out(`https://github.com/${i.repo}/issues/${i.number}#comment\n`); }
if (x === 'issue' && y === 'close') { const i = issueOf(); if (!i) die('issue not found'); i.state = 'CLOSED'; out(''); }
if (x === 'release' && y === 'create') { (st.releases ??= []).push(a.slice(2).join(' ')); out('https://github.com/release\n'); }
if (x === 'repo' && y === 'edit') { (st.edits ??= []).push(a.slice(2).join(' ')); out(''); }
if (x === 'issue' && y === 'reopen') { st.issues.find((v) => v.number === Number(a[2])).state = 'OPEN'; out(''); }
if (x === 'auth' && y === 'status') out('Logged in');
die(`fakegh: unhandled ${a.join(' ')}`);
