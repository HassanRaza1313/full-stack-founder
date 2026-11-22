// Pinned copies of the third-party skills Full Stack Founder runs, kept in plugin/vendor/ exactly as upstream ships them
// (minus their own evals/ test folders, which nothing here runs).
// Each plugin release ships one tested set: users never download skills, and upstream changes reach them only in a release.
//
//   node vendor.mjs verify            files match the lock, licences are present and allowed (CI and releases run this)
//   node vendor.mjs check             what changed upstream since the pins: newer versions, moved or removed skills
//   node vendor.mjs credits           rewrite the pinned-skills table in CREDITS.md from the lock
//   node vendor.mjs relock            recompute checksums from the copies on disk, after a deliberate trim
//   node vendor.mjs sync [<repo>...]  re-copy at the pinned version; --latest moves to the newest tag (or HEAD), --ref <tag|sha> to that one
//
// sync and check are for maintainers and need git and network. After a sync, run the evals before releasing.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = join(pluginRoot, 'vendor');
const lockPath = join(vendorDir, 'vendor.json');
const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
const ALLOWED = ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC'];
const [cmd = 'verify', ...rest] = process.argv.slice(2);
const flag = (n) => rest.includes(`--${n}`);
const opt = (n) => { const i = rest.indexOf(`--${n}`); return i >= 0 ? rest[i + 1] : undefined; };
const picked = rest.filter((a, i) => !a.startsWith('--') && rest[i - 1] !== '--ref');

const git = (args, cwd) => execFileSync('git', ['-c', 'core.autocrlf=false', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// Line endings are normalised, so a checkout on Windows hashes the same as on macOS and Linux.
function hashDir(dir) {
  const h = createHash('sha256');
  const walk = (d) => readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).forEach((e) => {
    const p = join(d, e.name);
    if (e.isDirectory()) return walk(p);
    h.update(`${relative(dir, p).replace(/\\/g, '/')}\0`);
    h.update(readFileSync(p).toString('latin1').replace(/\r\n/g, '\n'));
  });
  walk(dir);
  return h.digest('hex').slice(0, 16);
}

function licenceOf(dir) {
  const f = readdirSync(dir).find((n) => /^(LICEN[CS]E|COPYING)(\.\w+)?$/i.test(n));
  if (!f) return { file: null, spdx: 'NONE' };
  const t = readFileSync(join(dir, f), 'utf8');
  const spdx = /Apache License[\s\S]{0,40}Version 2\.0/i.test(t) ? 'Apache-2.0'
    : /Permission is hereby granted, free of charge/i.test(t) ? 'MIT'
    : /Redistribution and use in source and binary forms/i.test(t) ? (/Neither the name/i.test(t) ? 'BSD-3-Clause' : 'BSD-2-Clause')
    : /Permission to use, copy, modify, and\/or distribute/i.test(t) ? 'ISC' : 'UNKNOWN';
  return { file: f, spdx };
}

const frontLicence = (skillMd) => (readFileSync(skillMd, 'utf8').match(/^license:\s*(.+)$/m) || [])[1]?.trim();

// Finds <name>/SKILL.md in the repo's file list: the recorded path first, then the shallowest match.
function locate(paths, name, hint) {
  if (hint && paths.has(`${hint}/SKILL.md`)) return hint;
  const hits = [...paths].filter((p) => p === `${name}/SKILL.md` || p.endsWith(`/${name}/SKILL.md`)).map((p) => p.slice(0, -'/SKILL.md'.length));
  return hits.sort((x, y) => x.split('/').length - y.split('/').length)[0] ?? null;
}

function newestTag(repo) {
  const out = git(['ls-remote', '--tags', '--refs', '--sort=-v:refname', `https://github.com/${repo}`]);
  return out ? out.split('\n')[0].split('refs/tags/')[1] : null;
}

function sync(slug) {
  const e = lock.repos[slug];
  const ref = opt('ref') ?? (flag('latest') ? newestTag(e.repo) ?? 'HEAD' : e.ref ?? e.sha);
  const tmp = mkdtempSync(join(tmpdir(), `vendor-${slug}-`));
  try {
    // Fetch the file list only, then check out just the skill folders and licence files: big repos stay fast.
    git(['init', '-q'], tmp);
    git(['remote', 'add', 'origin', `https://github.com/${e.repo}`], tmp);
    git(['fetch', '-q', '--depth', '1', '--filter=blob:none', 'origin', ref], tmp);
    const paths = new Set(git(['ls-tree', '-r', '--name-only', 'FETCH_HEAD'], tmp).split(String.fromCharCode(10)).map((p) => p.trim()));
    const found = Object.fromEntries(Object.entries(e.skills).map(([name, s]) => [name, locate(paths, name, s.path)]));
    const missing = Object.keys(found).filter((n) => !found[n]);
    if (missing.length) throw new Error(`${e.repo}@${ref}: skill(s) not found: ${missing.join(', ')}`);
    git(['sparse-checkout', 'set', '--no-cone', '/LICENSE*', '/LICENCE*', '/NOTICE*', '/COPYING*', ...Object.values(found).map((p) => `/${p}/`)], tmp);
    git(['checkout', '-q', 'FETCH_HEAD'], tmp);
    const sha = git(['rev-parse', 'HEAD'], tmp);
    const lic = licenceOf(tmp);
    if (!ALLOWED.includes(lic.spdx)) throw new Error(`${e.repo}: licence ${lic.spdx} isn't allowed for redistribution`);
    const out = join(vendorDir, slug);
    rmSync(out, { recursive: true, force: true });
    for (const n of readdirSync(tmp).filter((f) => /^(LICEN[CS]E|NOTICE|COPYING)(\.\w+)?$/i.test(f))) cpSync(join(tmp, n), join(out, n));
    const changes = [];
    for (const [name, s] of Object.entries(e.skills)) {
      const path = found[name];
      cpSync(join(tmp, path), join(out, name), { recursive: true, filter: (p) => !/[\\/](\.git|node_modules|evals)([\\/]|$)/.test(p) });
      const fl = frontLicence(join(out, name, 'SKILL.md'));
      if (fl && !ALLOWED.some((a) => fl.includes(a))) throw new Error(`${name}: its own licence is "${fl}"`);
      const hash = hashDir(join(out, name));
      if (hash !== s.hash) changes.push(name);
      e.skills[name] = { path, hash };
    }
    const from = e.ref ?? e.sha?.slice(0, 7);
    Object.assign(e, { ref: /^[0-9a-f]{40}$/.test(ref) || ref === 'HEAD' ? null : ref, sha, license: lic.spdx, synced: new Date().toLocaleDateString('en-CA') });
    console.log(`${slug}: ${from ?? 'new'} -> ${e.ref ?? sha.slice(0, 7)}; ${changes.length ? `changed: ${changes.join(', ')}` : 'no skill changed'}`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

function verify() {
  const problems = [];
  const notes = [];
  for (const [slug, e] of Object.entries(lock.repos)) {
    const dir = join(vendorDir, slug);
    if (!existsSync(dir)) { problems.push(`${slug}: not vendored (run sync)`); continue; }
    const lic = licenceOf(dir);
    if (!lic.file) problems.push(`${slug}: licence file missing`);
    else if (lic.spdx !== e.license || !ALLOWED.includes(lic.spdx)) problems.push(`${slug}: licence ${lic.spdx}, lock says ${e.license}`);
    for (const [name, s] of Object.entries(e.skills)) {
      const sd = join(dir, name);
      if (!existsSync(join(sd, 'SKILL.md'))) { problems.push(`${slug}/${name}: missing`); continue; }
      if (hashDir(sd) !== s.hash) problems.push(`${slug}/${name}: files differ from the pinned copy`);
      const text = readFileSync(join(sd, 'SKILL.md'), 'utf8');
      const media = [];
      const walk = (d) => readdirSync(d, { withFileTypes: true }).forEach((x) => (x.isDirectory() ? walk(join(d, x.name)) : /.(woff2?|ttf|otf|mp3|wav|m4a|ogg|mp4|mov)$/i.test(x.name) && media.push(x.name)));
      walk(sd);
      if (media.length && !s.mediaReviewed) problems.push(`${slug}/${name}: bundles fonts or media (${media.slice(0, 3).join(', ')}), which carry their own licences: review them, or don't vendor this skill`);
      if (text.includes('${CLAUDE_SKILL_DIR}')) notes.push(`${name} uses \${CLAUDE_SKILL_DIR}`);
    }
  }
  // Every skill the job map names must be vendored, or listed as an external dependency.
  const known = new Set([...Object.values(lock.repos).flatMap((e) => Object.keys(e.skills)), ...Object.keys(lock.external ?? {})]);
  const map = readFileSync(join(pluginRoot, 'references', 'skills.md'), 'utf8');
  for (const row of map.split('\n').filter((l) => l.startsWith('| ') && !l.startsWith('| Job') && !l.startsWith('|---'))) {
    for (const [, n] of row.split('|')[2].matchAll(/`([^`]+)`/g)) {
      const base = n.replace(/\s*†$/, '');
      if (!base.startsWith('/') && !known.has(base) && !(base.endsWith('*') && [...known].some((k) => k.startsWith(base.slice(0, -1))))) problems.push(`skills.md names "${base}", which isn't vendored or external`);
    }
  }
  const count = Object.values(lock.repos).reduce((a, e) => a + Object.keys(e.skills).length, 0);
  if (notes.length && flag('verbose')) console.log(`Notes: ${notes.join('; ')}`);
  if (problems.length) { console.log(`✗ vendor: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`); process.exit(1); }
  console.log(`✓ vendor: ${count} skills from ${Object.keys(lock.repos).length} repos match their pins and licences`);
}

async function check() {
  const token = process.env.GITHUB_TOKEN || (() => { try { return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } })();
  const headers = { 'User-Agent': 'full-stack-founder-vendor-check', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const lines = [];
  let broken = 0;
  for (const [slug, e] of Object.entries(lock.repos)) {
    const tag = newestTag(e.repo);
    const res = await fetch(`https://api.github.com/repos/${e.repo}/git/trees/HEAD?recursive=1`, { headers });
    if (!res.ok) { lines.push(`- **${slug}**: couldn't read upstream (${res.status})`); broken++; continue; }
    const paths = new Set((await res.json()).tree.map((t) => t.path));
    const gone = Object.entries(e.skills).filter(([, s]) => !paths.has(`${s.path}/SKILL.md`)).map(([n]) => {
      const moved = [...paths].find((p) => p.endsWith(`/${n}/SKILL.md`));
      return moved ? `${n} moved to ${moved.replace('/SKILL.md', '')}` : `${n} removed`;
    });
    broken += gone.length;
    const newer = tag && tag !== e.ref ? `newer version ${tag} (pinned ${e.ref ?? e.sha.slice(0, 7)})` : '';
    if (gone.length || newer) lines.push(`- **${slug}** (${e.repo}): ${[newer, ...gone].filter(Boolean).join('; ')}`);
  }
  console.log(lines.length ? `## Upstream changes since the pins\n\n${lines.join('\n')}\n\nNext: \`vendor.mjs sync <repo> --latest\`, run the evals, release if nothing regressed.` : 'All pins are current; every pinned skill still exists upstream.');
  process.exit(broken ? 1 : 0);
}

// Rewrites the pinned-skills table in CREDITS.md from the lock, so credits, versions and licences never drift.
function credits() {
  const f = join(pluginRoot, '..', 'CREDITS.md');
  const rows = Object.entries(lock.repos).map(([slug, e]) => `| [${e.repo}](https://github.com/${e.repo}) | ${Object.keys(e.skills).map((n) => `\`${n}\``).join(', ')} | ${e.ref ?? 'commit'} (\`${e.sha?.slice(0, 7) ?? '?'}\`) | ${e.license} | \`plugin/vendor/${slug}/\` |`);
  const table = `<!-- vendor:start -->\n| Upstream | Skills | Version | Licence | Copy and licence file |\n|---|---|---|---|---|\n${rows.join('\n')}\n<!-- vendor:end -->`;
  const s = readFileSync(f, 'utf8');
  writeFileSync(f, s.includes('<!-- vendor:start -->') ? s.replace(/<!-- vendor:start -->[\s\S]*<!-- vendor:end -->/, table) : `${s.trimEnd()}\n\n${table}\n`);
  console.log(`CREDITS.md: ${rows.length} upstream repos`);
}

if (cmd === 'credits') credits();
else if (cmd === 'sync') {
  // The lock is saved after each repo, so an interrupted sync keeps what it finished; a failed repo keeps its old pin.
  const failed = [];
  for (const slug of picked.length ? picked : Object.keys(lock.repos)) {
    if (!lock.repos[slug]) throw new Error(`Unknown repo "${slug}". Known: ${Object.keys(lock.repos).join(', ')}`);
    try { sync(slug); writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`); } catch (err) { failed.push(slug); console.log(`✗ ${slug}: ${err.message.split('\n')[0]}`); }
  }
  if (failed.length) { console.log(`Not synced: ${failed.join(', ')}. Re-run: vendor.mjs sync ${failed.join(' ')}`); process.exit(1); }
  verify();
  credits();
} else if (cmd === 'verify') verify();
else if (cmd === 'check') await check();
else if (cmd === 'relock') {
  for (const [slug, e] of Object.entries(lock.repos)) for (const [n, sk] of Object.entries(e.skills)) sk.hash = hashDir(join(vendorDir, slug, n));
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  verify();
} else { console.error('Usage: vendor.mjs verify | check | sync [<repo>...] [--latest | --ref <tag|sha>]'); process.exit(1); }
