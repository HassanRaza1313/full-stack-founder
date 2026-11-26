# Full Stack Founder: the guide

From install to your first launch, step by step.

**Contents:** [1. Install](#1-install) · [2. Try it](#2-try-it-no-setup) · [3. Set up](#3-set-up) · [4. Idea to launch](#4-from-idea-to-launch) · [5. More ideas and features](#5-more-ideas-and-features) · [6. Run your portfolio](#6-run-your-portfolio) · [7. Save tokens](#7-save-tokens) · [8. If something breaks](#8-if-something-breaks)

---

## 1. Install

**You need:** Claude Code, signed in with a Pro or Max plan.

**In a terminal** (PowerShell, Terminal or bash):

```
claude plugin marketplace add https://github.com/HassanRaza1313/full-stack-founder.git
claude plugin install founder@full-stack-founder
claude plugin list
```

- `claude plugin list` should show `founder@full-stack-founder` as enabled.
- It installs for your user, so every project gets it.
- **Start a new Claude Code session.** Plugins load only when a session starts.

**Or inside a Claude Code chat:**

```
/plugin marketplace add https://github.com/HassanRaza1313/full-stack-founder.git
/plugin install founder@full-stack-founder
```

Then type `/exit` and start `claude` again.

**Check it worked:** type `/founder` and you should see the command list.

---

## 2. Start: say what you're bringing

```
/founder:ceo
```

- **It asks one thing first:** an idea, an idea with goals, notes or documents, or code (a folder or a GitHub link). Or just tell it.
- **Nothing to set up for an idea or documents.** You get the verdict in about 10 minutes: what's promising, what's risky, and better versions.
- **Want to keep it?** Say "keep it". It sets up a private place on GitHub then (about 5 minutes) and moves the idea in.
- **Code?** It brings it in properly on the way: one home, a private backup, and a check that it runs.

---

## 3. Set up

```
/founder:setup
```

- **You rarely need to run it.** Each step sets up what it needs, when it needs it, says why and how long, then carries on. Run it yourself to get everything ready up front ("set everything up").
- Setup checks your machine first and shows: `ready · automatic · need you`.
- **Automatic** items are installed in one batch. You approve the batch once.
- **Need you** items come one at a time, each with steps and a link. Say `done` or `skip`.
- Setup never asks for passwords, keys or tokens in chat.
- You can stop at any point and run it again later. It picks up where it stopped.

**See what's missing, and change nothing:** `/founder:setup check`

### Set up only what you need

Each stage includes the ones before it. Start with **ideas** and add the rest when you need them.

| Stage | Run | For |
|---|---|---|
| Ideas | `/founder:setup ideas` | Save and research ideas privately (Git, GitHub, your workspace) |
| Build | `/founder:setup build` | Build products on your machine (adds Node packages, Python, Docker, testing tools) |
| Showcase | `/founder:setup showcase` | Case studies, demos, videos and posts |
| Graduate | coming later | Running a product with paying customers |

### Ideas stage (free, about 10 minutes)

**Claude does:**
- Git, Node.js, pnpm, the GitHub CLI and Python
- your git name, with GitHub's private no-reply email
- your private workspace repo on GitHub, with its labels
- runs routine helpers on Sonnet, to save tokens

**You do:**
- Have a GitHub account. A free one works.
- Sign in once, in your browser, when setup asks (`gh auth login --web`).
- On a Mac: install Homebrew first (brew.sh).

**Your choices:**

| Choice | Default | Options |
|---|---|---|
| Workspace repo | `<you>/studio-workspace`, private | Any name. An existing workspace repo gets cloned |
| Products folder | a roomy non-system drive (e.g. `D:\Code`), else `~/Code` | Any folder |
| Heavy tools (Windows, small C drive) | off | Move tools and Docker to another drive |

### Build stage (free)

**Claude does:**
- TypeScript support, so Claude sees type errors as it edits
- Context7, so Claude codes against current library docs
- Impeccable, for UI design and reviews
- Playwright and its browser, so Claude clicks through your app to test it
- gitleaks, which keeps keys out of your code

**You do:**
- Docker, but only when a product needs a database. Setup shows you the exact steps.
  - Mac: OrbStack, which is lighter.

### Showcase stage (free, or about $10 a year with a domain)

**Claude does:**
- FFmpeg and the video skills, for demos and launch clips
- the Vercel command-line tool
- read-only access to your early-access signups

**You do:**
- Sign in to Vercel. Use "Continue with GitHub".
- Create one free Supabase project named `studio`, for waitlists and demos.
- Build your portfolio site, using the plugin itself. Setup shows you how.

**Your choices:**

| Choice | Free option | Paid option |
|---|---|---|
| **Site address** | `yourname.vercel.app`. This is the default | Your own domain, about $10 a year through Cloudflare. Demos then get `<product>.yourdomain.com` |
| **Media folder** (videos, images, slides) | Any local folder | Google Drive for desktop, if you want to share or back up media |
| **Bot protection** on forms | Cloudflare Turnstile, which is free | |

- You can start free and add a domain later. Run `/founder:setup showcase` again when you're ready.
- Vercel's free plan is for non-commercial use. That fits showcases and demos. Paid products move to paid hosting when they graduate.

---

## 4. From idea to launch

Say it in plain words to `/founder:ceo`, or run each step yourself. Before each journey runs, you see what it will cost and where you can stop.

An idea goes **Idea → Checked → Proven → Built → Live**. Its card in your catalog on GitHub shows where it stands, the verdict, and what to say next.

### Step 1: Check it (about 10 minutes)

```
check my idea: <your idea, in a sentence or two>
```

- **First, how far along are you?** Just an idea, some goals in mind, or work already done (notes, a plan, Word docs, code: drop them in).
- **Then a few questions about what you want,** never about the market: up to 3 for an idea, up to 6 with goals, and only the gaps if you brought files. "Not sure" is a fine answer: the research fills it in, and the verdict says what it found.
- **You confirm "your idea, as it stands"** before anything judges it.
- **It researches** the market, the rules and the competitors.
- **You get** one screen: 🟢 worth building, 🟡 worth a closer look with changes, or 🔴 not as it stands. Then what's promising, what's risky, what would change the verdict, and up to three better versions.
- **You decide:** prove it, prove a better version, build it anyway, or park it. The verdict is advice: building anyway is your call, and it's recorded.

### Step 2: Prove it (a few hours, plus your conversations)

Start it in a new chat; everything is saved.

```
prove <idea>
```

- **Customers and demand:** who has the problem, in their own words, and how to reach them.
- **Real conversations:** 10 to 15 people who have the problem, a 20-minute script and two short messages. You talk to 3 to 5 and tell it what you heard.
- **The shape and the money:** who exactly it's for, the first version (what's in and out), pricing, costs and break-even.
- **One board vote:** "build it?", with any conditions in plain words. It can fix the conditions and vote again.
- **You decide:** build it, change it, park it or drop it.

Everything here feeds the build: the spec, design and marketing read it instead of asking you again.

### Step 3: Build

```
/founder:ceo build <idea>
```

| It does | You decide |
|---|---|
| Creates a private GitHub repo for the product | Confirm the name |
| Writes the spec and tickets, after asking you questions | Approve the spec |
| Designs it and shows you options | Pick a direction |
| Builds it, test-first, as one pull request | Review and merge |
| Tests it in a real browser, with performance and security checks | Fix anything serious first |

- Stop for the day: `/founder:pause`. It saves your work and frees memory.
- Come back: `/founder:resume`. It recaps where you left off.
- New version out? A session tells you in one line. Say "update founder", then restart Claude Code. To stop the notice, add `"updateCheck": false` to `studio.config.json`.

### Step 4: Launch

```
/founder:ceo launch <product>
```

- **You get:**
  - a case study page with an early-access form
  - a demo video and a launch clip
  - screenshots, a carousel and posts
  - the repo, checked for secrets, made public with a clean README
  - an optional live demo with its own address
  - prospects and outreach messages
- **You decide:** approve each public piece.
- **You send:** every post and message. Nothing goes out without you.

### Step 5: Listen

- `/founder:listen` weekly: signups, what customers said, and how close the product is to real demand.
- When customers start paying, the product moves to paid infrastructure.

---

## 5. More ideas and features

| You want | Type |
|---|---|
| Ideas from real complaints, reviews and gaps | `/founder:hunt fintech` |
| Save an idea for later | `/founder:idea add <idea>` |
| A feature for a product | `/founder:ceo add dark mode to <product>` |
| Answers from past research | `/founder:ask what did we find about pricing?` |
| Bring in code you already have | `/founder:adopt you/my-app`, or a folder |

### Bring in code you already have

```
/founder:adopt you/my-app
/founder:adopt "C:\Users\you\Desktop\My App"
```

Or just tell `/founder:ceo` "I built an app, it's in this folder", or paste the GitHub link. It's the same front door as an idea: it notices the code and brings it in.

- **It's the same journey as a new idea, with code attached:** your idea as it stands, then Check, then the plan.
- **It asks for your ideas first.** Tell it, or drop notes, Word docs or old plans into the folder it gives you. Your ideas go through the same review as any other: nothing skips it.
- **It compares your plan with your code:** what's built as planned, built differently, planned but not built, and built but in no plan. It asks you only about the places they disagree.
- **One home for your code.** It moves the code into your products folder. Other copies on your computer are merged in (their own files kept) and put aside, never deleted.
- **No GitHub copy yet?** It offers to save your code privately on GitHub, with passwords and keys kept out.
- **It gets everything working:** installs what the code needs, repairs a moved setup, and runs the tests once.
- **Then it checks it like any idea** (recommended if no real users have tried it yet), and makes the plan forward from what's really built.
- **You finish with a checklist:** one home, your idea as it stands, set up, tests pass, checked, the plan, ideas reviewed. Then it says what to say next.

- **It never changes your code** without a yes. The only change it offers is the lean-code rules in `CLAUDE.md`.
- **Where its plans and research live:**

| Your code | Default | Why |
|---|---|---|
| A private GitHub repo | In the repo (`product/`) | Everything about the product in one place |
| A public GitHub repo, or a folder | In your workspace (`products/<name>/product/`) | Research, pricing and plans stay private |

- Then use it like any other product: "add <feature> to <name>", a showcase, or a customer test.

**Features follow the same steps:** review, spec, build, release and announce, with a stop for each of your decisions.

---

## 6. Run your portfolio

```
/founder:ceo
```

- **You get:**
  - where each product and idea stands
  - the decisions waiting for you, each with a recommendation
  - what's at risk
  - the three best next moves
- **Weekly:** `/founder:run weekly` checks what customers said, chases follow-ups and drafts next week's posts.
- What one project teaches, the next one starts with.

---

## 7. Save tokens

- **See the cost first.** Every journey shows its token estimate and where you can stop.
- **Switch off connectors you don't need** (mail, calendar, docs) for founder sessions. Every helper agent loads them before it starts.
- **Research runs lean by default.** A cheaper model gathers the evidence once, and the judging model reads only the notes.
- **Stop after Check** when you only need a quick answer: it's enough to drop a weak idea.

**Better sources:** connect Claude in Chrome. Research then reads sites that block automated reading (Reddit, G2, Indie Hackers) through your own browser, read-only, instead of relying on search snippets.

## 8. If something breaks

| Problem | Fix |
|---|---|
| `Git clone timed out` | Some networks reach GitHub slowly, even when speed tests look fast. Set `CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS=600000`, restart Claude Code, and run the install again. A VPN often helps |
| `Host key verification failed` | Use the `https://github.com/...git` address from step 1 |
| `Plugin not found in marketplace` | `claude plugin marketplace update full-stack-founder`, then install again |
| `already on disk` when adding | It's already added. Go straight to `claude plugin install` |
| `/founder:...` commands don't appear | Start a new session. Commands need the `founder:` prefix |
| A setup step failed | `/founder:setup check` shows what's still missing |
| Anything else | [Open an issue](https://github.com/HassanRaza1313/full-stack-founder/issues) |
