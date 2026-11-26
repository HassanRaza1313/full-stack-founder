---
name: prove
description: Use when the user wants to prove a checked idea ("prove it", "prove <idea>", "will people pay for this?", "should I build it?"). Customers, competitors' prices, the money and the first version, then conversations with real people and one board vote on "build it?". Everything feeds the build.
argument-hint: "<idea> [version <n>]"
---

# /founder:prove

Stage 2 of 3: **Check → Prove → Build**. The question: will people want it and pay for it? Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`, `knowledge.md`, `verdict.md`. Gate: `ideas`.

**The expert work is startup-design's** (continued from Check, without phase 5 brand) **and founder-board's.** `SD` = `${CLAUDE_PLUGIN_ROOT}/vendor/startup-skill/startup-design`. **Don't read its files in this chat:** each agent reads the parts it needs, by path. `F` = `<workspace>/ideas/<slug>/`.

**Wait for every agent.** Each step needs the one before it: wait for each agent's result before the next step, and never end your turn while one is working ("I'll continue when it reports back" ends a run that has no one to wake it).

**Start:** resolve the idea as `/founder:idea` does. No `verdict.md` yet: run `/founder:check` first. The brief (`00-intake/brief.md`, from Capture) is the founder's picture: every agent reads it, and its **Open, for research** points left after Check are this stage's questions. A version named ("version 2", or a pick from Check): update `00-intake/brief.md` to it first and say so in one line. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/stage.mjs" --start <slug> --stage prove` (it labels the idea). Say the run can be stopped and picked up again.

1. **Research what Check didn't:** `researcher` agents in ONE message, at the tier in `research.buildDepth` (default Standard, from `SD/references/research-scaling.md`), each reading the brief, `SD/references/research-principles.md` and its wave file (`research-wave-3-customers.md`, `research-wave-4-distribution.md`), saving to `F/01-discovery/raw/`. Then one `analyst` updates `research-synthesis.md` and runs `SD/references/verification-agent.md`'s checks.
2. **Real conversations** (startup-design phase 3.7, with `SD/references/customer-interview.md`):
   - Find 10 to 15 people who have the problem, as `/founder:sales prospects --signal` does, and write the 20-minute script and two short messages to `06-validation/recruiting.md`. Names and contacts go to the media folder, never git.
   - **Stop:** "Talk to 3 to 5 of them, then tell me what you heard, in any form." Save their notes with the interview template. The founder can say "skip": then the money stays a guess (startup-design's Stage A) and the verdict says so.
   - In a test, a stand-in panel (one `builder` playing each persona) may replace the conversations, marked **simulated** in every file and the verdict. Simulated reactions never count as evidence for the board.
3. **The shape and the money:** three agents, each reading the brief, the synthesis, the interview (or panel) notes, its phases of `SD/SKILL.md` and the matching sections of `SD/references/output-specs.md`, and writing startup-design's files:
   - In ONE message: an `architect` for **phases 4 and 6** (strategy: lean canvas, positioning, who exactly it's for; the first version: what's in, what's out; with `SD/references/frameworks.md`), and an `analyst` for **phase 7** (pricing, revenue, costs, break-even, Stage A or B; with `SD/references/industry-benchmarks.md`; `founder-cfo` for the numbers when Python is available).
   - Then an `analyst` for **phase 8**, reading both: the validation scorecard (out of 10, with its verdict) and the cheapest next experiments.
   Each writes its files and replies in at most 10 lines; none re-reads what another wrote unless it needs it.
4. **One board vote: "Build it?"** Follow `${CLAUDE_PLUGIN_ROOT}/skills/board/SKILL.md` with that decision, on everything above.
5. **Refine once, if asked.** "Fund if" conditions: list them in plain words and offer one round that fixes them (rerun only the parts they touch, log `changes.md`), then a second vote. More rounds only if the founder asks.
6. **The verdict.** Rewrite `verdict.md` (references `verdict.md`): stage `proven`, the light, startup-design's overall score out of 10, the board's call and conditions in plain words, and Next.
   Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/stage.mjs" --lint F/verdict.md` once and fix what it lists, in one edit.
7. **Record it, in one call:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/stage.mjs" --record <slug> --stage prove --light <light> --score <n>/10 --next "say: build <name>" --tokens <the agents' total>`.
8. **Stop: the founder decides.**
   - "**Build it**": say `build <name>` in a new chat. It creates the private repo and moves this research in; the spec, design and marketing read it instead of asking again.
   - "**Change it**": what to change, then one more round from step 3.
   - "**Build it anyway**" (if the light isn't green): recorded as their call in `decisions/<date>-your-call.md`, with the board's conditions listed as risks the build should watch.
   - "**Park it**" or "**Drop it**", with the reason kept.
