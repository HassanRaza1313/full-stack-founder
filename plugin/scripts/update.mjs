#!/usr/bin/env node
// Keeps Full Stack Founder current.
//   --hook   At session start: if a newer release is on GitHub, tell the user once, in one line. Checks at most once a
//            day, never fails a session, and stays quiet for development copies (--plugin-dir) and when turned off
//            (`"updateCheck": false` in studio.config.json, or FOUNDER_UPDATE_CHECK=off).
//   --check  Prints {current, latest, behind, changes} as JSON.
//   --apply  Refreshes the marketplace, updates the plugin and prints what's new. A restart applies it.
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { isWin, loadConfig, parseArgs, readState, writeState } from './lib.mjs';

const args = parseArgs();
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, '.claude-plugin', 'plugin.json'), 'utf8'));
const current = manifest.version;
const repo = manifest.repository;
const DAY = 24 * 60 * 60 * 1000;

const parts = (v) => v.split('.').map((n) => parseInt(n, 10) || 0);
const newer = (a, b) => { const [x, y] = [parts(a), parts(b)]; for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]; return false; };

const sh = (cmd, cmdArgs, timeout = 120000) => spawnSync(cmd, cmdArgs, { encoding: 'utf8', timeout, shell: isWin, windowsHide: true });

// The newest release tag on GitHub. No sign-in needed: git reads public tags directly.
function latestRelease() {
  if (process.env.FOUNDER_LATEST) return process.env.FOUNDER_LATEST;
  // GitHub can take 2-5 seconds to answer. Tags are filtered here, not by git, so no shell ever sees a wildcard.
  const r = sh('git', ['ls-remote', '--tags', '--refs', `${repo}.git`], 9000);
  if (r.status !== 0) return '';
  const tag = new RegExp(`refs/tags/${manifest.name}--v(\\d+\\.\\d+\\.\\d+)\\s*$`, 'gm');
  const versions = [...r.stdout.matchAll(tag)].map((m) => m[1]);
  return versions.reduce((best, v) => (!best || newer(v, best) ? v : best), '');
}

// Changelog entries newer than `since`, as plain bullet lines.
function changesSince(since, file) {
  if (!file || !existsSync(file)) return [];
  const out = [];
  for (const section of readFileSync(file, 'utf8').split(/\r?\n(?=## )/)) {
    const v = section.match(/^## (\d+\.\d+\.\d+)/)?.[1];
    if (!v) continue;
    if (!newer(v, since)) break;
    out.push(`${v}:`, ...section.split(/\r?\n/).filter((l) => /^- /.test(l)).map((l) => `  ${l.replace(/\s*\(\[#\d+\]\([^)]*\)\)/g, '')}`));
  }
  return out;
}

// Which marketplace this copy came from, and where Claude Code keeps that marketplace's clone.
function marketplace() {
  const r = sh('claude', ['plugin', 'list', '--json']);
  let id = `${manifest.name}@full-stack-founder`;
  try { id = JSON.parse(r.stdout).find((p) => p.id.startsWith(`${manifest.name}@`))?.id ?? id; } catch {}
  const name = id.split('@')[1];
  let clone = '';
  try { clone = JSON.parse(readFileSync(join(homedir(), '.claude', 'plugins', 'known_marketplaces.json'), 'utf8'))[name]?.installLocation ?? ''; } catch {}
  return { id, name, clone };
}

if (args.hook) {
  try {
    const dev = !/[\\/]\.claude[\\/]plugins[\\/]cache[\\/]/.test(root) && !process.env.FOUNDER_LATEST;
    const off = process.env.FOUNDER_UPDATE_CHECK === 'off' || loadConfig().updateCheck === false;
    if (dev || off) process.exit(0);
    const cache = readState('update.json');
    let latest = cache.latest;
    if (!cache.checked || Date.now() - cache.checked > DAY || process.env.FOUNDER_LATEST) {
      latest = latestRelease();
      if (latest) writeState('update.json', { checked: Date.now(), latest });
    }
    if (latest && newer(latest, current)) {
      console.log(JSON.stringify({
        systemMessage: `Full Stack Founder ${latest} is out (you have ${current}). Say "update founder" to get it.`,
        hookSpecificOutput: {
          hookEventName: 'SessionStart',
          additionalContext: `Full Stack Founder ${latest} is available; ${current} is installed. The user has already been told. If they say "update founder" or ask to update, run /founder:update. Don't bring it up otherwise.`,
        },
      }));
    }
  } catch {}
  process.exit(0);
}

if (args.check) {
  const latest = latestRelease();
  console.log(JSON.stringify({ current, latest: latest || null, behind: Boolean(latest && newer(latest, current)) }, null, 2));
  process.exit(0);
}

if (args.apply) {
  const mp = marketplace();
  const refresh = sh('claude', ['plugin', 'marketplace', 'update', mp.name]);
  if (refresh.status !== 0) { console.error(`Couldn't reach the marketplace "${mp.name}". Check the internet connection and try again.\n${refresh.stderr}`); process.exit(1); }
  const up = sh('claude', ['plugin', 'update', mp.id]);
  const text = `${up.stdout}${up.stderr}`;
  if (up.status !== 0) { console.error(`The update didn't finish:\n${text}`); process.exit(1); }
  const to = text.match(/to (\d+\.\d+\.\d+)/)?.[1] ?? null;
  writeState('update.json', { checked: Date.now(), latest: to ?? current });
  console.log(JSON.stringify({ from: current, to, updated: Boolean(to && newer(to, current)), changes: changesSince(current, mp.clone && join(mp.clone, 'CHANGELOG.md')), changelog: `${repo}/blob/main/CHANGELOG.md` }, null, 2));
  process.exit(0);
}

console.log('Usage: node update.mjs --hook | --check | --apply');
