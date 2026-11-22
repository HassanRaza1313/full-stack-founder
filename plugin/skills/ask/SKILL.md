---
name: ask
description: Use when the user asks what was found, decided or written about a product or idea (competitors, pricing, customers, costs, a feature, past copy, why something was chosen). Answers from saved results with links; flags stale ones.
argument-hint: "[product] <question>"
---

# /founder:ask

Read-only. Answer from saved knowledge; don't research from scratch unless asked.

1. **Target:** the one named, or the current repo. For a portfolio-wide question, use the workspace's `PORTFOLIO.md`, `LEARNINGS.md` and each product's `INDEX.md`.
2. **Find.** If `INDEX.md` is missing or older than the newest result, run `node "${CLAUDE_PLUGIN_ROOT}/scripts/index.mjs" <folder>`. Pick the newest relevant rows and open only those files. For "why" questions, also check `decisions/` and `docs/adr/`. For "is it planned?", search the issues.
3. **Answer** in 2–4 sentences, then the supporting points, each linked to its file, with the date and confidence. Lead with any **stale** warning.
4. **Gaps:** say so plainly, and offer the run that would answer it, for example "`/founder:research competitors`, about 15 minutes". For stale results, offer a refresh.
