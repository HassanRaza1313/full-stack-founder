---
name: build
description: Build an approved spec with Matt Pocock's implement-spec (parallel, test-first, one PR) under the repo's studio rules. Starts only the services tickets need; ends with /founder:pause.
argument-hint: "[spec#<n>]"
disable-model-invocation: true
---

# /founder:build

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md` and the engineering rules (the repo's `docs/engineering.md`, or `engineering.md` in the knowledge folder). Gate: `build --product .`.

1. **Target:** an `approved` spec, by default the newest one. If it isn't approved, stop and offer `/founder:spec`.
2. **Load implement-spec.** Load it with `node "${CLAUDE_PLUGIN_ROOT}/scripts/skill.mjs" implement-spec`. Follow that file, with the routing, migration and service rules in `docs/engineering.md`.
3. **Mark the idea** `status:building`.
4. **Close** with the PR link for the user to review, then offer `/founder:verify` and `/founder:pause`.
