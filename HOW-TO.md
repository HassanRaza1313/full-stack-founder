# How to use Full Stack Founder

Simple steps for everything you'll want to do. No experience needed.

**How it works:** you type in plain words, and it does the work. It stops and asks you whenever a decision is yours. You can type the short commands shown here, or just say what you want.

---

## 1. Get started (once)

**You need:** Claude Code, on a Pro or Max plan.

1. Open Claude Code.
2. Type these two lines, one at a time:
   ```
   /plugin marketplace add https://github.com/HassanRaza1313/full-stack-founder.git
   /plugin install founder@full-stack-founder
   ```
3. Close Claude Code and open it again.
4. Type:
   ```
   /founder:ceo
   ```
5. It asks **"What are you bringing?"** Answer in your own words. Anything goes: an idea, your goals, notes, a folder of code, a GitHub link, or a mix.

**Setup comes later.** It only happens when a step needs it, and it says why first. You don't install anything before your first idea.

---

## 2. Check an idea

**When:** you have an idea and want to know if it's any good.

**Say:**
```
check my idea: <your idea in a sentence or two>
```

**What happens:**
- A few short questions about what you want. "Not sure" is a fine answer.
- It researches the market, the rules and the competitors (about 10 minutes).
- You get one screen:
  - 🟢 worth building, 🟡 worth a closer look with changes, or 🔴 not as it stands
  - what's promising, what's risky, and better versions

**Then say one of these:**
- **keep it**: saves it privately (the first time, it sets up a private GitHub space, about 5 minutes)
- **prove it**: the next step (section 3)
- **build it anyway**: your call; the verdict is only advice
- **park it**: put it aside for later

---

## 3. Prove it (will people pay?)

**When:** an idea looks good and you want to be sure before building.

**Tip:** start a **new chat** for each big step. It costs less, and nothing is lost.

**Say:**
```
prove <idea name>
```

**What happens:**
- It researches who your customers are and how to reach them.
- It gives you 10 to 15 people to talk to, a short interview script, and two messages to send.
- **You talk to 3 to 5 of them**, then tell it what you heard, in any form.
- It works out the first version, the price and the money.
- A "board" of three advisors votes: build it, or not yet.

**Then say:** build it, change it, build it anyway, park it, or drop it.

---

## 4. Build it

**When:** you've decided to make it.

**Say:**
```
build <idea name>
```

**What happens, and what you decide:**

| It does | You decide |
|---|---|
| Picks a name and makes a private home for the code | Yes to the name |
| Writes the plan for the first version | Approve the plan |
| Shows design options | Pick one |
| Builds it and tests it | Look it over and say yes |
| Checks it in a real browser, for speed and safety | Fix anything serious first |

---

## 5. Bring in what you already have

**When:** you already have code, notes or documents (even half-finished, even made with an AI tool).

**Say:**
```
/founder:ceo
```
Then tell it what you have, for example: "My app is in this folder, and my plans are in this Word doc."

**What happens:**
- It keeps your code in one place, with a private backup on GitHub.
- It installs what the code needs, runs its tests and checks it opens.
- It reads your notes and compares them with the code: what's built, what isn't, and where they disagree.
- It asks you only about the gaps.
- Then it checks the idea (section 2) and writes a plan for what comes next.

It never changes your code without asking.

---

## 6. See all your products and ideas

**Say:**
```
/founder:ceo
```
You get a short report:
- every product and idea, and where each one stands
- what's waiting on you
- the best next moves

**For more detail, say:**
```
/founder:portfolio
```

**On GitHub:** open your private workspace (usually `github.com/<your name>/studio-workspace`) and click **Issues**. Each idea has a card at the top showing:
- its stage: ✅ Idea → ✅ Checked → ⬜ Proven → ⬜ Built → ⬜ Live
- its verdict
- what to say next

**In the files:** each idea's folder opens with a "start here" page that links everything.

---

## 7. Start work on a product

**When:** you're sitting down to work.

**Say:**
```
/founder:resume
```
It shows where you left off and starts only what's needed.

**Not sure what to do next? Say:**
```
/founder:next <product name>
```
It tells you the next step and why, and can start it.

---

## 8. Stop for the day

**Say:**
```
/founder:pause
```
It saves and backs up your work, notes where you stopped, and turns off everything that uses memory.

---

## 9. Add a feature or fix something

**Say it plainly:**
```
/founder:ceo add dark mode to <product name>
```
It checks whether the feature is worth it, plans it, builds it and gets it ready to release. It stops for your yes.

---

## 10. Show it off and get customers

| You want | Say |
|---|---|
| A case study, demo, posts and video | `/founder:ceo launch <product name>` |
| People to sell to, and messages to send | `/founder:ceo find customers for <product name>` |
| What users are saying, every week | `/founder:listen <product name>` |
| Help with customer questions | `/founder:support` |

**You always post and send things yourself.** It only writes the drafts.

---

## 11. Money

**Say:**
```
/founder:ceo can <product name> make money?
```
You get the pricing, what it costs to run, and when it pays for itself. Every number has its source.

---

## 12. A big decision

**When:** you're thinking about changing direction, the price, or stopping.

**Say:**
```
/founder:board should <product name> <your question>?
```
Three advisors look at it from different angles and vote. You make the final call.

---

## 13. Find new ideas

**Say:**
```
/founder:hunt <a topic, for example: tools for small restaurants>
```
It finds real complaints and gaps people would pay to fix, then offers to check the best one.

---

## 14. Look something up

**Say:**
```
/founder:ask what did we decide about pricing for <product name>?
```
It answers from what's already been researched and decided, with links. It doesn't redo any work.

---

## 15. Update the plugin

When a new version is out, a session tells you in one line.

**Say:**
```
update founder
```
Then close Claude Code and open it again.

---

## Words you'll see

| Word | Means |
|---|---|
| **Workspace** | Your private place on GitHub for ideas and plans |
| **Repo** | A product's own folder on GitHub, where its code lives |
| **Verdict** | The one-screen answer: 🟢, 🟡 or 🔴, and why |
| **Card** | The summary at the top of each idea on GitHub |
| **Board** | Three advisors who vote on big decisions |
| **Tokens** | How Claude measures work. Each step tells you roughly how long it takes first |

## If something goes wrong

- **Not sure what's happening?** Say "where are we?"
- **Something failed?** It tells you what happened and the one thing to do. If it doesn't, say "what went wrong?"
- **More help:** the [full guide](GUIDE.md) has every detail, and [If something breaks](GUIDE.md#8-if-something-breaks) covers install problems.
