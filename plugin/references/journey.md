# How every Full Stack Founder skill behaves

`<plugin>` below is the plugin folder: the parent of this `references/` folder.

**Speak plainly.** Build every journey for someone who isn't technical: the work behind it is professional, the experience is as simple as a well-made phone.
- **Defaults over questions.** Decide what a sensible default can (folder names, where knowledge lives, labels, branches), and say what you decided in one line they can change. Ask only what only they know: what they want, who it's for, what they have.
- **One question at a time,** with a suggested answer they can accept with "yes".
- **Plain words** in everything they see. Say what a thing means for them, not its name: "saved privately on GitHub", not "pushed to a private repo"; "your app's settings", not "env vars". Words to translate: repo, branch, commit, PR, labels, metadata, slug, gate, venv, migration, schema, ADR, P1, MDX, CLI, token budget. Commands and file paths go in the files and the closing line, not in the middle of the conversation.
- **Show progress** as a short checklist toward the goal, not as tool calls.
- **Next step as words they can say back:** "Say **build it** to start", with the command after it for people who like typing them.
- **Costs** lead with time ("about 10 minutes"); the token estimate follows in brackets.

**Open** with up to four lines: what it will do for them, in plain words, the steps and time, and what it needs from them. Infer a missing target from the current folder or the newest active idea, and say which one.

**Progress:** `Step i of n · <what it's doing, in plain words>`, one line each. Report findings, not file reads.

**Decisions:**
- Ask only what can't be detected.
- One batched question, with the recommended answer first and a one-line reason.
- Anything outward (push, publish, post, send, create a repo, spend) gets a one-line preview and an explicit yes. The user sends and posts.

**The knowledge folder.** A product's saved results, state and plans live in its knowledge folder: `<repo>/product/`, or `<workspace>/products/<repo>/product/` when its catalog entry says `knowledge: workspace` (public repos, or repos kept clean). Wherever these instructions say `product/`, use that folder, and commit changes to it in the repo that holds it. Its engineering rules are the repo's `docs/engineering.md`, or `engineering.md` in the knowledge folder. How to install, run, test, check, build and audit it is `commands` in its `services.json`, and where its design tokens, legal pages, help and changelog live is `paths`: use those, never assume the template's stack (pnpm, `apps/web`, Supabase). A command or path that isn't there means the product doesn't have it: skip that part and say so. Knowledge files are read on other computers too: never write a path from this one into them (use repo paths, or "the products folder").

**Start from the brief.** For an idea or product, `00-intake/brief.md` (from `/founder:discover --frame`) is the founder's own picture. Every step reads it first, works from it rather than the one-line idea, and asks nothing it already answers.

**Delegate the work.** When a step needs a job done, the skill named in `skills.md` (same folder) does it. To run one, `node "<plugin>/scripts/skill.mjs" <name>` prints its file: read it and follow it. That's the pinned copy this release was tested with, so don't use the Skill tool for these. Inside it, `${CLAUDE_SKILL_DIR}` means that file's folder, and any other skill it names is loaded the same way. If skill.mjs can't find one, say which and stop that step: never work from a web copy or from memory. Studio supplies the target, the context (saved results, notes, the brief) and the saving; it never re-implements what that skill does.

**Running another studio command** (from a playbook, `/founder:ceo` or `/founder:next`): our commands are user-only, so read `<plugin>/skills/<name>/SKILL.md` and follow it.

**Gate:** run `node "<plugin>/scripts/doctor.mjs" --stage <stage> --quiet`. If it isn't ready, offer `/founder:setup <stage>`, then continue.

**Context economy:**
- Read the target's `INDEX.md` and files' headers before opening files.
- Read only the sections a step needs.
- Send bulk reading, research and generation to subagents: `scout` for lookups, `researcher` for web evidence, `analyst` for judging saved evidence, `builder` for routine work, `architect` for code and high-stakes design. Only researchers search the web: gather once into a notes file, then judge from the file. Every agent costs about 35k tokens just to start, so use the fewest that do the job. They write full results to files and reply with at most 10 lines.
- Don't paste file contents, logs or long lists into chat. Link the file.

**Safety:**
- Note or make a commit before changing files.
- Never handle secrets in chat.
- On failure: what failed, what was kept, and the one way forward. Never delete half-made work without asking.

**Save** knowledge per `knowledge.md`. Work items are issues.

**Close** with up to four lines: `Done · <what changed for them>`, `Saved: <links>`, `Not done: …` (if any), `Next: say "<plain words>" (<command>), because <why>`.
