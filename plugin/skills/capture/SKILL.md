---
name: capture
description: "The first step for anything new, whatever it is: asks what you're bringing (an idea, goals, notes and documents, or code), takes it in, brings code in properly, interviews you only about what's still open, and writes \"your idea, as it stands\" for you to confirm. Nothing is judged here. Check and adopt run it first."
argument-hint: "<idea, in your words> | <saved idea> | <files, folder or repo>"
---

# /founder:capture

Before anything judges an idea, get the founder's own picture of it, at whatever stage they're at. Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`. Writes to the idea's folder `F`: `<workspace>/ideas/<slug>/`, or the product's knowledge folder for code (`node "${CLAUDE_PLUGIN_ROOT}/scripts/where.mjs" --dir <code>`).

**What we ask about: intent, never facts.** What they want to build, for whom, why, what they want from it, and their limits. Market size, competitors, prices, rules and costs are research's job: never ask them. **"Not sure" is always a good answer:** it becomes an open question that Check and Prove answer, and the verdict says what was filled in. **Their ideas are inputs, not decisions:** nothing goes straight to the backlog; adopt reviews them after Check.

## 1 · What are you bringing?

One message, the first thing they see (leave out what they've already said or shown):

> What are you bringing?
> 1. **An idea.** Just the thought, and let's see where it goes.
> 2. **An idea with goals.** Outcomes you want from it.
> 3. **Notes or documents:** a plan, research, Word files. Drop them here.
> 4. **Code:** a folder on this computer or a GitHub link.
>
> Or just tell me about it.

What they gave answers it: files are 3, a folder or a link is 4, nothing is 1. Then:
- **1, 2, 3:** the questions below, at that depth (3 is "work done").
- **4, code:** say in one line "That's code, so I'll bring it in properly first: one home, a private backup, and a check that it runs." Then follow `${CLAUDE_PLUGIN_ROOT}/skills/adopt/SKILL.md` steps 1 and 3 (find the code, set it up and run the tests), and come back here at **3 · Work done**, with the code. Started from adopt: it has already done this.

**No workspace yet** (`workspace.mjs show` says `workspace: null`): 1 to 3 need nothing set up. `F` is `<trialDir>/<slug>` (`trialDir` from that same output), and nothing is saved to GitHub yet. Code needs a private home for its plans first: set it up just in time (journey.md's **Gate**, stage `ideas`), then bring it in.

## 2 · The questions, by how far along

Depth follows from step 1. Each question is one short line, with a suggested answer where one makes sense, so "yes" or "not sure" is enough. One message per round.

**1 · Just an idea:** up to 3 questions, in one message.
1. What would it do, in a sentence? (skip if they said)
2. Who do you picture using it? ("Not sure" is fine: we'll find who needs it most.)
3. What made you think of it? Something you've lived, seen at work, or just noticed.

**2 · Goals in mind:** the three above, plus up to 3 more, in one message (6 at most).
4. What do you want it to be for you? A business, a side income, a portfolio piece, a tool for your team, or not sure.
5. In three months, what would make you say it's working?
6. Anything fixed? The time you can give, a budget, must-haves, or things you won't do.

**3 · Work done** (notes, documents or code): read first, then ask only about the gaps.
- **Take it all in.** Documents: `node "${CLAUDE_PLUGIN_ROOT}/scripts/intake.mjs" --dir <their folder or code> --out F` (copies, never moves, plans, notes, Word, PDF and TODOs into `00-intake/existing-ideas/`). Files they drop in the chat go there too. Code: one `scout` returns the compact facts adopt needs, then one `architect` writes `00-intake/plan-vs-code.md`: each feature their documents or answers describe, marked **built as planned**, **built differently**, **planned, not built**, or **built, not in any plan**, with the files that show it.
- **Show what you already have,** in at most 10 lines: what's decided, what contradicts itself (including plan against code), and what's missing. They correct it in one reply.
- **Then the gaps,** with Pocock's `grilling` (`node "${CLAUDE_PLUGIN_ROOT}/scripts/skill.mjs" grilling`), limited to: the six topics above plus each contradiction ("Your plan says offers are anonymous; the code shows names. Which is right?"); recommended answers taken from their own files; **at most 2 rounds and 8 questions in all**.

At any point "that's enough" stops the questions: what's left becomes open questions, marked as such.

## 3 · Your idea, as it stands

Write `F/00-intake/brief.md`, short, in their words. Each point says where it came from (*you*, *your documents*, *the code*):

```markdown
# <Name>: your idea, as it stands
**What it is:** … **For:** … (or "open: we'll find who needs it most")
**Why you:** … **What you want from it:** … **Working in 3 months means:** …
**Limits:** … **Already decided:** … **Already built:** … (code only, link plan-vs-code.md)
**Open, for research:** who it's for · what people pay · … (every "not sure", and every fact we didn't ask)
```

Show it in at most 12 lines and ask one thing: "Is this right?" Their corrections go in; then it's confirmed (`confirmed: <date>` at the top). Commit `F/00-intake/` only.

**Next:** carry on with `/founder:check` in this chat (it's short so far). For code, Check is followed by adopt's plan steps (5 to 8).
