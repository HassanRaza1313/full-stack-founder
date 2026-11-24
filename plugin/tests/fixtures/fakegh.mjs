// A stand-in for the GitHub CLI, for tests: answers the gh calls the scripts make from a JSON state file
// (FAKEGH_STATE), and records every call in it. Nothing touches GitHub.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const file = process.env.FAKEGH_STATE;
const st = JSON.parse(readFileSync(file, 'utf8'));
const a = process.argv.slice(2);
st.calls = [...(st.calls ?? []), a.join(' ')];
const save = () => writeFileSync(file, JSON.stringify(st, null, 2));
const opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
const out = (v) => { save(); process.stdout.write(typeof v === 'string' ? v : JSON.stringify(v)); process.exit(0); };
const die = (msg) => { save(); process.stderr.write(msg); process.exit(1); };
const [x, y] = a;

if (x === 'repo' && y === 'view') {
  const r = st.repos?.[a[2]];
  if (!r) die(`Could not resolve to a Repository with the name '${a[2]}'.`);
  out({ name: a[2].split('/')[1], description: r.description ?? '', visibility: r.visibility ?? 'PRIVATE', defaultBranchRef: { name: 'main' }, primaryLanguage: null, homepageUrl: '', isArchived: false });
}
if (x === 'repo' && y === 'clone') {
  const dir = a[3];
  mkdirSync(dir, { recursive: true });
  execFileSync('git', ['init', '-q', '-b', 'main', dir]);
  execFileSync('git', ['-C', dir, 'remote', 'add', 'origin', `https://github.com/${a[2]}.git`]);
  out('');
}
if (x === 'repo' && y === 'create') {
  const name = a[2];
  (st.repos ??= {})[name] = { visibility: a.includes('--private') ? 'PRIVATE' : 'PUBLIC', created: true };
  const src = opt('--source');
  if (src && existsSync(src)) execFileSync('git', ['-C', src, 'remote', 'add', 'origin', `https://github.com/${name}.git`]);
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
  const labels = a.flatMap((v, i) => (a[i - 1] === '--label' ? v.split(',') : [])).map((n) => ({ name: n }));
  (st.issues ??= []).push({ repo, number, title: opt('--title'), body: readFileSync(opt('--body-file'), 'utf8'), labels, state: 'OPEN', updatedAt: new Date().toISOString() });
  out(`https://github.com/${repo}/issues/${number}\n`);
}
if (x === 'issue' && y === 'edit') {
  const i = st.issues.find((v) => v.number === Number(a[2]) && v.repo === opt('-R'));
  if (opt('--body-file')) i.body = readFileSync(opt('--body-file'), 'utf8');
  a.forEach((v, k) => { if (a[k - 1] === '--add-label') i.labels.push({ name: v }); if (a[k - 1] === '--remove-label') i.labels = i.labels.filter((l) => l.name !== v); });
  out('');
}
if (x === 'issue' && y === 'reopen') { st.issues.find((v) => v.number === Number(a[2])).state = 'OPEN'; out(''); }
if (x === 'auth' && y === 'status') out('Logged in');
die(`fakegh: unhandled ${a.join(' ')}`);
