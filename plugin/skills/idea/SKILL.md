---
name: idea
description: Capture and manage ideas, either new products or enhancements to existing ones. Add (detects which, de-duplicates), list (portfolio or a product backlog), show, note, move.
argument-hint: "add <text> | list [stage] [--product <p>] | show <idea> | note <idea> <text> | move <idea> <stage> [reason]"
disable-model-invocation: true
---

# /founder:idea

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`. Settings come from `node "${CLAUDE_PLUGIN_ROOT}/scripts/workspace.mjs" show`; if it fails, offer `/founder:setup`. Pass `--repo` to every `gh` call, and preview each `gh` write in one line.

| Level | Repo | Stages | Off-ramps |
|---|---|---|---|
| Product idea | `studioRepo` | `new → exploring → researching → building → showcased → graduated → live` | `parked`, `shelved`, `rejected`, `sunset` |
| Enhancement | the product's repo | `new → exploring → validated → specced → building → shipped` | `parked`, `rejected` |

**Refs:**
- `12` is a product idea.
- `<product>#12` is an enhancement. A bare `#12` inside a product repo means that repo.
- A slug or a few words are matched against titles and `slug:`. Ask if it's ambiguous.
- Products are the ideas whose metadata has a `repo:`.

**Metadata block** (the end of the body; keep keys you don't recognise):

```
<!-- studio
slug · track · light · score (/10; older ideas /40) · repo · drive · site · demo · demo_url · signals   ← product ideas
impact · confidence · ease · score (/125) · review · spec · evidence                   ← enhancements
next · updated
-->
```

Write it one `key: value` per line. Never store a path from this computer: `repo` is `owner/name` (each computer finds it under its own products folder) and `drive` is the product's folder name inside the media folder.

No idea yet? `/founder:hunt` finds them from real complaints and competitor gaps.

## add `<text>`

1. **Level.**
   - Recommend **enhancement** if Claude is running in a product repo, or the text names or changes a known product.
   - Otherwise recommend **new product**.
   - Decide, and say which in one line ("Saving this as a new feature for Fraud Guard"). Ask only when it could really be either.
2. **Duplicates.** Run `gh issue list --label type:idea --state all --search "<3–5 keywords>" --json number,title,state,labels --limit 10`. For an enhancement, also check the roadmap and open specs. On a match, offer to add a note to it instead.
3. **Draft:**
   - **Product idea:** Problem, Hypothesis ("We believe X will cause Y for Z"), Evidence, Source, Success metric, Size S/M/L, and a slug of 5 words or fewer.
   - **Enhancement:** Problem (which persona), Proposed change, Evidence, Source, Metric (from `product-metrics.md`), Size.
4. **Confirm once,** then create it with `gh issue create --body-file`. Labels `type:idea,status:new,source:<x>`. Metadata `next:` is `say: check <name>` (a product idea) or `/founder:discover <product>#<n>` (an enhancement), plus `updated`. A product idea also gets `track: portfolio` and `demo: none`.
5. Close with the link and the `next:` command. An enhancement can also just stay in the backlog.

## list `[stage] [--product <p>]`

- **Portfolio:** a table grouped by stage: `# · Idea · Stage · Score · Demo · Signals · Next`. Off-ramps show as counts only.
- **Product backlog** (`--product`, or inside a product repo): `# · Idea · Stage · Score/125 · Evidence · Spec · Next`, highest score first.

## show `<idea>`

`gh issue view --json title,body,labels,comments`. Print:
- the stage and score history (comments starting `v<n>:`)
- the links
- the newest `INDEX.md` rows (or `STATE.md` lines for a product)
- what it's waiting on, and who
- the last 3 `Note (you):` comments

## note `<idea>` `<text>`

Comment `Note (you): <text>`. Flows act on notes newer than their own last run. If the note changes a past decision, name the flow that will act on it.

## move `<idea>` `<stage>` `[reason]`

- Swap the `status:*` label and set `updated:`.
- Off-ramps need a reason, as a comment `<Stage>: <reason>`, and as `reason:` in the metadata, so the portfolio can show it.
- `rejected` and `sunset` close the issue; moving out of them reopens it.
- Confirm first for flow-owned stages: `showcased`, `graduated`, `live`, `specced`, `shipped`.

Never delete issues, touch labels other than `status:` and `source:`, or invent values.
