---
name: verify
description: Release-candidate check, run locally. Exploratory QA in a real browser, Lighthouse, security and dependency audits; every finding filed. (Per-PR checks are CI plus implement-spec's code review.)
argument-hint: "[product]"
disable-model-invocation: true
---

# /founder:verify

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`. Gate: `build --product .`. Run in the product repo, with the services it needs (`session.mjs up`).

1. **Baseline:** `pnpm check`, `typecheck`, `test` and `build`, plus the Playwright end-to-end tests, and `gitleaks` across the full history.
2. **Exploratory QA** (`builder` with Playwright CLI): every user story at 1440×900 and 390×844, on seed data, including empty, slow, offline, bad input and the back button. Save `audits/qa-<date>.md`, with screenshots.
3. **Lighthouse** on a local production build, against the spec budgets: `audits/lighthouse-<date>/`.
4. **Security:** Cloudflare's `security-audit` (quick), plus `/security-review` on the changes since the last release. `architect` confirms the findings. Link the report from `STATE.md`.
5. **Design:** Impeccable's `audit` on the changed screens.
6. **`pnpm audit`:** no high or critical vulnerabilities. The MVP milestone is done, apart from `launch-blocker` tickets.
7. **File** one issue per real finding, `[P1]` to `[P3]`, as `type:bug` (with `risk:*` where it applies) or `type:idea`. A duplicate becomes a comment on the existing issue.
8. **Close:** refresh the index and the `deploy-ready` line in `STATE.md`. Report results by area and the P1 count (0 to ship). Next: fix the P1s, or `/founder:release` or `/founder:showcase`. Offer `/founder:pause`.
