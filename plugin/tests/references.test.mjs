// Every flow's references resolve: files, scripts, commands, playbooks, agents and skills; skill frontmatter is valid.
// Plus the plain-language rules every flow follows are in place.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';
import { plugin } from './helpers.mjs';

const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith('.md')) files.push(p); } };
['skills', 'playbooks', 'references', 'agents'].forEach((d) => walk(join(plugin, d)));
const skills = new Set(readdirSync(join(plugin, 'skills')));
const playbooks = new Set(readdirSync(join(plugin, 'playbooks')).map((f) => f.replace('.md', '')));
const vendored = new Set();
const vwalk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (existsSync(join(p, 'SKILL.md'))) vendored.add(f); vwalk(p); } } };
vwalk(join(plugin, 'vendor'));
const external = new Set(['schedule', 'impeccable']); // a Claude Code skill, and a plugin /founder:setup installs
const coming = new Set(['graduate', 'deploy']); // marked as coming in the docs

test('references resolve', () => {
  const issues = [];
  for (const f of files) {
    const s = readFileSync(f, 'utf8'); const rel = relative(plugin, f);
    for (const m of s.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([\w./-]+)/g)) { const p = m[1].replace(/[.,)]+$/, ''); if (!existsSync(join(plugin, p))) issues.push(`${rel}: missing file ${p}`); }
    for (const m of s.matchAll(/\/founder:([a-z-]+)/g)) if (!skills.has(m[1]) && !coming.has(m[1])) issues.push(`${rel}: unknown command /founder:${m[1]}`);
    for (const m of s.matchAll(/\/founder:run ([a-z-]+)/g)) if (!playbooks.has(m[1]) && !['list', 'status'].includes(m[1])) issues.push(`${rel}: unknown playbook ${m[1]}`);
    for (const m of s.matchAll(/playbook `([a-z-]+)`/g)) if (!playbooks.has(m[1])) issues.push(`${rel}: unknown playbook ${m[1]}`);
    for (const m of s.matchAll(/scripts\/([\w-]+\.mjs)/g)) if (!existsSync(join(plugin, 'scripts', m[1]))) issues.push(`${rel}: missing script ${m[1]}`);
    for (const m of s.matchAll(/`([a-z0-9-]+)` skill/g)) if (!vendored.has(m[1]) && !skills.has(m[1]) && !external.has(m[1])) issues.push(`${rel}: skill not pinned: ${m[1]}`);
    for (const m of s.matchAll(/`(scout|researcher|analyst|builder|architect|[a-z]+-agent)`(?= (subagent|agent))/g)) if (!existsSync(join(plugin, 'agents', `${m[1]}.md`))) issues.push(`${rel}: unknown agent ${m[1]}`);
  }
  assert.deepEqual(issues, []);
});

test('skill frontmatter: name matches the folder, description present and short enough', () => {
  const issues = [];
  for (const d of skills) {
    const s = readFileSync(join(plugin, 'skills', d, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n');
    const fm = s.match(/^---\n([\s\S]*?)\n---/)?.[1];
    if (!fm) { issues.push(`${d}: no frontmatter`); continue; }
    if (fm.match(/^name: (.*)$/m)?.[1].trim() !== d) issues.push(`${d}: name differs from folder`);
    const desc = fm.match(/^description: (.*)$/m)?.[1] ?? '';
    if (!desc || desc.length > 1024) issues.push(`${d}: description ${desc.length} chars`);
  }
  assert.deepEqual(issues, []);
});

test('plain language: the shared rules and the onboarding flow keep it simple', () => {
  const journey = readFileSync(join(plugin, 'references', 'journey.md'), 'utf8');
  for (const rule of ['**Speak plainly.**', '**Defaults over questions.**', '**One question at a time,**', '**Plain words**', 'Next step as words they can say back']) assert.ok(journey.includes(rule), rule);
  const adopt = readFileSync(join(plugin, 'skills', 'adopt', 'SKILL.md'), 'utf8');
  for (const part of ['Your idea, as it stands', 'Scale the review to the idea', 'Set up on this computer', 'tests pass']) assert.ok(adopt.includes(part), part);
  assert.ok(readFileSync(join(plugin, 'skills', 'capture', 'SKILL.md'), 'utf8').includes('inputs, not decisions'));
});

test('no flow hard-codes the template stack without a fallback', () => {
  const offenders = [];
  for (const d of ['verify', 'design', 'legal', 'market', 'release', 'support']) {
    const s = readFileSync(join(plugin, 'skills', d, 'SKILL.md'), 'utf8');
    for (const bad of ['`pnpm check`', '**`pnpm audit`', 'packages/shared/src/tokens.ts', 'apps/web/public/', '`app/help`', '`app/changelog`', 'packages/shared/src/env.ts', '`scripts/demo-walkthrough.mjs`']) if (s.includes(bad)) offenders.push(`${d}: ${bad}`);
  }
  assert.deepEqual(offenders, []);
});

test('every agent lists its own tools, so no helper inherits the user\'s connectors', () => {
  const missing = [];
  for (const f of readdirSync(join(plugin, 'agents'))) {
    const fm = readFileSync(join(plugin, 'agents', f), 'utf8').split('---')[1] ?? '';
    const tools = fm.match(/^tools:\s*(.+)$/m)?.[1];
    if (!tools) { missing.push(`${f}: no tools line`); continue; }
    for (const t of tools.split(',').map((x) => x.trim())) if (t.startsWith('mcp__') && !t.startsWith('mcp__context7__')) missing.push(`${f}: ${t}`);
  }
  assert.deepEqual(missing, []);
});

test('check and prove: the plain verdict, both sides, the expert skills, and a fresh chat per stage', () => {
  const read = (p) => readFileSync(join(plugin, p), 'utf8');
  const verdict = read('references/verdict.md');
  for (const rule of ['**About 250 words, never over 300,**', '**No codes or shorthand:**', '**Both sides, weighed.**', '🟢', '🟡', '🔴']) assert.ok(verdict.includes(rule), rule);
  const check = read('skills/check/SKILL.md');
  for (const s of ['startup-design', 'case-for.md', 'case-against.md', 'verdict.md', 'stage.mjs', 'in a new chat']) assert.ok(check.includes(s), `check: ${s}`);
  const prove = read('skills/prove/SKILL.md');
  for (const s of ['startup-design', 'skills/board/SKILL.md', 'simulated', 'verdict.md', 'stage.mjs', 'in a new chat']) assert.ok(prove.includes(s), `prove: ${s}`);
  assert.doesNotMatch(read('playbooks/validate.md') + read('playbooks/idea-to-launch.md'), /--quick|--frame/);
});

test('no flow points at a mode that no longer exists', () => {
  const offenders = files.filter((f) => /discover[^\n]{0,40}--(quick|frame)|discover <(slug|idea)>/.test(readFileSync(f, 'utf8'))).map((f) => relative(plugin, f));
  assert.deepEqual(offenders, []);
});

test('capture: how far along first, intent not facts, "not sure" welcome, short, then check and adopt build on it', () => {
  const read = (p) => readFileSync(join(plugin, p), 'utf8');
  const c = read('skills/capture/SKILL.md');
  for (const s of ['How far along are you?', 'Just an idea', 'I know what I want from it', "I've done work on it", '**What we ask about: intent, never facts.**', '"Not sure" is always a good answer', 'up to 3 questions', '6 at most', 'at most 2 rounds and 8 questions', 'grilling', 'plan-vs-code.md', '"that\'s enough"', 'Is this right?']) assert.ok(c.includes(s), `capture: ${s}`);
  assert.ok(read('skills/check/SKILL.md').includes('skills/capture/SKILL.md'), 'check runs capture');
  const adopt = read('skills/adopt/SKILL.md');
  for (const s of ['skills/capture/SKILL.md', '/founder:check', 'your-call']) assert.ok(adopt.includes(s), `adopt: ${s}`);
  for (const f of ['skills/check/SKILL.md', 'skills/prove/SKILL.md', 'references/verdict.md']) assert.match(read(f), /[Bb]uild it anyway/, f);
});

test('skill headers parse: a description with ": " in it is quoted', () => {
  const bad = readdirSync(join(plugin, 'skills')).filter((d) => {
    const m = readFileSync(join(plugin, 'skills', d, 'SKILL.md'), 'utf8').match(/^description: (.*?)\r?$/m);
    return m && !/^["'>|]/.test(m[1]) && /: /.test(m[1]);
  });
  assert.deepEqual(bad, []);
});
