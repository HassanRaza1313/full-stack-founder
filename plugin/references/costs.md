# What a run costs

Tokens per command, including its subagents. **Measured** values count every token processed, including cached re-reads (which count far less toward usage limits), from the session logs of real runs; everything else is an estimate until a run measures it. Plan limits vary and change, so show tokens and time, never a share of the user's limit.

Every agent costs tokens just to start: 6–12k for the plugin's agents, which carry only the tools they use (builder 36k → 12k in 0.4.2), and 35–50k for a general agent with every tool and the user's connectors (measured first turns, 2026-11-26). Flows use as few as they can. Connectors the user doesn't need for a session (mail, calendar, docs) add to every agent's start.

| Command | About | Basis |
|---|---|---|
| `/founder:capture` | 0.1–0.5M | estimate: a few questions for an idea; reading documents and code, and the plan-versus-code map, for work already done |
| `/founder:check` | 1.2M | measured: 1.16M, 7 min, $1.98 (sandbox, fresh chat, 2026-11-26; 4 researchers, 3 analysts; the chat itself 669k over 12 turns). Late in a long chat it costs more: 2.85M for Pitch Market's quick read |
| `/founder:research <one topic>` | 0.8M | measured: 766k, 5 min (competitors, 53 sources; two researchers, one analyst) |
| `/founder:board` | 1.2M | measured: 1.19M, 2.5 min (three lens members, plus the CFO and customer seats) |
| `/founder:hunt` | 1.2M | measured: 1.18M, 8 min (real-time fraud, 2026-11-24; two researchers, one analyst). Was about 4M before 0.3 |
| `/founder:adopt` | 1.3M | measured: 1.27M and 1.42M, 4 min (a small vibe-coded app, full onboarding: intake, brief, plan, idea review, install and tests). Registering only: 539k (slugify) |
| `/founder:prove` | 3.8M | measured: 3.82M, 16 min, $5.60, start to verdict (sandbox, 2026-11-27; 11 agents, the board's three members about 40k each; the chat itself 1.45M over 22 turns). Your own conversations sit in the middle; a refine round adds about 1M |
| `/founder:discover <product>#<n>` | 0.5M | estimate: a feature review |
| `/founder:finance <one mode>` | 0.6M | measured: 559k, 3.5 min (costs, with live price pages) |
| `/founder:sales icp` · `prospects` · `outreach` | 250k · 0.5M · 300k | measured icp: 251k, 1.5 min; the others are estimates |
| `/founder:spec` | 0.7M | measured: 710k, 3 min (MVP, to the approval stop) |
| `/founder:design` | 0.8M | measured: 782k, 2.5 min (shape, to the first direction) |
| `/founder:build` | 1–5M | estimate: depends on the spec's size; not measured yet |
| `/founder:verify` | 2–5M | measured: 2.29M, 5 min on a tiny app; 22M, 33 min on a real one (archie-rag) before 0.4 capped the browser QA, which alone took 14M re-reading page snapshots. Re-measure on the next real run |
| `/founder:market` (per piece) | 0.9M | measured: 941k, 3.5 min (a post in four versions, plus the marketing brief it had to write first) |
| `/founder:showcase` | 0.3M to the readiness stop | measured: 297k; a full showcase is several pieces at the market rate |
| `/founder:legal trademark` | 0.6M | measured: 569k, 2 min |
| `/founder:listen` · `/founder:support` | 400k · 400k | measured: 380k, 406k (no live sources connected) |
| `/founder:ceo` brief · `/founder:portfolio` | 85k · 230k | measured: 84k, 30 s; 228k, 50 s |
| `/founder:idea` · `ask` · `next` · `pause` · `resume` · `run list` | 150–370k | measured: 223k, 178k, 227k, 367k, 216k, 136k |
| `/founder:setup check` | 85k | measured: 84k, 30 s |
| Any other command | 100–300k | measured range of the small commands |

Measured on 2026-11-24 in a sandbox smoke run of every flow (`tests/smoke.mjs`), counting cached re-reads, which make up most of each figure and count far less toward usage limits. Rows still marked **estimate** get replaced with a measurement from `runs.md` as runs happen.

**Before a playbook runs** (`/founder:run`, `/founder:ceo`): add up the steps that won't be skipped, and say it in one line, with the cheapest useful stopping point:
`About 700k tokens and 1–3 hours (300k measured, the rest estimated). Stopping after step 1 costs about 80k.`
If `runs.md` holds past runs of this playbook with token counts, use their median instead, and say so.

**Over 1M tokens:** ask once before starting: run it all, or stop at the first **Stop:**.

**After each step,** add the tokens its subagents reported to the step's line in `runs.md` (`· 94k tokens`), so estimates turn into measurements.
