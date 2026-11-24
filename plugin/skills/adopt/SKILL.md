---
name: adopt
description: Bring code you already have into Full Stack Founder and get it ready to build on, from a GitHub repo or a folder on this computer (vibe-coded or not). Asks for your own ideas first, understands the product with you, makes a build plan, reviews your ideas, installs and tests everything, and gives one home to every copy. The code itself is never changed without a yes.
argument-hint: "[owner/repo | GitHub address | folder] [--from-idea <slug>]"
disable-model-invocation: true
---

# /founder:adopt

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md` (especially **Speak plainly**), `knowledge.md`. Gate: `ideas`.

The person may not be technical: a marketer with a vibe-coded app, a `plan.md`, some notes. Do the technical work to a professional standard, and keep what they see to plain words, one question at a time, each with a suggested answer. Decide everything a sensible default can decide, and say what you decided in one line.

Show this checklist at the start, and tick it as you go. It's also the `ready:` line in `STATE.md`. Tick a box only when it's really done: the brief once they've confirmed it, the plan once they've approved it. A draft shows as `draft`, not ticked:

```
Getting <Name> ready to build
[ ] your code has one home   [ ] your ideas   [ ] what it is (brief)   [ ] the plan
[ ] ideas reviewed           [ ] set up on this computer               [ ] tests pass
```

## 1 · Find the code (one yes)

The target is what they gave: `owner/repo`, a GitHub address, or a folder. Nothing given: the current folder. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/adopt.mjs" (--repo <owner/repo> | --path <folder>) --dry-run` and say, in plain words:
- what it found: "a public GitHub project", or "a folder with no GitHub copy yet";
- where the code will live: "I'll keep it in your products folder" (it moves there unless they say no; the move needs nothing open in that folder);
- **other copies on this computer** (`copies`): "I found 2 other copies. I'll bring their own files (data, settings, documents) into the main one and put the copies aside in `_retired`, nothing deleted." A copy with unsaved work (`unsaved`) is left alone: say what's unsaved and offer to save it first;
- **no GitHub copy** (`source: folder`): recommend "save your code privately on GitHub, so it's backed up and works on any computer" (`--create-repo`). Before pushing, the script keeps `.env` files out and stops if it finds anything that looks like a password or key;
- plans and research stay private, in your workspace, for public or folder-only code (decided: don't ask).
One yes covers it. Then run the same command without `--dry-run`, plus `--consolidate` when there were copies and `--create-repo` if they agreed. On a failure, say what happened in plain words and the one thing to do.

## 2 · Ask first: your ideas (before reading the code)

Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/intake.mjs" --dir <codeDir> --out <knowledge folder>`. It copies the project's plans, specs, notes and documents (Word and PDF too) into `00-intake/existing-ideas/`, dated, with a `MANIFEST.md`, and gathers TODO notes. The originals stay where they are. Then ask, in one message:

> Before I look at the code: what do you already have in mind? Ideas, problems you know about, plans, who it's for, what you'd change. Tell me here, or drop files into `<existing-ideas folder>` (notes, screenshots, documents) and say "done". I found <n> documents in the project and copied them there already. "Nothing" is fine too.

Don't ask where their files are: intake finds the ones in the project, and they can drop others in. Save what they say to `00-intake/existing-ideas/<date>-from-you.md`, in their words. These are **inputs, not decisions**: nothing goes straight to the backlog.

## 3 · Read the code, once

One `scout` (no web) returns compact facts: the README's first screen, the stack and scripts, top-level folders, docs, open issues and milestones (titles and labels only), the last 15 commits, the latest release, deploy config, an existing `CLAUDE.md`, and the intake files' headings. Then fill, never inventing (write `—`):
- `STATE.md`: stage (`building`, `showcased` or `live`, from releases, a homepage and deploy config), links, and the `ready:` line.
- `services.json`: the `commands` the script detected (install, dev, test, check, build, audit), corrected from the README and scripts (for example the project's own `dev` command), and what needs running locally (a database, a model server, Docker).
- `engineering.md`: the stack, the conventions the code follows, and what spec and build must respect.

## 4 · What it is: the brief, with them

Draft `00-intake/brief.md` from the code, the intake files and their answers: who it's for, the problem, what's built, what's missing, and what they want next. Mark each point **from you**, **from the code** or **from the documents**. Then run the framing interview on it (`/founder:discover --frame`, which skips what the brief already answers), so they confirm or correct it. Offer the quick read (`/founder:discover --quick`, about 0.7M tokens and 5–10 minutes) for an honest score and the case against: recommend it when the product hasn't been tested with customers.

## 5 · The plan

Write `plan.md` in the knowledge folder: what to finish, fix or cut, in order, each with effort (S, M, L), risk, and why, from the brief and the code. It becomes `roadmap.md` (Now, Next, Later) and the first spec candidates. Show it in plain words; they approve or change it.

## 6 · Your ideas, reviewed

List every idea: theirs (`from-you.md`, the documents), TODO notes, and open GitHub issues. For each: where it came from, how strongly they hold it (ask only for the ones that matter: strong, open, or just a thought), size, and a recommendation (keep, merge or drop) with a reason. Scale the review to the idea:
- **Small fixes and bugs:** a quick check, then the backlog.
- **Features:** the enhancement review (`/founder:discover <product>#<n>`) when they want it now; otherwise the backlog, unreviewed.
- **Direction changes** (a new audience, a pivot, pricing): customer evidence and pain points first (`/founder:research customers` or the `customer-test` playbook), then `/founder:board`. Their preference is part of the brief the board reads; a strong preference has to be argued against explicitly, and they can overrule it.
Show the table once. On a yes, file the kept ones as issues (`type:idea`, `source:team` for theirs, `source:review` for code notes). Existing GitHub issues get their labels; they aren't filed again.

## 7 · Set up on this computer

1. `node "${CLAUDE_PLUGIN_ROOT}/scripts/env.mjs" check --dir <codeDir>`: what's missing (a tool, packages) or broken (an environment moved from another folder).
2. Missing tools: offer to install them (`/founder:setup build` covers the common ones). Then `env.mjs install` (in the background; it repairs moved environments first, then installs).
3. `env.mjs test`: the tests, once. Say "Tests pass (286)" or what failed, in plain words. Failures become `type:bug` issues on a yes; they don't block adopting.
4. Start the app once with `commands.dev`, if it has one, and open `commands.url` to check it loads. Then stop it.

## 8 · Lean-code rules

If the repo has no `CLAUDE.md`, offer the "Code" section from `${CLAUDE_PLUGIN_ROOT}/templates/product/CLAUDE.md` as a new file ("rules that keep the AI's code changes small and tested"). If it has one, offer to add only that section. This is the one change to their code, and it needs its own yes.

## 9 · Save and close

Refresh the index (`node "${CLAUDE_PLUGIN_ROOT}/scripts/index.mjs" <knowledge folder's parent>`). Set `ready:` and the stage: `stage` from step 3 once every box is ticked, `onboarding` while any isn't. Commit the knowledge folder where it lives (`adopt(<slug>): onboarding`), and push on a yes. Set `next:` on the catalog entry.

Close with the checklist, then one plain next step they can say back, for example: "Say **build the first item** to start on <item>", "Say **find customers** to test it with real people", or "Say **show it off** for a case study and demo".
