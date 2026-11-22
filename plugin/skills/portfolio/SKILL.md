---
name: portfolio
description: Home screen. Every idea and product with stage, score, signals and demos, what's waiting on you, stale results, and the best next moves. Regenerates PORTFOLIO.md.
argument-hint: "[waiting | demos | learnings | help]"
disable-model-invocation: true
---

# /founder:portfolio

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`. Settings come from `workspace.mjs show`; if that fails, say "Welcome to Full Stack Founder" and offer `/founder:setup`. Read-only, except it writes `<workspace>/PORTFOLIO.md`. Never commit it.

## Gather (one call)

Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/brief.mjs" --all`. It returns JSON in a few seconds, with no agent or searching. It starts from the catalog, the workspace repo's idea issues:
- **Products:** every idea with `repo:`. Status always comes from GitHub, so every computer shows the same portfolio: each product's `STATE.md`, newest listen, finance and pipeline summaries, stale results, launch blockers and unfinished runs, plus its media folder and demo link. `sync` flags work on this computer that isn't pushed, or GitHub commits not pulled yet: show it as a warning.
- **Ideas:** every other idea issue, open and closed (and retired products), with its stage, labels and metadata.
- **Idea folders:** each one's latest score out of 40, its discovery phase, and whether it has a brief.
- **Learnings:** the newest 5 lines of `LEARNINGS.md`.

Read a product's backlog only for the counts by stage and its top `validated` idea.

Missing values are `—`. Never guess one.

## Default

**Write `PORTFOLIO.md`** with these sections:
- **Needs your input:** every `gate:` that names the user, plus ideas sitting in `exploring` for more than 14 days, each with its command.
- **Active:** stages `new` to `live`, in order, highest score first. Columns: idea · stage · score · repo · case study · demo · customer and portfolio signals · backlog · next.
- **Live demos** `n/maxLive`.
- **Stale results.**
- **Parked and shelved:** with reason and date.
- **Rejected and sunset:** counts only.
- **Recent learnings.**

**Chat:** only "Needs your input", the demo count, the counts by stage, the stale count, and the top 3 next commands with reasons.

## Subcommands

- **`waiting`:** "Needs your input" only, without writing the file.
- **`demos`:** the demos table and `n/maxLive`. One demo fits its own Supabase project; two share the `studio` project, in separate schemas. Flag any marked `paused`, or not checked for 7 days. Change them with `/founder:showcase <p> demo on|off`.
- **`learnings`:** `LEARNINGS.md` by heading, newest first.
- **`help`:** lead with the six to start with, then everything else, one line each:
  - **Start here:** `/founder:ceo` (a brief, or a plain-words direction), `/founder:hunt`, `/founder:board`, `/founder:ask`, `/founder:setup`, `/founder:pause` / `/founder:resume`
  - **Direct control:** journeys `/founder:run`; capture `/founder:idea`, `/founder:portfolio`, `/founder:next`; departments `/founder:research`, `/founder:finance`, `/founder:discover`, `/founder:market`, `/founder:sales`, `/founder:listen`, `/founder:support`, `/founder:legal`; engineering `/founder:setup-product`, `/founder:spec`, `/founder:design`, `/founder:build`, `/founder:verify`, `/founder:release`, `/founder:showcase`

  Mark `/founder:graduate` and `/founder:deploy` as coming, with the first graduate.
