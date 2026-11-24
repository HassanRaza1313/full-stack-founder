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

## 2. Try it (no setup)

```
/founder:ceo is my meal-planner idea worth building?
```

- Nothing gets installed or created.
- About 5–10 minutes and 700k tokens (most of them cached re-reads, which count far less toward your limit).
- **You get:**
  - a score out of 40
  - the strongest case against the idea
  - its top objections
  - three sharper versions, and a pick

Like it? Set up once (step 3).

---

## 3. Set up

```
/founder:setup
```

- Type it yourself. Claude can't start setup on its own, because setup installs things.
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
| Ideas | `/founder:setup ideas` | Capture, research and validate ideas |
| Build | `/founder:setup build` | Build products on your machine. This is the default |
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

### Step 1: Quick read

```
/founder:ceo is <your idea> worth building?
```

- **You get:** a score out of 40, the case against the idea, its objections, and three sharper versions.
- **You decide:** continue, refine, park or drop.

### Step 2: Frame the idea

The idea starts as a guess in your head. A short interview turns it into a clear picture first.

- **It asks** in rounds, each question with a suggested answer. Say "yes" to accept one.
- **It covers:** who it's for, the problem, what they do today, what you picture, why now, money, what success looks like, and your limits.
- **You get:** `brief.md`, your idea in your own words, with open questions for research.
- **You decide:** confirm the brief, or change it.
- Every later step works from the brief, and doesn't ask you the same things again.

### Step 3: Validate

```
/founder:ceo validate <idea>
```

This starts with the interview (step 2), then runs on its own:
- **Customers:** who has the problem, and in their own words.
- **Competitors:** who already solves it, and where they fall short.
- **Pricing and numbers:** what to charge, the cost to serve, and unit economics.
- **People to talk to:** 10 to 15 real prospects. You reach out yourself.
- **Full review:** suggestions you accept or reject, round after round, until the idea stops improving.

**You decide:** build, park, drop, or overrule it.

- Want a second opinion on a big call? `/founder:board should I build <idea>?`
- Every result is saved as a dated file with its sources.

### Step 4: Build

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

### Step 5: Launch

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

### Step 6: Listen

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

Or just tell `/founder:ceo` "I built an app, it's in this folder".

- **It asks for your ideas first.** Tell it, or drop notes, Word docs or old plans into the folder it gives you. Your ideas go through the same review as any other: nothing skips it.
- **One home for your code.** It moves the code into your products folder. Other copies on your computer are merged in (their own files kept) and put aside, never deleted.
- **No GitHub copy yet?** It offers to save your code privately on GitHub, with passwords and keys kept out.
- **It gets everything working:** installs what the code needs, repairs a moved setup, and runs the tests once.
- **You finish with a checklist:** your ideas, what it is, the plan, ideas reviewed, set up, tests pass. Then it says what to say next.

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
- **Stop at the first stop** when you only need a quick answer: the quick read alone is enough to drop a weak idea.

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
