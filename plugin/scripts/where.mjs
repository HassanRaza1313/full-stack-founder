// Prints where a product's things are, for flows running inside its repo: the knowledge folder (in the repo, or in the
// workspace for products adopted with `knowledge: workspace`), its services.json, and the repo that holds the knowledge.
// Usage: node where.mjs [--dir <repo>]   ->  JSON { code, knowledge, services, knowledgeRepo }
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parseArgs, productDir, workspaceDir } from './lib.mjs';

const dir = resolve(parseArgs().dir ?? '.');
const knowledge = productDir(dir);
const inWorkspace = !knowledge.startsWith(dir);
console.log(JSON.stringify({
  code: dir,
  knowledge: existsSync(knowledge) ? knowledge : null,
  services: existsSync(join(knowledge, 'services.json')) ? join(knowledge, 'services.json') : null,
  knowledgeRepo: existsSync(knowledge) ? (inWorkspace ? workspaceDir({ required: false }) : dir) : null,
  note: existsSync(knowledge) ? (inWorkspace ? 'Knowledge lives in the workspace: commit it there.' : 'Knowledge lives in this repo.') : `No knowledge folder for ${dirname(dir) === dir ? dir : dir.split(/[\\/]/).pop()}: adopt it first (/founder:adopt).`,
}, null, 1));
