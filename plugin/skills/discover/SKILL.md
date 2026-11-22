---
name: discover
description: Product judgment. New product → quick read or deep discovery with the refinement loop. Enhancement → product + technical review and a score. No code.
argument-hint: "<idea> [--quick] | <product>#<n>"
disable-model-invocation: true
---

# /founder:discover

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`, `knowledge.md`. Gate: `ideas`. Resolve the target as `/founder:idea` does. Act on `Note (you):` comments newer than this flow's last comment, and say which.

## A · Quick read: `<idea> --quick`

**Trial mode** (no workspace yet, started from `/founder:ceo`): write to `~/.claude/founder/trial/<slug>/`, skip the setup check (no doctor gate) and steps 6–7, show step 8's verdict, and close with: "Saved. `/founder:setup ideas` makes your private workspace and moves this read into it." It needs nothing beyond Claude Code.

Write to `<workspace>/ideas/<slug>/`:
1. `00-intake/preflight.md`: is there a dominant solution, a past failure, or a regulatory blocker?
2. `iterations/v0/case-against.md`, written first and on its own by an `architect` told only to argue that this fails: the strongest evidence-backed case (what people use instead and why they won't switch or pay, who tried and failed, what makes it hard). Every point is sourced or marked `[assumption]`. This is what keeps the read honest rather than flattering.
3. `iterations/v0/scorecard.md`: 8 dimensions scored 1–5, each with a reason and a source. The `architect` agent scores. The dimensions are problem severity, willingness to pay, market size, differentiation, distribution, timing, feasibility, and unit economics, for a total out of 40. Each score must answer the case against where it applies.
4. `iterations/v0/objections.md`: a table `id, objection, source, severity, dimension, affected files, status`, top 5.
5. `iterations/v0/variants.md`: 3 sharper versions and a pick.
6. On the issue:
   - comment `v0: <n>/40 · <top objections>`
   - label `status:exploring`
   - set `score:` and `next:`
7. Refresh the index, then commit `discover(<slug>): v0 <n>/40`.
8. **Gate:** build, pick a variant, park, or reject. Show the case against in two lines next to the score.

## B · Deep: `<idea>`

1. Label `status:researching`. Say the run is resumable (`PROGRESS.md`).
2. Run **startup-design** in full mode from `<workspace>/ideas/`, with project name `<slug>`. Feed it the issue, the quick read and the notes as intake, so it only asks what's unknown. At its interview gate, suggest `/founder:sales prospects --signal`, and respect a "defer".
3. **Add:**
   - In `02-strategy/value-proposition.md`: the USP ("Only we ___ for ___ because ___") and a comparison with the top 3 competitors.
   - In `01-discovery/target-audience.md`: 3 personas, each with job, current alternative, switching trigger, objections, willingness to pay, and where they spend time online. These become the early-access qualifier.
   - `05-financial/pricing.md`, using the `pricing` skill.
   - The financial model, with `/founder:finance model`.
   - `03-brand/naming.md`: 5 names, each with `.com`/`.app` availability (RDAP), handles, a trademark link, and the pick.
   - `product-metrics.md`: North Star, activation, retention and revenue targets, guardrails, kill criteria, and **graduation thresholds**.
   - `06-validation/recruiting.md`: where to find 3–5 people, 2 messages, a consent line, a 20-minute script.
4. **Loop.** Each round writes `iterations/v<n>/`:
   1. `panel.md`: one `builder` subagent per persona reacts as that customer (would they switch, would they pay, what puts them off).
   2. Flag every claim with low confidence or no source, and refresh `case-against.md` against the new evidence.
   3. `objections.md`: one merged list, by severity.
   4. **The user picks the fixes.** Recommend the critical and major ones.
   5. Rerun only the affected parts, and log them in `changes.md`:
      - target customer → audience, positioning, pricing, go-to-market, financials
      - value proposition → positioning, brand, MVP, copy
      - pricing → financials
      - MVP scope → product, costs, roadmap
      - channel → go-to-market, CAC
   6. `scorecard.md` with the delta per dimension.
   7. Commit `discover(<slug>): v<n> <score>/40 (<±n>)` and comment the same.
5. **Exits:**
   - **Ready:** 30/40 or more, nothing below 3, no critical objection. Put it to the board: follow `${CLAUDE_PLUGIN_ROOT}/skills/board/SKILL.md` with the decision "build this?", and link its decision file from `council.md`. Then offer `/founder:setup-product`.
   - **Plateau:** less than 2 points better, two rounds running. The user decides.
   - **Kill:** a kill criterion is hit. `status:rejected`, with the evidence.
   - **Override:** the user's call. Save it as a decision.
6. Close with the score history (`v0 22 → v1 27 → v2 31`) and the exit.

## C · Enhancement: `<product>#<n>`

Writes `product/features/<date>-<slug>.md` (fresh for 90 days). Label `status:exploring`.

1. **Context**, only what's relevant: the issue and notes, `.agents/product-marketing.md`, `product-metrics.md`, the `INDEX.md` rows for research, voice and listen, the roadmap, open specs.
2. **Product review:**
   - which persona, and how often they hit this
   - evidence, counted and linked ("none yet" is fine)
   - fit with the positioning
   - whether competitors have it (table stakes or a differentiator)
   - which metric moves, and by roughly how much
   - whether it belongs in a paid tier
   - the smallest version that tests the value
3. **Technical review** (`architect`, which reads the code):
   - the areas touched
   - 2–3 approaches and a pick
   - schema and row-level security changes
   - new services (→ `services.json`) and env vars
   - `risk:*` labels
   - complexity
   - what needs an ADR
4. **Score:** impact × confidence × ease, each 1–5, out of 125. Low evidence caps confidence at 2. Give a recommendation.
5. **Save and index.** On the issue, set the metadata `impact confidence ease score review evidence next updated`, and comment the summary.
6. **Gate:**
   - build now → `status:validated`, next `/founder:spec`
   - keep → `validated`, ranked in the backlog
   - park or reject, with a reason
