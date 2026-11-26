#!/usr/bin/env node
// The idea card: the top of an idea's catalog issue, rebuilt from its verdict and stage, so anyone (on any computer)
// sees where the idea stands in one glance. Usage: node card.mjs <slug> [--dry-run]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fail, loadConfig, parseArgs, run, workspaceDir } from './lib.mjs';

const args = parseArgs();
const slug = args._[0];
if (!slug) fail('Usage: node card.mjs <slug> [--dry-run]');
const ws = workspaceDir();
const repo = loadConfig(ws).studioRepo;
if (!repo) fail('No studioRepo in studio.config.json.');

const gh = (a) => run('gh', a, { capture: true }).out;
const issues = JSON.parse(gh(['issue', 'list', '-R', repo, '--label', 'type:idea', '--state', 'all', '--limit', '200', '--json', 'number,title,labels,body']) || '[]');
const issue = issues.find((i) => new RegExp(`^slug:\\s*${slug}\\s*$`, 'm').test(i.body ?? ''));
if (!issue) fail(`No catalog idea with slug "${slug}".`);

const meta = (key) => issue.body.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim() ?? '';
const status = issue.labels.map((l) => l.name).find((n) => n.startsWith('status:'))?.slice(7) ?? 'new';

// The verdict lives with the idea until it's built, then in the product's knowledge folder.
const file = existsSync(join(ws, 'ideas', slug, 'verdict.md')) ? `ideas/${slug}/verdict.md` : '';
const fm = file ? readFileSync(join(ws, file), 'utf8').split(/^---$/m)[1] ?? '' : '';
const field = (k) => fm.match(new RegExp(`^${k}:\\s*(.+?)\\s*(#.*)?$`, 'm'))?.[1] ?? '';
const light = { green: '🟢', yellow: '🟡', red: '🔴' }[field('light')] ?? '';
const proven = field('stage') === 'proven';

const order = ['Idea', 'Checked', 'Proven', 'Built', 'Live'];
const reached = { new: 1, exploring: 2, researching: proven ? 3 : 2, building: 3, showcased: 5, graduated: 5, live: 5 }[status] ?? 1;
const off = { parked: 'Parked', shelved: 'Shelved', rejected: 'Dropped', sunset: 'Retired' }[status];
const stages = order.map((s, i) => `${i < reached ? '✅' : '⬜'} ${s}`).join(' → ');

const lines = [
  '<!-- card -->',
  `**Where it stands:** ${off ? `**${off}**${meta('reason') ? ` (${meta('reason')})` : ''} · ` : ''}${stages}`,
  file ? `**Verdict:** ${light} ${field('call')}${field('score') ? ` · ${field('score')}` : ''} · [read it](https://github.com/${repo}/blob/main/${file})` : '**Verdict:** not checked yet',
  `**Next:** ${meta('next') || '—'}`,
  '<!-- /card -->',
  '',
];
const body = `${lines.join('\n')}${issue.body.replace(/<!-- card -->[\s\S]*?<!-- \/card -->\n*/, '')}`;

if (args['dry-run']) { console.log(lines.join('\n')); process.exit(0); }
const tmp = join(tmpdir(), `card-${slug}-${process.pid}.md`);
writeFileSync(tmp, body);
gh(['issue', 'edit', String(issue.number), '-R', repo, '--body-file', tmp]);
console.log(`Card updated on #${issue.number}.`);
