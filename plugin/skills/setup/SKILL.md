---
name: setup
description: "Get this computer ready for what you're about to do, and nothing more: saving ideas (ideas), building (build), launching (showcase) or running a paid product (graduate). Flows call it just in time; say \"set everything up\" to do it all now. What it can install, it does in one approved batch; accounts and sign-ins are one at a time, with exact steps. Resumable."
argument-hint: "[ideas|build|showcase|graduate] | check"
disable-model-invocation: true
---

# /founder:setup

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md` (especially **Speak plainly**). The doctor (`node "${CLAUDE_PLUGIN_ROOT}/scripts/doctor.mjs"`) checks each item in `requirements.json`. Stages build on each other: ideas → build → showcase → graduate.

**Which stage.** Called by a flow: the stage it named, and only its missing items. Run directly: the stage the founder's next step needs (an idea not yet saved: `ideas`; a product to build: `build`), or all of them for "set everything up". Never set up a later stage "while we're here".

**What they see** is the point of each step, never the tool. Name each item by what it does for them ("**GitHub**, where your ideas and code are kept privately"), not by its package name, and say how long it takes.

0. **Node first.** The doctor needs Node 22 or newer. If `node --version` fails or is older, say "One thing first: Node, which runs the setup checks. About 2 minutes." and install it (Windows: `winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements`; Mac: Homebrew from brew.sh, then `brew install node`; Linux: nvm). If the new PATH needs a restart, say exactly that, and that setup picks up where it left off.
1. **What's needed.** Run `doctor.mjs --stage <s> --json`. Open with one line on what this unlocks and the time, then the short list:
   ```
   To save your ideas privately, 3 things (about 5 minutes):
   [ ] Git and GitHub's tool      I'll install these
   [ ] Sign in to GitHub          needs you, about 1 minute
   [ ] Your private workspace     I'll make it
   ```
   Nothing missing: say "All set." and go back to what they were doing. `check` stops here.
2. **Decide the defaults, show them in one line.** For the workspace: "I'll make a private place on GitHub called `studio-workspace` and keep your products in `D:\Code`. OK, or change something?"
   - **Repo:** `<gh login>/studio-workspace`; an existing one is cloned.
   - **Products folder:** a non-system drive with more space on Windows (for example `D:\Code`), otherwise `~/Code`.
   - **Media folder:** a detected Google Drive `…/My Drive/Products`, or later.
   - **Small system drive** (Windows, under 100 GB free, with another drive): heavy tools and Docker go on the other drive.
   Then run `node "${CLAUDE_PLUGIN_ROOT}/scripts/workspace.mjs" init --repo <owner/name> --dir <products>/studio-workspace [--products …] [--media …] [--tools …] [--docker …]`. It also moves in any idea checked before setup.
3. **What I can install,** in one message: each item in plain words, and that installing accepts those tools' standard terms. On one yes, run `doctor.mjs --stage <s> --fix` in the background. Anything that fails moves to step 4, with what went wrong in a sentence.
4. **What needs you, one at a time:**
   ```
   <i> of <n> · Sign in to GitHub: where your ideas and code are kept privately (about 1 minute)
   1. … 2. …   Link: <url>
   Say "done", "skip" or "later".
   ```
   - **Site address** (showcase): "a free `<name>.vercel.app` address, or your own domain (about $10 a year)?" Free is the default; a domain can come later. Save `site.url`, plus `site.domain` for a domain.
   - **Media folder** (showcase): a detected Google Drive folder, any local folder, or later.
   - Save values with `workspace.mjs set`: `site.url`, `site.domain` and `supabase.studioProject`; `site.repo`, `driveRoot`, `toolsDir` and `dockerDir` with `--local`.
   - Re-check each item with `--only <id> --quiet --fresh` before the next.
   - Never ask for passwords, keys or tokens: sign-ins happen in their browser or the tool's own prompt.
   - "Later" is fine: say what won't work until it's done, in one line.
5. **Done.** Re-run the doctor with `--quiet`, show the list ticked, then **go straight back to what they were doing** ("All set. Back to Meal Planner: …"). Run directly, close with the plain next step ("Say **check my idea** to start"). If something needs a new terminal or a Claude restart (new plugins or MCP servers), say so, and that everything is saved.
