---
name: portfolio
description: Home screen. Every idea and product with stage, score, signals and demos, what's waiting on you, stale results, and the best next moves. Regenerates PORTFOLIO.md.
argument-hint: "[waiting | demos | learnings | help]"
disable-model-invocation: true
---

# /founder:portfolio

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`. Settings come from `workspace.mjs show`; if that fails, say "Welcome to Full Stack Founder" and offer `/founder:setup`. Read-only, except it writes `<workspace>/PORTFOLIO.md`. Never commit it.

## Gather (the `scout` agent; it returns compact JSON, not prose)

- **Ideas:** `gh issue list --repo <studioRepo> --label type:idea --state all --limit 200 --json number,title,labels,body`. Parse the stage and metadata.
- **Products** (`local:` exists): from `STATE.md`, the `stage`, `gate`, `next`, `interest` and `health` lines; the newest `listen/` date; backlog counts by stage; the top `validated` idea.
- **Ideas without a repo:** the phase in `PROGRESS.md`, and the newest `scorecard.md` total.
- **Stale:** the rows marked stale in each `INDEX.md`.
- **Learnings:** the newest 5 lines of `LEARNINGS.md`.

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
