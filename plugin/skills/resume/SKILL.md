---
name: resume
description: Use when the user returns to a product or asks where they left off, or a task needs a local service that's off (`up <id>`). Pulls, recaps, checks, and starts only what the next task needs.
argument-hint: "[product] | up <service>"
---

# /founder:resume

**`up <service>`:** run `node "${CLAUDE_PLUGIN_ROOT}/scripts/session.mjs" up <service> --dir <repo>` and report it in one line.

**Resume a product.** The target is the one named, or the current repo, or the most recently paused (the newest "Last session" across `<productsDir>/*/product/STATE.md`).

1. If Claude isn't running in the repo, say once: "Best started from `<path>`; continuing with full paths."
2. `git fetch`. If it's behind and the tree is clean, `git pull --ff-only`. If it has diverged, say so, and don't merge.
3. **Recap** "Where I left off" and `git log -3 --oneline` as `Resuming <Product> · <date> · done … · in progress … · next …`.
4. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/doctor.mjs" --stage build --product <repo> --quiet`. Show anything missing, and offer `/founder:setup build`.
5. **Start only what the next step needs** from `services.json`:
   - Front-end work, copy, research or a spec needs nothing.
   - DB work, end-to-end tests or a demo recording need the database.

   Use `session.mjs up <ids>`, or say "Nothing needs to run yet."
6. Offer to start the next step as the recommended option. `/founder:pause` ends the session.
