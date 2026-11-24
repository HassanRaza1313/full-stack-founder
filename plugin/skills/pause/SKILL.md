---
name: pause
description: Use when the user is stopping, pausing or done for the day, and after /founder:build or /founder:verify. Commits and pushes the work, notes where things stand, and stops every service, Docker and WSL included.
argument-hint: "[product]"
---

# /founder:pause

Quick, with no questions unless something's wrong.

**Target:** the current product repo, or the one named. If there's no product, just run step 4.

1. **Finish safely.** Let the current small step finish, or leave it as it is. Start nothing new.
2. **Save the work:**
   - Run `git status`. If it's clean, skip to step 3.
   - **Never commit to `main`.** If on `main`, branch to `wip/<date>-<topic>` first.
   - Leave out anything that looks like a secret or personal data (`.env*`, keys, lead lists), and say so.
   - Commit `WIP: <what changed>`, then `git push -u origin <branch>`. If there's no remote or the push fails, keep the commit local and say so.
3. **Note where things stand.** Update "Where I left off" in the knowledge folder's `STATE.md` (journey.md), so a fresh session on any computer can pick up from it alone. Name branches, tickets and files by their repo path, never by a path on this computer:
   - the date
   - what's done
   - what's in progress (branch, ticket)
   - the one next step
   - open questions

   Commit and push it in the repo that holds it (the workspace, for products whose knowledge lives there).
4. **Stop everything:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/session.mjs" down --dir <repo>`. It stops the services, leftover dev processes, Docker and WSL, for every project.
5. **Close:** `Paused · <branch> @ <sha> (pushed|local) · stopped <services> · <n> GB free · resume: /founder:resume <product> → <next step>`.
