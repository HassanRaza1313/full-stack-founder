// Records the core flow on demo data for videos and screenshots, with Playwright CLI.
// /market video fills in STEPS for this product. Run it with the app running (pnpm dev) and the database seeded (pnpm db:reset).
// Usage: node scripts/demo-walkthrough.mjs [baseUrl] [width] [height]
// Output goes to recordings/ (gitignored); /market moves the files to the product's media folder.
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [baseUrl = 'http://localhost:3000', width = '1920', height = '1080'] = process.argv.slice(2);
const pw = (...args) => {
  const r = spawnSync('playwright-cli', args, { stdio: 'inherit', shell: true });
  if (r.status !== 0) throw new Error(`playwright-cli ${args.join(' ')} failed`);
};

// Each step is the arguments to one playwright-cli command, e.g. ['click', '<ref>'] or ['screenshot', '--filename=recordings/01-home.png'].
const STEPS = [];

mkdirSync('recordings', { recursive: true });
pw('open', baseUrl);
pw('resize', width, height);
pw('video-start', `recordings/walkthrough-${width}x${height}.webm`);
try {
  for (const step of STEPS) pw(...step);
} finally {
  pw('video-stop');
  pw('close');
}
