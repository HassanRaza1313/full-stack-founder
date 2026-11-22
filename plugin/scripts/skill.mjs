// Prints the SKILL.md path of a skill a flow should read and follow. The plugin's pinned copies (vendor/) come first,
// so flows always run the tested version; installed skills and plugins are the fallback.
// Usage: node skill.mjs <name>   ->  prints the path, or exits 1 with where it looked.
import { existsSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const name = process.argv[2];
if (!name) {
  console.error('Usage: skill.mjs <skill-name>');
  process.exit(1);
}

const claude = join(homedir(), '.claude');
const vendor = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'vendor');
const roots = [vendor, join(process.cwd(), '.claude', 'skills'), join(claude, 'skills'), join(claude, 'plugins', 'cache')];

// Breadth-first, bounded search for <name>/SKILL.md; the newest plugin version wins when several are cached.
function find(root) {
  const hits = [];
  let level = [root];
  for (let depth = 0; depth < 7 && level.length; depth++) {
    const next = [];
    for (const dir of level) {
      let entries;
      try { entries = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
      for (const e of entries) {
        if (!e.isDirectory() || e.name.startsWith('.') || e.name === 'node_modules') continue;
        const p = join(dir, e.name);
        if (e.name === name && existsSync(join(p, 'SKILL.md'))) hits.push(join(p, 'SKILL.md'));
        else next.push(p);
      }
    }
    level = next;
  }
  return hits.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
}

for (const root of roots) {
  const hit = existsSync(root) && find(root);
  if (hit) {
    console.log(hit);
    process.exit(0);
  }
}
console.error(`Skill "${name}" isn't vendored or installed (looked in ${roots.join(', ')}). Run /founder:setup.`);
process.exit(1);
