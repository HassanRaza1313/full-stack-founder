---
name: spec
description: Validated feature or MVP → approved spec and routed tickets, via Matt Pocock's grill-with-docs, to-spec and to-tickets, under studio's spec rules. Can stop at "specced".
argument-hint: "[<product>#<n> | mvp]"
disable-model-invocation: true
---

# /founder:spec

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md` and the engineering rules (the repo's `docs/engineering.md`, or `engineering.md` in the knowledge folder). Gate: `build`. Run in the product repo, in a fresh session. Find the knowledge folder with `node "${CLAUDE_PLUGIN_ROOT}/scripts/where.mjs"`.

Load each of Pocock's skills by reading it: `node "${CLAUDE_PLUGIN_ROOT}/scripts/skill.mjs" <name>` prints its path. Then follow that file.

1. **Target:** `#<n>`, or `mvp` (the "Now" section of the roadmap), or else the top `validated` idea. If it isn't validated, recommend `/founder:discover` (a feature) or `/founder:prove` (a new product); the user can override. For `mvp`, start from Prove's first version (`04-product/` or the MVP section startup-design wrote) and the verdict's conditions.
2. **Context:** the issue and notes, the idea's brief (`brief.md`), and its `features/` review. Feed the brief into the grilling, so it asks only what's still open. The Pocock skills read the glossary and ADRs themselves.
3. Follow `grill-with-docs`, then `to-spec`.
4. **Gate:** the user approves the spec, which adds the `approved` label.
5. Follow `to-tickets`.
6. **Close:**
   - On the idea: `status:specced`, `spec: #<n>`, `next: /founder:build`.
   - Commit and push the docs.
   - Report the ticket counts by complexity, and what needs the user.
   - Next: `/founder:build`, or stop here (it stays specced).
