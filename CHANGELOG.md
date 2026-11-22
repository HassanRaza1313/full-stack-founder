# Changelog

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
