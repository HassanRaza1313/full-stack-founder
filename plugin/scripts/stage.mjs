#!/usr/bin/env node
// Finishes a Check or Prove in one call, so the chat doesn't spend a turn per chore.
//   --lint <verdict.md>    Checks the verdict against references/verdict.md: length, the four parts, no shorthand.
//   --record <slug> --stage check|prove --light green|yellow|red [--score 7/10] [--next "<words>"] [--tokens 600k]
//                          Labels the idea, updates its metadata and card, logs runs.md, refreshes the index, commits
//                          only the idea's folder and pushes.
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, loadConfig, parseArgs, run, workspaceDir } from './lib.mjs';

const args = parseArgs();
const here = dirname(fileURLToPath(import.meta.url));

function lint(text) {
  const problems = [];
  const body = text.replace(/^---[\s\S]*?^---\s*$/m, '').split('<details>')[0];
  const fm = text.match(/^---([\s\S]*?)^---/m)?.[1] ?? '';
  const words = body.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#*_`>|-]/g, ' ').split(/\s+/).filter(Boolean).length;
  if (words > 300) problems.push(`${words} words above the details; keep it under 300`);
  if (!/^light:\s*(green|yellow|red)\b/m.test(fm)) problems.push('light: must be green, yellow or red');
  if (!/^call:\s*\S/m.test(fm)) problems.push('call: is missing');
  for (const part of ['**The call:**', "**What's promising**", "**What's risky**", '**Next:**']) if (!body.includes(part)) problems.push(`missing ${part}`);
  const shorthand = body.match(/\b[A-Z]{1,3}§\d+|\[assumption\]|\bWTP\b|\bTAM\b|\bSAM\b|\bv\d\b|\b[OE]\d\b/g);
  if (shorthand) problems.push(`shorthand to replace with plain words or a link: ${[...new Set(shorthand)].join(', ')}`);
  return { words, problems };
}

if (args.lint) {
  const r = lint(readFileSync(args.lint, 'utf8'));
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.problems.length ? 1 : 0);
}

// --start <slug> --stage prove: label the idea as being proved, in one call (always with --repo).
if (args.start) {
  const ws = workspaceDir();
  const repo = loadConfig(ws).studioRepo;
  const gh = (a) => run('gh', a, { capture: true }).out;
  const issue = JSON.parse(gh(['issue', 'list', '-R', repo, '--label', 'type:idea', '--state', 'all', '--limit', '200', '--json', 'number,labels,body']) || '[]')
    .find((i) => new RegExp(`^slug:\\s*${args.start}\\s*$`, 'm').test(i.body ?? ''));
  if (!issue) fail(`No catalog idea with slug "${args.start}".`);
  const old = issue.labels.map((l) => l.name).filter((n) => n.startsWith('status:') && n !== 'status:researching');
  gh(['issue', 'edit', String(issue.number), '-R', repo, '--add-label', 'status:researching', ...old.flatMap((n) => ['--remove-label', n])]);
  run('node', [join(here, 'card.mjs'), args.start], { capture: true, allowFail: true });
  console.log(JSON.stringify({ issue: issue.number, status: 'researching' }));
}

if (args.record) {
  const slug = args.record;
  const stage = args.stage;
  if (!['check', 'prove'].includes(stage) || !['green', 'yellow', 'red'].includes(args.light)) fail('Usage: --record <slug> --stage check|prove --light green|yellow|red [--score 7/10] [--next "..."] [--tokens 600k]');
  const ws = workspaceDir();
  const repo = loadConfig(ws).studioRepo;
  const folder = join(ws, 'ideas', slug);
  const verdict = join(folder, 'verdict.md');
  if (!existsSync(verdict)) fail(`No verdict at ideas/${slug}/verdict.md yet.`);
  const gh = (a) => run('gh', a, { capture: true }).out;
  const issues = JSON.parse(gh(['issue', 'list', '-R', repo, '--label', 'type:idea', '--state', 'all', '--limit', '200', '--json', 'number,labels,body']) || '[]');
  const issue = issues.find((i) => new RegExp(`^slug:\\s*${slug}\\s*$`, 'm').test(i.body ?? ''));
  if (!issue) fail(`No catalog idea with slug "${slug}".`);

  // Metadata: set each key in the studio block, adding it if missing.
  const today = new Date().toISOString().slice(0, 10);
  const set = { light: args.light, score: args.score, next: args.next, updated: today };
  let body = issue.body;
  for (const [k, v] of Object.entries(set)) {
    if (!v) continue;
    const line = `${k}: ${v}`;
    body = new RegExp(`^${k}:.*$`, 'm').test(body) ? body.replace(new RegExp(`^${k}:.*$`, 'm'), () => line) : body.replace(/<!-- studio\n/, (m) => `${m}${line}\n`);
  }
  const tmp = join(tmpdir(), `stage-${slug}-${process.pid}.md`);
  writeFileSync(tmp, body);
  const status = stage === 'check' ? 'exploring' : 'researching';
  const old = issue.labels.map((l) => l.name).filter((n) => n.startsWith('status:') && n !== `status:${status}`);
  gh(['issue', 'edit', String(issue.number), '-R', repo, '--body-file', tmp, '--add-label', `status:${status}`, ...old.flatMap((n) => ['--remove-label', n])]);

  run('node', [join(here, 'card.mjs'), slug], { capture: true });
  const runs = join(folder, 'runs.md');
  appendFileSync(runs, `${existsSync(runs) && !readFileSync(runs, 'utf8').endsWith('\n') ? '\n' : ''}${today} · ${stage} · done · ${args.light}${args.score ? ` ${args.score}` : ''}${args.tokens ? ` · ${args.tokens} tokens` : ''}\n`);
  run('node', [join(here, 'index.mjs'), folder], { capture: true, allowFail: true });
  run('git', ['-C', ws, 'add', '--', join('ideas', slug)], { capture: true });
  // Commit only this idea's folder (other work may be in progress), with a fallback identity for a computer that has none.
  const cfg = (k) => run('git', ['-C', ws, 'config', k], { capture: true, allowFail: true }).out;
  const login = cfg('user.name') ? '' : run('gh', ['api', 'user', '--jq', '.login'], { capture: true, allowFail: true }).out || 'founder';
  const who = [...(cfg('user.name') ? [] : ['-c', `user.name=${login}`]), ...(cfg('user.email') ? [] : ['-c', `user.email=${login}@users.noreply.github.com`])];
  const committed = run('git', ['-C', ws, ...who, 'commit', '-q', '-m', `${stage}(${slug}): ${args.light}${args.score ? ` ${args.score}` : ''}`, '--', join('ideas', slug)], { capture: true, allowFail: true });
  const pushed = committed.code === 0 ? run('git', ['-C', ws, 'push', '-q'], { capture: true, allowFail: true }) : { code: 1 };
  console.log(JSON.stringify({ issue: issue.number, status, card: true, committed: committed.code === 0, pushed: pushed.code === 0, ...(committed.code ? { commitError: committed.err || committed.out } : {}) }));
}

if (!args.lint && !args.record && !args.start) console.log('Usage: node stage.mjs --lint <verdict.md> | --record <slug> --stage check|prove --light <l> [--score] [--next] [--tokens]');
