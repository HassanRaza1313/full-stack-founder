# What a run costs

Tokens used per command, including its subagents. **Measured** values come from real runs; everything else is an estimate until a run measures it. Plan limits vary and change, so show tokens and time, never a share of the user's limit.

| Command | About | Basis |
|---|---|---|
| `/founder:discover --quick` | 80k | estimate |
| `/founder:research <one topic>` | 100k | measured: 82k and 101k (competitors and customers, 2026-11-22) |
| `/founder:board` | 180k | measured: 165k for the three lens members (2026-11-22), plus the chair |
| `/founder:hunt` | 350k | estimate: three research legs and a synthesis |
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

**Before a playbook runs** (`/founder:run`, `/founder:ceo`): add up the steps that won't be skipped, and say it in one line, with the cheapest useful stopping point:
`About 700k tokens and 1–3 hours (300k measured, the rest estimated). Stopping after step 1 costs about 80k.`
If `runs.md` holds past runs of this playbook with token counts, use their median instead, and say so.

**Over 1M tokens:** ask once before starting: run it all, or stop at the first **Stop:**.

**After each step,** add the tokens its subagents reported to the step's line in `runs.md` (`· 94k tokens`), so estimates turn into measurements.
