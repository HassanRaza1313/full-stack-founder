# The verdict

Every idea has one file a founder reads: `<workspace>/ideas/<slug>/verdict.md` (in the product's knowledge folder once it's built). Check writes it and Prove rewrites it. Everything else is the evidence behind it.

```markdown
---
topic: verdict
stage: checked            # checked | proven
light: yellow             # green | yellow | red
score: 6/10               # Prove only: startup-design's overall score
call: Worth proving as a profile builder; not as a marketplace yet.
date: 2026-11-26
fresh_until: 2027-02-24
---

# Pitch Market · 🟡 Worth a closer look, with changes

**The call:** one or two sentences, the decision and the reason.

**What's promising**
- Up to 3 points, each one line, each linked to the file it comes from.

**What's risky**
- Up to 3 points, most serious first, each linked.

**What would change this:** one or two facts that would flip the light.

**What we filled in** (only if the brief left points open): one line each, "You weren't sure who it's for: the research points to …".

**Better versions** (Check only): up to 3, one line each, then "Pick: …".

**Next:** one plain sentence, then the words to say back ("say: prove pitch market").

<details><summary>Scores and files</summary>
One line per scored dimension, and links to the research.
</details>
```

## Rules
- **About 250 words, never over 300,** above the details. One screen. `node "${CLAUDE_PLUGIN_ROOT}/scripts/stage.mjs" --lint <file>` checks it: write it once, run the check once, fix once.
- **Lights:** 🟢 green "worth building" · 🟡 yellow "worth a closer look, with changes" · 🔴 red "not as it stands". One fatal flaw can outweigh five good signs: say which one.
- **Plain words.** A technical term only when it's the right word, explained once in brackets the first time: "unit economics (what each customer earns you after costs)", "broker-dealer (a firm licensed to arrange investments)".
- **No codes or shorthand:** no `E§4`, `CA§2`, `WTP`, `TAM`, `v0`, `[assumption]` tags, dimension numbers or severity labels. Link the file instead. A guess is said as a guess: "we're guessing here".
- **Both sides, weighed.** Promising and risky come from the case for and the case against, written separately. The call weighs them; it isn't an average.
- **Advice, not a gate.** Next always offers "build it anyway" unless the light is green: it's the founder's call.
- **Same file, both stages.** Prove rewrites it, keeps the Check light in one line ("Check: 🟡 · Prove: 🟢 7/10"), and drops "Better versions".
