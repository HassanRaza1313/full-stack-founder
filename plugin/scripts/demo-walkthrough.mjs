// Records a product's core flow on demo data, for videos and screenshots, with Playwright CLI. Works for any stack:
// start the app first (`commands.dev` in services.json, seeded with `commands.seed` if it has one).
// Usage: node demo-walkthrough.mjs --steps <demo-steps.json> [--url <base url>] [--width 1920] [--height 1080] [--out recordings]
//   demo-steps.json is a list of steps, each the arguments to one playwright-cli command, for example
//   [["click", "<ref>"], ["fill", "<ref>", "hello"], ["screenshot", "--filename=recordings/01-home.png"]].
//   /founder:market video writes it to the knowledge folder; the URL defaults to `commands.url` there.
// Output goes to --out (keep it out of git); /founder:market moves the files to the product's media folder.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fail, parseArgs } from './lib.mjs';

const args = parseArgs();
if (!args.steps || !existsSync(args.steps)) fail('Usage: demo-walkthrough.mjs --steps <demo-steps.json> [--url <base url>] [--width 1920] [--height 1080] [--out recordings]');
const steps = JSON.parse(readFileSync(args.steps, 'utf8'));
if (!Array.isArray(steps) || !steps.every(Array.isArray)) fail('demo-steps.json must be a list of steps, each a list of playwright-cli arguments.');
const services = join(dirname(args.steps), 'services.json');
const url = args.url ?? (existsSync(services) ? JSON.parse(readFileSync(services, 'utf8')).commands?.url : null) ?? 'http://localhost:3000';
const [width, height, out] = [args.width ?? '1920', args.height ?? '1080', args.out ?? 'recordings'];

const pw = (...a) => {
  const r = spawnSync('playwright-cli', a, { stdio: 'inherit', shell: true });
  if (r.status !== 0) throw new Error(`playwright-cli ${a.join(' ')} failed`);
};

mkdirSync(out, { recursive: true });
pw('open', url);
pw('resize', width, height);
pw('video-start', join(out, `walkthrough-${width}x${height}.webm`));
try {
  for (const s of steps) pw(...s);
} finally {
  pw('video-stop');
  pw('close');
}
console.log(`Recorded ${steps.length} steps from ${url} into ${out}/`);
