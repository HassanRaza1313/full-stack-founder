<p align="center"><img src="plugin/.claude-plugin/icon.png" width="120" alt="Full Stack Founder"></p>

# Full Stack Founder

### A team of specialists, taking every idea from your mind to your customer's hands.

**Your one-person product agency, inside Claude Code.**

You can build it. Full Stack Founder runs the other half of a startup: research, pricing, design, marketing and selling, all from one command. Each job goes to the specialist skill builders already trust, and it adds only about 700 tokens to a session.

```
/plugin marketplace add https://github.com/HassanRaza1313/full-stack-founder.git
/plugin install founder@full-stack-founder
/founder:ceo is my meal-planner idea worth building?
```

## Your journey, from first idea to a whole portfolio

**Minute one: try it before you set anything up.**
Install, then ask `/founder:ceo` about one idea. You get a quick read with a score out of 40, the strongest case against the idea, its top objections and three sharper versions, with nothing else installed.

**When you're ready, set up once.**
`/founder:setup` checks your machine, installs the basics in one batch you approve, and makes a private workspace for all your ideas. It asks only for what your next stage needs, so accounts for hosting and payments wait until a product needs them.

**Then just say where an idea should go.** Every journey stops for your call.

| You say | It runs |
|---|---|
| "Find me ideas in fintech" | A hunt through real complaints, reviews and competitor gaps, ranked with sources |
| "Is this worth building?" | Customer and competitor research, pricing, the numbers, and a board vote |
| "Build it" | Its own repo, a spec you approve, design, the build and tests |
| "Launch it" | A case study and demo, plus posts and outreach as drafts you send |
| "Add dark mode to Fraud Guard" | A product and technical review, then spec, build and release |

**Run every project from one place.**
`/founder:ceo` on its own gives a CEO brief across your whole portfolio: where each product and idea stands, the decisions waiting for you with a recommendation for each, what's at risk, and the best next moves. A weekly journey checks what customers said, chases follow-ups and drafts next week's posts. Each product keeps its own repo. Ideas, decisions and lessons live in one workspace, so what one project teaches, the next one starts with.

**Stop when you stop.**
`/founder:pause` saves your work and shuts everything down. `/founder:resume` brings back only what the next task needs.

## Built for what actually goes wrong

**"I can build it. Selling it is the problem."**
Every department of a startup sits behind one front door: research, pricing, design, build, marketing, sales, support and legal, plus a board for the big calls. Twelve journeys chain them, from "is this worth it?" to your first paying customer.

**"I have five half-built projects and no idea where each one stands."**
One brief covers all of them: each product's stage, its key number and its next step, then the decisions waiting on you and the three best next moves. Your whole portfolio, run like an agency.

**"All-in-one tools are average at everything."**
Each job goes to the most-used specialist for it. Matt Pocock's skills build. Impeccable and Meng To design. Corey Haines's skills research, market and sell. founder-skill runs the board and the numbers, and Anthropic's skills handle legal and support. That's 51 skills with more than 650,000 GitHub stars between them.

**"Skills eat my context and my usage limit."**
A fresh session with Full Stack Founder starts about 700 tokens heavier. The same 51 skills installed the usual way add about 3,400 to every session, in every project. Each skill loads only when a job needs it, so you get the same skills, with the same instructions, at a fraction of the weight. Before a journey runs, you see what it will cost; a full research step measured about 100k tokens.

**"Installs break, and updates break them again."**
Setup installs only the basics, such as Git and the GitHub CLI. Each release ships the exact skill versions it was tested with, so an upstream change reaches you only after it passes our tests.

**"It asks me everything, or it does things I never approved."**
It works on its own between your decisions and stops only for them. Posts, emails and outreach arrive as drafts, and you send them.

**"AI tells me every idea is brilliant."**
Every verdict opens with the strongest case against the idea, with sources. A deliberately weak test idea, a paid social network for left-handed people, scored 11 out of 40, then got three sharper versions and a pick it could build.

**"I researched this once. Where did it go?"**
Every result is a dated file with a summary and its sources. Months later, `/founder:ask` answers from them with links, and flags anything out of date.

**"I'm paying for servers before I have a customer."**
Every idea you build becomes a case study, a demo and posts, for about $0. Only ideas that real customers ask for move to paid infrastructure.

**"Docker is eating my RAM again."**
`/founder:pause` saves and pushes your work, then stops Docker, WSL and everything else the product runs. In testing it freed 1.9 GB. `/founder:resume` starts only what the next task needs.

## Install

You need Claude Code with a Pro or Max plan.

**In a terminal** (PowerShell, Terminal or bash). This installs for your user, so every project gets it:

```
claude plugin marketplace add https://github.com/HassanRaza1313/full-stack-founder.git
claude plugin install founder@full-stack-founder
claude plugin list
```

**Or in a Claude Code chat:**

```
/plugin marketplace add https://github.com/HassanRaza1313/full-stack-founder.git
/plugin install founder@full-stack-founder
```

Then **start a new Claude Code session**, and type `/founder` to see the commands. Install stuck? See [If something breaks](GUIDE.md#7-if-something-breaks).

## Set up

Try `/founder:ceo` on one idea first. It needs no setup. When you're ready:

```
/founder:setup
```

- **It checks your machine** and lists what's ready, what it installs, and what needs you.
- **Claude installs** the tools (Git, Node, the GitHub CLI and more) in one batch you approve.
- **You do** only the sign-ins and accounts, one step at a time. No passwords in chat.
- **You choose:**
  - your folders
  - a free `.vercel.app` site, or your own domain (about $10 a year)
  - a local media folder, or Google Drive
- **Set up in stages:** ideas, then build, then showcase, each only when you need it.

**[The guide](GUIDE.md)** walks through every step, from setup to your first launch.

## The commands

Start with these. Everything else runs behind them.

| | |
|---|---|
| `/founder:ceo` | The front door: a CEO brief, or "do this" in plain words ("validate my meal-planner idea", "can this make money?"). It shows the cost before it runs a journey |
| `/founder:hunt` | Find product ideas from real complaints, reviews and competitor gaps |
| `/founder:board` | Your board of directors for any decision |
| `/founder:ask` | Answers from everything already researched and decided |
| `/founder:setup` | Get this machine ready for the next stage |
| `/founder:pause` · `/founder:resume` | Stop everything a product runs; start only what the next task needs |

<details>
<summary>Every command, for direct control</summary>

| | |
|---|---|
| `/founder:run <playbook>` | A whole journey: validate, idea-to-launch, feature, customer-test, finance-check, first-customers, showcase, health, weekly, monthly-review, raise, graduate |
| `/founder:idea` · `/founder:portfolio` · `/founder:next` | Capture ideas and enhancements; the detailed portfolio view; "what should I do now?" on one product |
| `/founder:research` · `/founder:finance` · `/founder:discover` · `/founder:market` · `/founder:sales` · `/founder:listen` · `/founder:support` · `/founder:legal` | The departments, each runnable on its own |
| `/founder:setup-product` · `/founder:spec` · `/founder:design` · `/founder:build` · `/founder:verify` · `/founder:release` · `/founder:showcase` | Engineering, built on Matt Pocock's skills and Impeccable, and the showcase |

</details>

Run `/founder:portfolio help` for one line per command, or ask `/founder:ceo` in plain words.

## What it doesn't do

- **It doesn't act in public for you.** It drafts posts, emails and outreach; you send them. Nothing is published, deployed or paid for without your yes.
- **It doesn't replace a lawyer, an accountant or real customers.** Legal output is marked "not legal advice", and simulated customer reactions never count as evidence.
- **It doesn't scrape or sign in anywhere.** Sites that block automated reading are read through your own browser, read-only, or the result says they were only partly read.
- **It doesn't make big jobs free.** A full validation journey is several hundred thousand tokens; you see the estimate before it starts, and where you can stop.
- **It isn't hosted.** Everything runs in your Claude Code, your files and your GitHub.
- **It isn't affiliated with the skills' authors.** It ships their open-source skills with credit and their licences; they haven't endorsed it.
- **It doesn't run paid production yet.** Moving a product with paying customers to production hosting, billing and monitoring is coming in a later release.

## Tested

- **Tested end to end on Windows.**
- **Built for macOS and Linux too.** Automated install checks pass on both on every change. Full end-to-end testing there is still to come.
- A test suite checks the first run, routing, honest verdicts and pinned skills ([`plugin/evals/`](plugin/evals/)).

## Credits

Full Stack Founder orchestrates excellent open-source skills by Matt Pocock, Corey Haines, ferdinandobons, Paul Bakaus (Impeccable), Cloudflare, GreenSock, HeyGen, Meng To, Anthropic and others. Each release ships pinned, unchanged copies of their skills with their original licences in [`plugin/vendor/`](plugin/vendor/); see [CREDITS.md](CREDITS.md). Want one of these skills for work outside Full Stack Founder? Install the original from its author's repo.

## License

MIT © 2026 Hassan Raza Mahmood
