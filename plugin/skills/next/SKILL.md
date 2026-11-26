---
name: next
description: Work out and run the next right step for an idea, product or feature, with a one-line reason.
argument-hint: "[<idea> | <product> | <product>#<n>]"
disable-model-invocation: true
---

# /founder:next

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`.

**Target:** the one named, or the current product, or the top of "Needs your input" (`/founder:portfolio waiting`).

Read the issue (stage and metadata), `STATE.md` (`gate`, `next`, "Where I left off"), the stale rows of `INDEX.md`, and `runs.md`. The **first** rule that matches wins:

1. A gate waits on the user (a `gate:` line, an unapproved spec, a PR awaiting review) → ask for that decision.
2. A playbook stopped partway → `/founder:run <playbook> <target>`.
3. The machine isn't ready for the stage → `/founder:setup <stage>`. The setup stage for an item's stage: `ideas` for idea stages (new to researching), `build` for building and specced, `showcase` for showcased, `graduate` for graduated and live.
4. Stale results the next step depends on → refresh them first.
5. **Product idea:**
   - `new` → "check it" (`/founder:check`)
   - `exploring` (checked) → "prove it" (`/founder:prove`)
   - proven, and the founder chose to build → "build it" (`/founder:setup-product`)
6. **Product:**
   - no approved MVP spec → `/founder:spec mvp`
   - screens but no `DESIGN.md` → `/founder:design shape`
   - approved spec → `/founder:build`
   - built since the last verify → `/founder:verify`
   - MVP done, not showcased → `/founder:showcase`
   - `listen/` older than 7 days → `/founder:listen`
   - over the thresholds → the graduation gate
7. **Enhancement:**
   - `new` → `/founder:discover <p>#<n>`
   - `validated` → `/founder:spec`
   - `specced` → `/founder:build`
   - `shipped` → `/founder:market announce`, then `/founder:listen`

Run a command by reading `${CLAUDE_PLUGIN_ROOT}/skills/<name>/SKILL.md` and following it (our commands are user-only).

Say "Next for <target>: <what it does, in plain words>, because <reason>" (with the command in brackets), naming the runner-up if it was close. Then run it. If nothing's pending, offer the best optional move: the top backlog idea, a stale refresh, or content.
