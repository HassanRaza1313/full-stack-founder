# How every Full Stack Founder skill behaves

`<plugin>` below is the plugin folder: the parent of this `references/` folder.

**Open** with up to four lines: `<Skill> · <target>`, what it will do, steps and time, and what it needs from the user. Infer a missing target from the current folder or the newest active idea, and say which one.

**Progress:** `Step i of n · <name>`, one line each. Report findings, not file reads.

**Decisions:**
- Ask only what can't be detected.
- One batched question, with the recommended answer first and a one-line reason.
- Anything outward (push, publish, post, send, create a repo, spend) gets a one-line preview and an explicit yes. The user sends and posts.

**Start from the brief.** For an idea or product, `00-intake/brief.md` (from `/founder:discover --frame`) is the founder's own picture. Every step reads it first, works from it rather than the one-line idea, and asks nothing it already answers.

**Delegate the work.** When a step needs a job done, the skill named in `skills.md` (same folder) does it. To run one, `node "<plugin>/scripts/skill.mjs" <name>` prints its file: read it and follow it. That's the pinned copy this release was tested with, so don't use the Skill tool for these. Inside it, `${CLAUDE_SKILL_DIR}` means that file's folder, and any other skill it names is loaded the same way. If skill.mjs can't find one, say which and stop that step: never work from a web copy or from memory. Studio supplies the target, the context (saved results, notes, the brief) and the saving; it never re-implements what that skill does.

**Running another studio command** (from a playbook, `/founder:ceo` or `/founder:next`): our commands are user-only, so read `<plugin>/skills/<name>/SKILL.md` and follow it.

**Gate:** run `node "<plugin>/scripts/doctor.mjs" --stage <stage> --quiet`. If it isn't ready, offer `/founder:setup <stage>`, then continue.

**Context economy:**
- Read the target's `INDEX.md` and files' headers before opening files.
- Read only the sections a step needs.
- Send bulk reading, research and generation to subagents (`scout` for lookups, `builder` for routine work, `architect` for judgment). They write full results to files and reply with at most 10 lines.
- Don't paste file contents, logs or long lists into chat. Link the file.

**Safety:**
- Note or make a commit before changing files.
- Never handle secrets in chat.
- On failure: what failed, what was kept, and the one way forward. Never delete half-made work without asking.

**Save** knowledge per `knowledge.md`. Work items are issues.

**Close** with up to four lines: `Done · <change>`, `Saved: <links>`, `Not done: …` (if any), `Next: <one command> — <why>`.
