---
name: board
description: Your board of directors for any decision: build or kill, pivot, price change, graduation, quarterly strategy. Runs founder-board's three lenses (Offers, Monopoly, Product) with your saved research and numbers, plus CFO and customer seats; scores, dissent, a verdict saved as a decision.
argument-hint: "<the decision> [target]"
disable-model-invocation: true
---

# /founder:board

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`, `knowledge.md`. Gate: `ideas`.

1. **Frame it.** One sentence for the decision, plus the options. Infer the target, as `/founder:idea` does.
2. **Brief the board.** founder-board reads `founder/idea.md` in the target folder (the product repo or `ideas/<slug>/`). Write it or refresh it from saved results, not from memory: the brief or discovery, the newest `finance/`, `research/` and `listen/` summaries, and the decision itself. Include the key numbers.
3. **Convene.** Run the `founder-board` skill on the decision, with its three members as `analyst` agents in one message (not general-purpose: they start lighter and read only what they're given). Its three lens members score, name the risks that would kill it, and vote fund, fund with conditions, or pass.
4. **Two more seats**, short, from saved results only:
   - **CFO:** margin, break-even and runway impact (`finance/`; run `/founder:finance unit-economics` first if there are no numbers).
   - **Customer:** what real customers said (`research/voice/`, `listen/`). Simulated reactions don't count as evidence here.
5. **Verdict:** a go, conditions or no-go table across the five seats; the strongest dissent; and the one condition that would change the outcome.
6. **Save** `decisions/<date>-board-<slug>.md` (header `topic: board`) and refresh the index. The user decides; record their call in the same file.
