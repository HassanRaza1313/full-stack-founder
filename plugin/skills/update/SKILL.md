---
name: update
description: Use when the user says "update founder", asks to update Full Stack Founder, or asks whether a newer version is out. Installs the latest release and says what's new.
---

# /founder:update

Quick, with no questions.

1. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/update.mjs" --apply`.
2. **Updated:** say "Updated to <to>." Then what's new, in at most 5 plain bullets from `changes` (newest first; leave out internal details like tests). Then: "Restart Claude Code to use it: close it and open it again."
3. **Already current** (`updated` is false): say "You're on the latest version (<from>)." Nothing else.
4. **Failed:** say what went wrong in one plain sentence and the fix from the message (usually: check the internet connection and say "update founder" again).

New releases are announced in one line when a session starts, at most once a day. To turn that off, add `"updateCheck": false` to `studio.config.json` in the workspace; say this only if they ask.
