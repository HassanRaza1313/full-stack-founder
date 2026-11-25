# Changelog

## 0.4.3 · 2026-11-26

- **Know when there's an update, and get it in one step.** When a session starts, a new release is announced in one line (checked at most once a day, about 3 seconds, no tokens). Say "update founder" (`/founder:update`): it installs the latest version and lists what's new. Turn the notice off with `"updateCheck": false` in `studio.config.json`.

## 0.4.2 · 2026-11-26

- **Lighter helpers, your connectors untouched.** The builder and architect agents now list only the tools they use, so they no longer load your mail, Drive, Sheets and other connectors on every start. A builder starts at about 12k tokens instead of 36k; nothing changes in your other sessions.
- **Connector steps run in the main session:** listen's gathering, and finance's Stripe and Sheets work.
- A test checks every agent keeps its own tool list.

## 0.4.1 · 2026-11-25

- **Saving a folder to GitHub works without a git name set up.** `/founder:adopt` now falls back to your GitHub login for the first commit, as it already did for the email.

## 0.4.0 · 2026-11-24

- **Bring in code you already have, and get it ready to build** ([#1](https://github.com/HassanRaza1313/full-stack-founder/issues/1)). `/founder:adopt` takes a GitHub repo or a folder on your computer, vibe-coded or not, or just "I built an app" to `/founder:ceo`.
  - **Your ideas first:** before reading the code, it asks what you have in mind. It copies your plans, notes and Word or PDF documents into one folder (the originals stay put). Your ideas are inputs to the review, never straight to the backlog.
  - **Understands it with you:** a brief from the code and your answers, the framing interview to confirm it, and an optional honest score.
  - **A plan, and your ideas reviewed:** finish, fix or cut, in order. Each idea gets a recommendation, with the review scaled to its size: small fixes go to the backlog, direction changes go to customers and the board. Your strong preferences have to be argued against explicitly, and you can overrule.
  - **Set up and tested:** installs what the code needs (Node, Python, Go or Rust), repairs a setup that was moved from another folder, runs the tests once and checks the app loads.
  - **One home for every copy:** other copies on your computer are found; their own files (data, settings, specs) join the main copy, and the copies are put aside, never deleted.
  - **No GitHub copy yet?** It offers to save the code privately, keeping `.env` files out and stopping if it finds anything that looks like a key.
  - **A ready checklist** in the product's state, ticked only when each part is really done.
- **Works on any stack.** Verify, design, legal, market, release, support and showcase now use each product's own commands and paths (`services.json`) instead of assuming the template's pnpm, Supabase and Vercel.
- **Simple for anyone.** A "Speak plainly" rule for every flow: defaults over questions, one question at a time, plain words, progress as a checklist, and next steps as words you can say back.
- **Measured costs for almost every flow,** from a sandbox run of all of them, replacing the old estimates (`references/costs.md`).
- **Fixes:**
  - resume and the setup check now find products whose plans live in your workspace;
  - release, verify, spec and showcase find the plans folder from inside a product repo (`where.mjs`);
  - `next` maps a product's stage to the right setup stage;
  - a parked idea's reason now shows in the portfolio;
  - flows commit only the files they wrote;
  - no path from your computer is written into shared files.
- **Tests:** 22 automated tests run every script end to end against a stand-in GitHub, plus checks of every flow's references and plain-language rules, on Windows, macOS and Linux on every change. A smoke runner (`plugin/tests/smoke.mjs`) drives all 26 flows headless in a sandbox before each release. Plus a new eval for plain-language onboarding.

## 0.3.0 · 2026-11-24

- **Lean research, measured.** Two new agents. A `researcher` (Sonnet, only search, fetch and file tools, a fixed budget, few turns) gathers evidence once into a notes file. An `analyst` (Opus, no web) judges from those notes. On the same ideas:
  - the quick read went from about 4.5M to 0.7M tokens, scoring 18/40 against 17/40 before;
  - the hunt went from about 4M to 1.2M tokens;
  - every agent now starts lighter, because it loads only the tools it needs.
- **`/founder:adopt`** brings in a repo you already have: a catalog entry, a knowledge folder, and state, roadmap and engineering notes read from the repo. It never changes your code. Public repos keep their knowledge in your workspace (`products/<repo>/product/`), so research and pricing stay private.
- **Measured costs** in `references/costs.md`, counting cached re-reads. Older estimates are flagged as probably low.
- **Fixes:**
  - the no-setup quick read now saves to `~/founder-trial/`, because Claude Code blocks writes inside `~/.claude`;
  - adopting works when Google Drive isn't running.
- **Guide:** a "Save tokens" section, and how to bring in an existing repo.

## 0.2.5 · 2026-11-23

- **One source for status.** The brief and the portfolio read every product's status from GitHub, so every computer shows the same picture. The copy on your computer is only checked for sync: "3 changes not pushed" or "2 commits not pulled" appear as warnings with the command that fixes them. If GitHub can't be reached, the brief shows your computer's copy and says so.
- **No computer paths in the catalog.** A product's catalog entry stores only `repo: owner/name` and its media folder's name. Each computer finds the code under its own products folder and the media under its own media folder, both chosen in `/founder:setup`.

## 0.2.4 · 2026-11-23

- **The catalog is the register.** The brief and the portfolio now start from your workspace repo's idea issues: an idea with `repo:` is a product. Each product's status comes from its own repo (`product/STATE.md`), read from the copy on this computer, or straight from GitHub when it isn't here. Products on another machine now show up, and unrelated folders in your products folder no longer do. Nothing scans the drive.
- Retired products and closed ideas appear in `/founder:portfolio`, not in the brief.

## 0.2.3 · 2026-11-23

- **A much faster brief.** `/founder:ceo` with no direction took over a minute, even with an empty portfolio: a lookup agent made about ten searches, some across the whole products drive. A new script, `scripts/brief.mjs`, gathers everything in one call in about two seconds, so the brief now takes about 15 seconds. An empty workspace gets a three-line answer.
- **`/founder:portfolio`** uses the same script (`brief.mjs --all`), with closed ideas, scores, phases and learnings.

## 0.2.2 · 2026-11-23

- **Frame the idea first.** Validation now starts with a short interview (Matt Pocock's `grilling`): who it's for, the problem, the picture in your head, money, success and limits. It's saved as `brief.md`, and research, pricing, the board and the spec all work from it. `/founder:discover <idea> --frame` runs it on its own.
- **Fix:** the spec interview (`grill-with-docs`) depends on Pocock's `grilling` skill, which wasn't shipped. It's now pinned, making 52 skills.
- **README:** short bullets in place of long paragraphs.

## 0.2.1 · 2026-11-23

- **Free hosting by default.** Showcase no longer needs a domain: case studies and demos can live at a free `.vercel.app` address. Your own domain (about $10 a year) is an optional upgrade, any time.
- **Setup asks your choices up front:** a free site or your own domain, and a local media folder or Google Drive.
- **A step-by-step guide** (`GUIDE.md`): install, setup by stage (what Claude does, what you do, your options), and the journey from idea to launch.
- **Install by the GitHub web address**, which avoids SSH errors.

## 0.2.0 · 2026-11-22

The plugin becomes a product anyone can install.

- **Its own repo.** Your ideas, settings and lessons live in a private workspace repo, which `/founder:setup` creates or clones.
- **`/founder:setup`:** everything from a brand-new machine to a paying product, in four stages (`requirements.json`, checked by `doctor.mjs`). Automatic items install in one approved batch; manual steps come one at a time.
- **`/founder:pause` and `/founder:resume`:** save, push and stop everything a product runs, Docker and WSL included; pick up later and start only what's needed (`product/services.json`).
- **Enhancements:** `/founder:idea` adds features to an existing product's backlog, with their own stages.
- **Knowledge you can find again:** dated result files with a summary header, an `INDEX.md` per product with stale results flagged, and `/founder:ask` to answer from them.
- **Playbooks:** `/founder:run validate | feature | showcase | first-customers | pricing-review | health | graduate`, or your own.
- **`/founder:portfolio` is the home screen,** with a `help` menu.
- **One journey standard** for every skill: an opening card, progress, decisions with recommendations, a closing card with the next step.
- **Every Track 1 command:** `/founder:discover` (new products and enhancements), `/founder:research`, `/founder:finance`, `/founder:spec`, `/founder:verify`, `/founder:release`, `/founder:showcase`, `/founder:market`, `/founder:sales`, `/founder:listen` and `/founder:next`. Building uses Pocock’s `/implement-spec` and design uses `/impeccable` directly, with studio’s rules in each product’s `docs/engineering.md`.
- **Lean on tokens:** skills about a third shorter, reference files halved, the product `CLAUDE.md` about half, the doctor gives one-line gate checks, and subagents reply in a few lines while full output goes to files.
- All scripts rewritten in Node, so they work on Windows, macOS and Linux.
- **Pinned specialist skills, nothing global:** 51 third-party skills from 8 repos ship inside the plugin as unchanged copies pinned to one tested release each, with their licences (`plugin/vendor/`, `vendor.json`). Setup no longer downloads 37 skills (only the 3 video skills, pinned, at the showcase stage), nothing is added to your other sessions, and upstream changes reach you only in a tested release. `scripts/vendor.mjs` verifies the copies, checks upstream monthly and syncs new versions; `CREDITS.md` lists every version.
- **Try it before setup:** with no workspace, `/founder:ceo` offers a quick read of one idea with nothing installed (about 80k tokens, 10 minutes); setup later moves it into your workspace.
- **Cost before you run:** every journey shows its estimated tokens and time first, with the cheapest stopping point; over 1M tokens asks once. Each step logs its tokens in `runs.md`, so estimates become measurements (`references/costs.md`).
- **The case against:** every quick read starts with an independent pass arguing the idea fails, with sources, and each score has to answer it.
- **Six commands to start with:** the README and `help` lead with `/founder:ceo`, `hunt`, `board`, `ask`, `setup` and `pause`/`resume`; the rest sit under direct control.
- **Sites that block bots:** research reads Reddit and similar pages through your own browser when it's connected (read-only), or says which sources were only partly read.
- **A lean download:** the repo holds only what the plugin needs to run, plus its tests. Design docs, concepts and history moved out, the icon shrank from 424 KB to 19 KB, and the vendored skills no longer carry their own upstream test folders.
- **Tests and proof:** a `claude plugin eval` suite (first run, routing, honest verdict, pinned skills), all passing on Windows; a "What it doesn't do" section; and a "plan only" rule, so asking `/founder:ceo` what it would do never starts work.
- **Install that is tested like a user:** every push installs the plugin from the public repo on fresh Windows, macOS and Linux machines and checks the installed copy. The README has fixes for a slow clone, SSH host-key errors and a half-added marketplace.
- **Honest platform status:** built for Windows, macOS and Linux, tested end to end on Windows; automated checks run on all three on every change.
- **Windows long paths:** setup turns on Git's long-path support, a common cause of broken installs.
- **Idea hunt:** `/founder:hunt` finds product ideas from real complaints, reviews, competitor gaps and demand signals, using Corey Haines's `customer-research` and `competitor-profiling`, with sources for every claim.
- **MengTo restored:** `build-awwwards-quality-sites` for marketing and landing sites, plus `no-ai-design-slop` as a quality gate. The audit wrongly reported it gone.
- **CEO front door:** `/founder:ceo` gives a brief across every product, or runs a plain-words direction end to end. New: `/founder:board`, `/founder:legal`, `/founder:support`, `/founder:finance pulse`, and the playbooks idea-to-launch, customer-test, finance-check, weekly, monthly-review and raise. Every job is routed to a proven skill (`references/skills.md`).
- **Audit fixes.**
  - Commands are `/founder:<name>`: Claude Code requires the plugin prefix, so the plugin id is the short `founder`.
  - `/founder:spec`, `/founder:build` and `/founder:setup-product` now load Pocock's user-only skills through `scripts/skill.mjs`, instead of trying to invoke them.
  - Dropped MengTo's retired skill.
  - Added `startup-positioning`, `offers`, `marketing-plan` and `content-strategy`, plus requirements for Homebrew, the Supabase MCP, the portfolio site and Google connectors.
  - Flow gates run in 0.2 s when everything passed in the last week, and about 4 s fresh, down from 6–14 s.

## 0.1.0 · 2026-11-21

First version: `/founder:idea`, `/founder:portfolio`, the product template and `setup-product`.
