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
  for (const part of ['Ask first: your ideas', 'inputs, not decisions', 'Scale the review to the idea', 'Set up on this computer', 'tests pass']) assert.ok(adopt.includes(part), part);
});

test('no flow hard-codes the template stack without a fallback', () => {
  const offenders = [];
  for (const d of ['verify', 'design', 'legal', 'market', 'release', 'support']) {
    const s = readFileSync(join(plugin, 'skills', d, 'SKILL.md'), 'utf8');
    for (const bad of ['`pnpm check`', '**`pnpm audit`', 'packages/shared/src/tokens.ts', 'apps/web/public/', '`app/help`', '`app/changelog`', 'packages/shared/src/env.ts', '`scripts/demo-walkthrough.mjs`']) if (s.includes(bad)) offenders.push(`${d}: ${bad}`);
  }
  assert.deepEqual(offenders, []);
});
