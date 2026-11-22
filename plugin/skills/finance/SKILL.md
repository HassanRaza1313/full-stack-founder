---
name: finance
description: Finance department for any idea or product. Pricing and offer, cost to serve, unit economics (founder-cfo), a full financial model, or a monthly pulse for live products. Every number sourced or marked as an assumption.
argument-hint: "pricing | costs | unit-economics | model | pulse   [target]"
disable-model-invocation: true
---

# /founder:finance

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`, `knowledge.md`. Gate: `ideas`.

Reuse fresh results from `INDEX.md`. Every result is fresh for 180 days.
- **Summaries** go to `finance/<topic>/<date>-<slug>.md`.
- **Spreadsheets** go to the media folder: `<Name>/Finance/`, or `_Ideas/<slug>/Finance/`.
- **Logic, pricing and sensitivity** go to `architect`; lookups go to `builder`.

## pricing

1. **Inputs:** `competitors --pricing` (run `/founder:research` first if it's missing or stale), willingness to pay, and `costs` if available.
2. **The `pricing` skill:** value metric, free vs paid boundary, 2–3 tiers, price points, annual discount, trial.
3. **The offer** (`offers` skill): what's included, bonuses, guarantee and honest urgency, shaped by the objections in research.
4. **2–3 options** with trade-offs and a pick. The user chooses; save the choice to `decisions/<date>-pricing.md`.

## costs

1. **The services** come from the stack, `product/services.json` and ADR-0008: hosting, database, email, analytics, errors, rate limits, storage, payment fees, the app-store cut, the domain.
2. **Prices** are taken today from each provider's pricing page and cited with the date.
3. **Monthly cost, and cost per user,** at 10, 100, 1,000 and 10,000 users. Mark where each free tier ends.

## unit-economics

Done by the `founder-cfo` skill (its Python calculator; on Windows run it with `python`). Write its `founder/numbers.json` in the target folder from saved results: the chosen price, the variable cost per unit from `costs` (payment fees, per-user infrastructure), fixed monthly costs, startup spend, and a 12-month ramp from the go-to-market plan. Then follow the skill. Add what it doesn't cover: CAC per channel, LTV, LTV:CAC. Mark every figure as an assumption or as measured.

## model

1. **The spreadsheet `<slug> – Financial model`** has these tabs: `Assumptions` (each sourced), `Pricing`, `Revenue` (36 months), `Costs`, `Unit economics`, `Scenarios` (bear, base, bull), and `Cash flow & break-even`. Every cell is a formula on `Assumptions`.
2. **Build it** with the Google Sheets connector, otherwise an `.xlsx` skill, otherwise one CSV per tab with the formulas listed in the summary.
3. **The summary** gives the break-even month, the runway at base, and the top 3 sensitivities.

## pulse (live products, monthly)

From Stripe (MCP or export) and `costs`: MRR and its change, new versus churned revenue, paying customers, ARPU, gross margin, monthly spend, cash, and runway in months. Compare against `product-metrics.md` targets. Saved to `finance/pulse/<date>.md`; flag anything off-track for `/founder:board`.

Label every projection Stage A (assumptions) or Stage B (real data). Close with the headline numbers and the biggest assumption. The usual next step is `/founder:sales`, to test willingness to pay.
