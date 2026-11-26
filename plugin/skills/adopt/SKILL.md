---
name: adopt
description: Bring code you already have into Full Stack Founder and get it ready to build on, from a GitHub repo or a folder on this computer (vibe-coded or not). Captures your idea as it stands (your answers, your documents and what the code really does, and where they disagree), sets it up and runs the tests, checks it like any idea, then makes the plan forward. The code itself is never changed without a yes.
argument-hint: "[owner/repo | GitHub address | folder] [--from-idea <slug>]"
disable-model-invocation: true
---

# /founder:adopt

Adopting is the same journey as a new idea (**Capture → Check → Prove → Build**), with code attached: the code is read alongside the founder's answers and documents, and set up on this computer.

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md` (especially **Speak plainly**), `knowledge.md`. Gate: `ideas`.

The person may not be technical: a marketer with a vibe-coded app, a `plan.md`, some notes. Do the technical work to a professional standard, and keep what they see to plain words, one question at a time, each with a suggested answer. Decide everything a sensible default can decide, and say what you decided in one line.

Show this checklist at the start, and tick it as you go. It's also the `ready:` line in `STATE.md`. Tick a box only when it's really done: the brief once they've confirmed it, the plan once they've approved it. A draft shows as `draft`, not ticked:

```
Getting <Name> ready to build
[ ] your code has one home   [ ] your idea, as it stands   [ ] set up on this computer
[ ] tests pass               [ ] checked                  [ ] the plan   [ ] ideas reviewed
```

## 1 · Find the code (one yes)

The target is what they gave: `owner/repo`, a GitHub address, or a folder. Nothing given: the current folder. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/adopt.mjs" (--repo <owner/repo> | --path <folder>) --dry-run` and say, in plain words:
- what it found: "a public GitHub project", or "a folder with no GitHub copy yet";
- where the code will live: "I'll keep it in your products folder" (it moves there unless they say no; the move needs nothing open in that folder);
- **other copies on this computer** (`copies`): "I found 2 other copies. I'll bring their own files (data, settings, documents) into the main one and put the copies aside in `_retired`, nothing deleted." A copy with unsaved work (`unsaved`) is left alone: say what's unsaved and offer to save it first;
- **no GitHub copy** (`source: folder`): recommend "save your code privately on GitHub, so it's backed up and works on any computer" (`--create-repo`). Before pushing, the script keeps `.env` files out and stops if it finds anything that looks like a password or key;
- plans and research stay private, in your workspace, for public or folder-only code (decided: don't ask).
One yes covers it. Then run the same command without `--dry-run`, plus `--consolidate` when there were copies and `--create-repo` if they agreed. On a failure, say what happened in plain words and the one thing to do.

## 2 · Your idea, as it stands (with the code)

Follow `${CLAUDE_PLUGIN_ROOT}/skills/capture/SKILL.md` at **3 · Work done**, with the code folder: it copies their plans and documents, reads the code once, writes `00-intake/plan-vs-code.md`, shows what they already have, asks only about the gaps and the places plan and code disagree, and writes the brief for them to confirm.

Then fill, never inventing (write `—`):
- `STATE.md`: stage (`building`, `showcased` or `live`, from releases, a homepage and deploy config), links, and the `ready:` line.
- `services.json`: the `commands` the script detected (install, dev, test, check, build, audit), corrected from the README and scripts (for example the project's own `dev` command), and what needs running locally (a database, a model server, Docker).
- `engineering.md`: the stack, the conventions the code follows, and what spec and build must respect.


## 3 · Set up on this computer

1. `node "${CLAUDE_PLUGIN_ROOT}/scripts/env.mjs" check --dir <codeDir>`: what's missing (a tool, packages) or broken (an environment moved from another folder).
2. Missing tools: offer to install them (`/founder:setup build` covers the common ones). Then `env.mjs install` (in the background; it repairs moved environments first, then installs).
3. `env.mjs test`: the tests, once. Say "Tests pass (286)" or what failed, in plain words. Failures become `type:bug` issues on a yes; they don't block adopting.
4. Start the app once with `commands.dev`, if it has one, and open `commands.url` to check it loads. Then stop it.

## 4 · Check it

Recommend `/founder:check` on the confirmed brief (about 1.2M tokens and 10 minutes; it skips Capture, which is done): what's promising and what's risky about the product as it really is, and the verdict, with where plan and code disagree. Strongly recommend it when the product hasn't been tested with real users. They can skip it: the plan then works from the brief alone, and says so.

## 5 · The plan

Write `plan.md` in the knowledge folder: what to finish, fix or cut, in order, each with effort (S, M, L), risk, and why, from the brief, `plan-vs-code.md` (finish what's planned but not built, decide on what's built differently) and the verdict if there is one. It becomes `roadmap.md` (Now, Next, Later) and the first spec candidates. Show it in plain words; they approve or change it.

## 6 · Your ideas, reviewed

List every idea: theirs (`from-you.md`, the documents), TODO notes, and open GitHub issues. For each: where it came from, how strongly they hold it (ask only for the ones that matter: strong, open, or just a thought), size, and a recommendation (keep, merge or drop) with a reason. Scale the review to the idea:
- **Small fixes and bugs:** a quick check, then the backlog.
- **Features:** the enhancement review (`/founder:discover <product>#<n>`) when they want it now; otherwise the backlog, unreviewed.
- **Direction changes** (a new audience, a pivot, pricing): customer evidence and pain points first (`/founder:research customers` or the `customer-test` playbook), then `/founder:board`. Their preference is part of the brief the board reads; a strong preference has to be argued against explicitly, and they can overrule it.
Show the table once. On a yes, file the kept ones as issues (`type:idea`, `source:team` for theirs, `source:review` for code notes). Existing GitHub issues get their labels; they aren't filed again.

## 7 · Lean-code rules

If the repo has no `CLAUDE.md`, offer the "Code" section from `${CLAUDE_PLUGIN_ROOT}/templates/product/CLAUDE.md` as a new file ("rules that keep the AI's code changes small and tested"). If it has one, offer to add only that section. This is the one change to their code, and it needs its own yes.

## 8 · Save and close

Refresh the index (`node "${CLAUDE_PLUGIN_ROOT}/scripts/index.mjs" <knowledge folder's parent>`). Set `ready:` and the stage: `stage` from step 3 once every box is ticked, `onboarding` while any isn't. Commit the knowledge folder where it lives (`adopt(<slug>): onboarding`), and push on a yes. Set `next:` on the catalog entry.

Close with the checklist, then one plain next step they can say back. If Check came back yellow or red and they want to carry on, that's their call: record it in `decisions/<date>-your-call.md`. For example: "Say **build the first item** to start on <item>", "Say **find customers** to test it with real people", or "Say **show it off** for a case study and demo".
