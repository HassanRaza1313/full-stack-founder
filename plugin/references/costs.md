# What a run costs

Tokens per command, including its subagents. **Measured** values count every token processed, including cached re-reads (which count far less toward usage limits), from the session logs of real runs; everything else is an estimate until a run measures it. Plan limits vary and change, so show tokens and time, never a share of the user's limit.

Every agent costs about 35k tokens just to start (Claude Code's own instructions and the user's connected tools), so flows use as few as they can. Connectors the user doesn't need for a session (mail, calendar, docs) add to every agent's start.

| Command | About | Basis |
|---|---|---|
| `/founder:discover --quick` | 0.7M | measured: 668k, 5.5 min (FraudLab, 2026-11-24; one researcher, two analysts). Was about 4.5M before 0.3 |
| `/founder:discover --frame` | 150k | estimate: a three-round interview in the main session |
| `/founder:research <one topic>` | 100k+ | agent-reported 82k and 101k (2026-11-22), which leaves out cached re-reads: expect several times that |
| `/founder:board` | 180k+ | agent-reported 165k for the three lens members (2026-11-22), plus the chair; leaves out cached re-reads |
| `/founder:hunt` | 1.2M | measured: 1.18M, 8 min (real-time fraud, 2026-11-24; two researchers, one analyst). Was about 4M before 0.3 |
| `/founder:adopt` | 0.55M | measured: 539k, 2 min (sindresorhus/slugify, 2026-11-24; the scout read the repo for 35k) |
| `/founder:discover` (full, with the loop) | 500k–1M | estimate: depends on the rounds |
| `/founder:finance <one mode>` | 40k | estimate |
| `/founder:sales icp` · `prospects` · `outreach` | 40k · 100k · 60k | estimate |
| `/founder:spec` | 100k | estimate |
| `/founder:design` | 150k | estimate |
| `/founder:build` | 0.5–3M | estimate: depends on the spec's size |
| `/founder:verify` | 150k | estimate |
| `/founder:market`, `/founder:showcase` (per piece) | 60k | estimate |
| `/founder:listen` | 60k | estimate |
| Any other command | 20–50k | estimate |

Rows marked **estimate** or **agent-reported** were counted before cached re-reads were included, so they are probably low by 3–5 times. Replace each with a measurement from `runs.md` as runs happen.

**Before a playbook runs** (`/founder:run`, `/founder:ceo`): add up the steps that won't be skipped, and say it in one line, with the cheapest useful stopping point:
`About 700k tokens and 1–3 hours (300k measured, the rest estimated). Stopping after step 1 costs about 80k.`
If `runs.md` holds past runs of this playbook with token counts, use their median instead, and say so.

**Over 1M tokens:** ask once before starting: run it all, or stop at the first **Stop:**.

**After each step,** add the tokens its subagents reported to the step's line in `runs.md` (`· 94k tokens`), so estimates turn into measurements.
