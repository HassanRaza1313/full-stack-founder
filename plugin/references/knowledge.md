# Saving results

| Kind | Home |
|---|---|
| Knowledge: analyses, models, copy, decisions | Markdown in the repo |
| Work: ideas, features, specs, bugs | GitHub issues, linked to their files |
| Media, spreadsheets, **anything that names a person** (leads, contacts) | The media folder (`driveRoot/<Name>/…`), never git |

**Where:** a product uses `product/<folder>/<topic>/<YYYY-MM-DD>-<slug>.md`. An idea without a repo uses `<workspace>/ideas/<slug>/` with the same layout. Idea hunts go in `<workspace>/ideas/_hunts/`. The folders are:
- `research/` (`customers`, `segments`, `competitors`, `market`, `positioning`, `voice`)
- `finance/` (`pricing`, `costs`, `unit-economics`, `model`)
- `features/`, `discovery/`, `iterations/`, `design/`, `audits/`
- `marketing/`, `showcase/`, `sales/`, `listen/`, `decisions/`

Each run is a new dated file. The newest one is the current answer.

**Header** (every file):
```yaml
---
topic: competitors
target: Fraud Guard            # or "feature #42"
question: Who else solves this, and where can we win?
summary: The answer in two sentences.
confidence: high | medium | low
sources: 14
fresh_until: 2027-02-20        # markets and competitors 90 days; customers 120; pricing, costs and market 180; decisions none
links: ["#42"]
---
```

The body gives the answer first, then the evidence, then the sources as links. Unsourced claims are marked `[assumption]`.

**Decisions** worth a later "why?" go in `decisions/<date>-<slug>.md`: the choice, the options, the reason, and what would change it.

**After saving:** run `node "<plugin>/scripts/index.mjs" <product or idea folder>` (`<plugin>` is the parent of this `references/` folder). It rebuilds `INDEX.md` and flags stale results.
