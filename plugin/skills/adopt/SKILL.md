---
name: adopt
description: Bring an existing GitHub repo into Full Stack Founder without restructuring it. Adds it to the catalog, creates its knowledge folder, and fills its state, roadmap and engineering notes from the repo itself. The code is never changed.
argument-hint: "<owner/repo> [--knowledge repo|workspace] [--from-idea <slug>]"
disable-model-invocation: true
---

# /founder:adopt

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`, `knowledge.md`. Gate: `ideas`. Run it from anywhere; the repo can be private or public, on this computer or not.

1. **Preview.** Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/adopt.mjs" --repo <owner/repo> --dry-run [flags]` and show, in a few lines:
   - the product name and slug (ask only if the repo name makes a poor one);
   - **where its knowledge goes:** in the repo (`product/`), or in your workspace (`products/<repo>/product/`). Public repos default to the workspace, so research, pricing and plans never go public. Say this in one line and let the user switch;
   - a clone to the products folder if there's no copy here;
   - product labels added to the repo (existing labels are kept), and a media folder;
   - `--from-idea <slug>` if an idea in the workspace became this repo: its research moves in.
   One yes covers it all.
2. **Run** the same command without `--dry-run`. If it fails, report the step and stop.
3. **Read the repo, once, with one `scout`** (no web). It returns compact facts: the README's first screen, `package.json` or the equivalent (stack, scripts), the top-level folders, docs and ADRs, open issues and milestones (titles and labels only), the last 15 commits, the latest release or tag, any deploy config (Vercel, Docker, Supabase, a CI workflow), and an existing `CLAUDE.md`.
4. **Fill the knowledge folder** from those facts. Never invent what isn't there; write `—`.
   - `STATE.md`: the stage (`building`, `showcased` or `live`, from releases, a homepage URL and deploy config), the next step, and the links.
   - `roadmap.md`: Now, Next and Later from open milestones and issues. Don't create issues.
   - `services.json`: what the code needs running locally (a database, a queue, a dev server), so `/founder:resume` starts only those.
   - `engineering.md`: the stack, the test and build commands, the conventions the code already follows, and what the studio's spec and build steps must respect. In the product repo, `docs/engineering.md` is where spec and build look first; with knowledge in the workspace, it stays in the knowledge folder.
   - `.agents/product-marketing.md` only if the README describes customers or positioning: run the `product-marketing` skill on the README and docs.
5. **Lean-code rules.** If the repo has no `CLAUDE.md`, offer the "Code" section from `${CLAUDE_PLUGIN_ROOT}/templates/product/CLAUDE.md` as a new file. If it has one, offer to append only that section. This is the one change to the repo itself, and it needs its own yes.
6. **Save.** Refresh the index (`node "${CLAUDE_PLUGIN_ROOT}/scripts/index.mjs" <knowledge folder's parent>`). Commit the knowledge folder where it lives (`adopt(<slug>): knowledge folder`), preview, and push on a yes. Set `next:` on the catalog entry.
7. **Close:** the stage, where its knowledge lives, and the best next step:
   - a feature: "add <feature> to <Name>" through `/founder:ceo` (the `feature` playbook);
   - not validated with customers yet: `/founder:run customer-test <slug>`;
   - built but not shown: `/founder:run showcase <slug>`.
