<p align="center"><img src="plugin/.claude-plugin/icon.png" width="120" alt="Full Stack Founder"></p>

# Full Stack Founder

### A team of specialists, taking every idea from your mind to your customer's hands.

**Your one-person product agency, inside Claude Code.**

You can build it. Full Stack Founder runs the other half of a startup: research, pricing, design, marketing and selling, all from one command. Each job goes to the specialist skill builders already trust, and it adds only about 700 tokens to a session.

```
/plugin marketplace add HassanRaza1313/full-stack-founder
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

You need Claude Code with a Pro or Max plan. The two `/plugin` lines above install it, and `/founder:ceo` works straight away. When you want a workspace for your ideas, run `/founder:setup`: it checks your machine and handles Git, Node, pnpm, the GitHub CLI and sign-in, and your private workspace. The specialist skills already come with the plugin.

The `/plugin` lines go in a Claude Code chat. To install from a terminal instead (PowerShell, Terminal, bash), use the `claude` command; it installs for your user, so every project gets it:

```
claude plugin marketplace add HassanRaza1313/full-stack-founder
claude plugin install founder@full-stack-founder
```

Then start a new Claude Code session.

**If the install stops:**
- **"Git clone timed out":** on a slow connection, give it longer. In your terminal, set `CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS=300000`, restart Claude Code, and run the two lines again.
- **"Host key verification failed":** Claude Code tried SSH. Add the marketplace by its web address instead: `/plugin marketplace add https://github.com/HassanRaza1313/full-stack-founder.git`.
- **"Plugin not found in marketplace":** the marketplace step didn't finish. Run `/plugin marketplace update full-stack-founder`, then install again.
- **Anything else:** run `/founder:setup check` and it tells you what's missing, or [open an issue](https://github.com/HassanRaza1313/full-stack-founder/issues).

**Platforms:** built for Windows, macOS and Linux. So far it has been tested end to end only on Windows; the setup scripts run automated checks on all three on every change.

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
- **Not built yet:** `/founder:graduate` and `/founder:deploy`, which arrive with the first product that graduates.

## Tested

Before launch, we ran Full Stack Founder's own research and board on itself, and changed what they found: lighter sessions, pinned skills, a cost estimate before every journey, and a first run with no setup.

<!-- evals:start -->
**Test suite** (`claude plugin eval`, 2026-11-22, Windows; each case starts in a fresh, empty environment with only this plugin):

| Case | What it checks | Result |
|---|---|---|
| First run | A brand-new user is offered a no-setup quick read, and nothing is installed or created | 2/2 passed |
| Routing | "Can my idea make money?" maps to the finance-check journey, with its token cost and stops, without starting it | 2/2 passed |
| Honest verdict | A deliberately weak idea (a $15/month social network for left-handed people) gets a low score and leads with the case against it | 1/1 passed: scored 11/40 |
| Pinned skills | The lookup finds the plugin's own pinned copy of each skill | runs in CI on Linux (Windows can't sandbox a shell inside a test) |

The three cases cost $1.52 in total. The suite is in [`plugin/evals/`](plugin/evals/).
<!-- evals:end -->

## How it's organised

```
plugin/
  skills/        one folder per command
  agents/        scout (Haiku, lookups), builder (Sonnet), architect (Opus)
  playbooks/     the built-in journeys; add your own in your workspace
  references/    the journey and knowledge rules every skill follows
  vendor/        pinned, unchanged copies of the specialist skills, with their licences (vendor.json)
  requirements.json   everything it needs, by stage
  scripts/       Node, no dependencies: doctor, workspace, setup-product, session, index, skill, vendor
  templates/     the product repo template, label sets, the workspace template
  evals/         the test suite, run with `claude plugin eval`
```

The repo holds only what the plugin needs to run, plus its tests and checks.

Your ideas, settings and lessons never live here. They're in your private workspace (your *studio*), which `/founder:setup` creates.

## Credits

Full Stack Founder orchestrates excellent open-source skills by Matt Pocock, Corey Haines, ferdinandobons, Paul Bakaus (Impeccable), Cloudflare, GreenSock, HeyGen, Meng To, Anthropic and others. Each release ships pinned, unchanged copies of their skills with their original licences in [`plugin/vendor/`](plugin/vendor/); see [CREDITS.md](CREDITS.md). Want one of these skills for work outside Full Stack Founder? Install the original from its author's repo.

## License

MIT © 2026 Hassan Raza Mahmood
