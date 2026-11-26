---
name: check
description: Use when the user shares a product idea, or something they've worked on, and wants to know if it's any good ("check my idea", "is this worth building?", "what do you think of…"). Captures their idea first (a few questions, scaled to how far along they are), then research, what's promising and what's risky, a plain verdict and sharper versions. About 10 minutes.
argument-hint: "<idea, in your words> | <saved idea>"
---

# /founder:check

Stage 1 of 3: **Check → Prove → Build**. The question: is this worth a closer look? Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`, `knowledge.md`, `verdict.md`. Gate: `ideas`.

**The expert work is startup-design's** (Fast Track, Light tier): its pre-flight, brainstorm and research waves 1 and 2. Its folder is `SD` = `${CLAUDE_PLUGIN_ROOT}/vendor/startup-skill/startup-design`. **Don't read its files in this chat:** each agent reads the parts it needs, by path. This chat only talks to the founder and writes the verdict, which keeps it light. **Wait for every agent's result** before the next step; never end your turn while one is working.

**Trial mode** (no workspace yet, from `/founder:ceo`): write to `~/founder-trial/<slug>/` (your home folder, never inside `~/.claude`), skip the gate check and step 6, and close with: "Saved. `/founder:setup ideas` makes your private workspace and moves this into it."

1. **The idea.** A saved idea: resolve it as `/founder:idea` does. New text: save it first with `/founder:idea add` (one confirm). Folder `F` = `<workspace>/ideas/<slug>/`, or for an adopted product its knowledge folder (`where.mjs`).
2. **Capture it first,** unless `F/00-intake/brief.md` is already confirmed: follow `${CLAUDE_PLUGIN_ROOT}/skills/capture/SKILL.md` (how far along they are, then only the questions that fits). Everything below works from the confirmed brief.
3. **Research: 4 `researcher` agents in ONE message.** Each is told: read `F/00-intake/brief.md` (and `plan-vs-code.md` if there is one), `SD/references/research-principles.md` and its wave file, apply the Light tier from `SD/references/research-scaling.md`, answer the brief's **Open, for research** points that fall in its wave, and save to `F/01-discovery/raw/<name>.md`. If who it's for is open, `market` proposes the 2 or 3 likeliest audiences, with evidence:
   - `market` and `timing-rules` from `SD/references/research-wave-1-market.md` (the second also covers startup-design's pre-flight: a dominant player, a past failure, a regulatory blocker)
   - `competitors` and `how-they-sell` from `SD/references/research-wave-2-competitors.md`
4. **Then 3 `analyst` agents.** First one, reading the brief, the raw files, `SD/references/research-synthesis.md` and the Phase 2 (Brainstorm) section of `SD/SKILL.md`: `F/01-discovery/research-synthesis.md` and `F/00-intake/brainstorm.md` (3 variations). Then two in ONE message, each reading only the brief and the synthesis, neither seeing the other:
   - `F/01-discovery/case-for.md`: the opportunity, why now, what's unique, the strongest version.
   - `F/01-discovery/case-against.md`: what people use instead and why they won't switch or pay, who tried and failed, what's hard.
   Each point cites a file or says it's a guess. Under 400 words each, in plain words.
5. **The verdict.** Read the two cases, the brainstorm and the synthesis's summary, then write `F/verdict.md` exactly as `verdict.md` (references) says, including **What we filled in** for each open point the research answered (for example the audience it found) and, for code, one line on where plan and code disagree. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/stage.mjs" --lint F/verdict.md` once and fix what it lists, in one edit.
6. **Record it, in one call:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/stage.mjs" --record <slug> --stage check --light <light> --next "say: prove <name>" --tokens <the agents' total>`. It labels the idea, updates its card, logs the run, refreshes the index, commits only this idea's folder and pushes.
7. **Close:** show the verdict in the chat, as written (don't publish it as a page). Then the choice, in plain words, whatever the light:
   - "**Prove it**": say `prove <name>` (or `prove <name>, version 2`) **in a new chat**. Everything is saved, and a fresh chat costs far less.
   - "**Build it anyway**": the verdict is advice, not a gate. Say `build <name> anyway`: it's recorded as your call (`decisions/<date>-your-call.md`, with what was skipped), and the build reads what's here.
   - "**Park it**": say `park <name>`.
