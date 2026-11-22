---
name: setup
description: Get this machine ready for a stage (ideas, build, showcase, graduate), from a brand-new computer. Automatic installs in one approved batch; accounts and manual steps one at a time. Resumable.
argument-hint: "[ideas|build|showcase|graduate] | check"
disable-model-invocation: true
---

# /founder:setup

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`. Stages are cumulative; the default is `build`. The doctor (`node "${CLAUDE_PLUGIN_ROOT}/scripts/doctor.mjs"`) reads `requirements.json`.

0. **Bootstrap.** The doctor needs Node 22+. If `node --version` fails or is older, install it first: on Windows `winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements`; on a Mac, Homebrew (brew.sh) and then `brew install node`; on Linux, nvm. Then continue in a new terminal if PATH needs it.
1. **Status.** Run `doctor.mjs --stage <s> --json`. It lists only what's missing, plus counts. Show one line, `<ok> ready · <a> automatic · <m> need you`, then the missing titles. `check` stops here.
2. **Workspace** (when `workspace` is missing). Ask in one batch, with detected defaults:
   - **Repo:** `<gh login>/studio-workspace`. An existing one is cloned.
   - **Products folder:** a non-system drive with more space on Windows (for example `D:\Code`); otherwise `~/Code`.
   - **Media folder:** a detected Google Drive `…/My Drive/Products`, or "later".
   - **Small system drive** (Windows, under 100 GB free, and another drive exists): offer `toolsDir` and `dockerDir` on the other drive.

   Preview the private repo it creates, then run:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/workspace.mjs" init --repo <owner/name> --dir <products>/studio-workspace [--products …] [--media …] [--tools …] [--docker …]
   ```
3. **Automatic items.** List them in one message: what each installs, and that winget and npm accept those packages' terms. On one yes, run `doctor.mjs --stage <s> --fix` in the background. Failures move to step 4.
4. **Manual items, one at a time:**
   ```
   Step i of n · <title> — <why> (<cost>)
   1. … 2. …   Link: <url>
   Say "done" or "skip".
   ```
   - **Site address** (showcase): ask "free `<name>.vercel.app`, or your own domain (about $10 a year)?" Free is the default; a domain can come later. Save `site.url`, plus `site.domain` for a domain.
   - **Media folder** (showcase): a detected Google Drive folder, any local folder, or "later".
   - Save values with `workspace.mjs set`: `site.url`, `site.domain` and `supabase.studioProject`; `site.repo`, `driveRoot`, `toolsDir` and `dockerDir` with `--local`.
   - Re-check the item with `--only <id> --quiet --fresh`.
   - Never ask for passwords, keys or tokens.
5. **Finish.** Re-run the doctor with `--quiet`. Next step:
   - for `ideas`: `/founder:idea add …`
   - for `build`: `/founder:portfolio`
   - for later stages: the flow that asked

   Note anything that needs a new terminal, or a Claude restart (new plugins or MCP servers).
