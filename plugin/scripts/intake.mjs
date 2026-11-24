// Collects what a project already says about itself, before anything judges it: plans, specs, notes and idea files are
// copied (never moved) into the knowledge folder's 00-intake/existing-ideas/, with a manifest; TODO and FIXME lines are
// gathered into todos.md. The user can drop anything else in the same folder. /founder:adopt runs it, then asks the user.
//
// Usage: node intake.mjs --dir <code> --out <knowledge folder> [--max 40]
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fail, parseArgs } from './lib.mjs';

const args = parseArgs();
if (!args.dir || !args.out || !existsSync(args.dir)) fail('Usage: intake.mjs --dir <code> --out <knowledge folder> [--max 40]');
const dir = resolve(args.dir);
const max = Number(args.max ?? 40);
const intake = join(resolve(args.out), '00-intake', 'existing-ideas');
mkdirSync(intake, { recursive: true });
const today = new Date().toLocaleDateString('en-CA');

const skip = new Set(['node_modules', '.git', '.venv', 'venv', 'dist', 'build', '.next', 'target', '__pycache__', 'vendor', 'product', '.agents', '.claude', 'coverage']);
const standard = /^(readme|license|licence|changelog|code_of_conduct|contributing|security|claude|agents|credits|notice|authors)(\.|$)/i;
const ideaish = /(plan|roadmap|todo|idea|note|spec|prd|requirement|backlog|product|vision|feature|brief|wishlist|scope|mvp)/i;
const docExt = new Set(['.md', '.mdx', '.txt', '.rst', '.org', '.docx', '.doc', '.pdf', '.pptx', '.xlsx', '.odt', '.rtf', '.pages']);
const codeExt = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.go', '.rs', '.rb', '.java', '.kt', '.swift', '.cs', '.php', '.vue', '.svelte', '.css', '.scss', '.sql', '.sh']);

const docs = []; const todos = [];
function walk(d, depth) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith('.') && e.name !== '.github') continue;
    const p = join(d, e.name); const rel = relative(dir, p).replaceAll('\\', '/');
    if (e.isDirectory()) { if (!skip.has(e.name) && depth < 5) walk(p, depth + 1); continue; }
    const ext = extname(e.name).toLowerCase(); const size = statSync(p).size;
    const inDocs = /^(docs?|notes|planning|specs?|ideas)\//i.test(rel);
    if (docExt.has(ext) && !standard.test(e.name) && size < 20e6 && (ideaish.test(rel) || (depth === 0 && ext === '.md') || inDocs)) docs.push({ rel, size });
    if (codeExt.has(ext) && size < 1e6 && todos.length < 300) {
      readFileSync(p, 'utf8').split(/\r?\n/).forEach((line, i) => {
        const m = line.match(/\b(TODO|FIXME|HACK|XXX|IDEA)\b[:\s-]*(.{0,140})/);
        if (m && todos.length < 300) todos.push(`- \`${rel}:${i + 1}\` ${m[1]}: ${m[2].trim()}`);
      });
    }
  }
}
walk(dir, 0);
docs.sort((a, b) => Number(ideaish.test(b.rel)) - Number(ideaish.test(a.rel)) || a.rel.localeCompare(b.rel));
const picked = docs.slice(0, max);
for (const d of picked) {
  const dest = join(intake, `${today}-${d.rel.replaceAll('/', '__')}`);
  if (!existsSync(dest)) copyFileSync(join(dir, d.rel), dest);
}
if (todos.length) writeFileSync(join(intake, `${today}-todos.md`), `# TODO and FIXME notes in the code (${today})\n\n${todos.join('\n')}\n`);

const manifest = [
  '---', 'topic: intake', `date: ${today}`, `summary: What the project already said about itself: ${picked.length} documents copied, ${todos.length} TODO notes. Inputs for the brief and the idea review, not decisions.`, '---', '',
  '# Existing ideas', '',
  'Copies, dated; the originals stay where they are. Drop anything else here too (notes, screenshots, old plans).', '',
  '| Copy | From (in the repo) | Size |', '|---|---|---|',
  ...picked.map((d) => `| ${today}-${d.rel.replaceAll('/', '__')} | \`${d.rel}\` | ${Math.round(d.size / 1024)} KB |`),
  ...(todos.length ? [`| ${today}-todos.md | TODO and FIXME lines in the code | ${todos.length} notes |`] : []),
  ...(docs.length > max ? ['', `${docs.length - max} more documents weren't copied (over the limit of ${max}).`] : []),
  '',
];
writeFileSync(join(intake, 'MANIFEST.md'), manifest.join('\n'));
console.log(JSON.stringify({ folder: intake, copied: picked.map((d) => d.rel), notCopied: Math.max(0, docs.length - max), todos: todos.length }, null, 1));
