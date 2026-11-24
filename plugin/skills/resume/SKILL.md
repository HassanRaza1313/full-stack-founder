---
name: resume
description: Use when the user returns to a product or asks where they left off, or a task needs a local service that's off (`up <id>`). Pulls, recaps, checks, and starts only what the next task needs.
argument-hint: "[product] | up <service>"
---

# /founder:resume

**`up <service>`:** run `node "${CLAUDE_PLUGIN_ROOT}/scripts/session.mjs" up <service> --dir <repo>` and report it in one line.

**Resume a product.** The target is the one named, or the current repo, or the most recently paused: run `node "${CLAUDE_PLUGIN_ROOT}/scripts/brief.mjs"` and take the product with the newest `lastSession`. That covers every product, wherever its knowledge folder lives. The code is at `<productsDir>/<repo name>`; if it isn't on this computer, offer to clone it there.

1. If Claude isn't running in the repo, say once: "Best started from `<path>`; continuing with full paths."
2. `git fetch` in the repo, and in the workspace too when the knowledge folder lives there. If either is behind and clean, `git pull --ff-only`. If one has diverged, say so, and don't merge.
3. **Recap** "Where I left off" and `git log -3 --oneline` as `Resuming <Product> · <date> · done … · in progress … · next …`.
4. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/doctor.mjs" --stage build --product <repo> --quiet`. Show anything missing, and offer `/founder:setup build`.
5. **Start only what the next step needs** from `services.json`:
   - Front-end work, copy, research or a spec needs nothing.
   - DB work, end-to-end tests or a demo recording need the database.

   Use `session.mjs up <ids>`, or say "Nothing needs to run yet."
6. Offer to start the next step as the recommended option. `/founder:pause` ends the session.
