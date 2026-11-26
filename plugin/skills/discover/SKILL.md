---
name: discover
description: The review for a feature or change to an existing product (who it's for, the evidence, fit, metric impact, approach, risk) and a score. New product ideas go to /founder:check, then /founder:prove.
argument-hint: "<product>#<n>"
disable-model-invocation: true
---

# /founder:discover

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`, `knowledge.md`. Gate: `ideas`. Resolve the target as `/founder:idea` does. Act on `Note (you):` comments newer than this flow's last comment, and say which.

A new product idea instead of a feature? Use `/founder:check`, then `/founder:prove`.

## Feature review: `<product>#<n>`

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
