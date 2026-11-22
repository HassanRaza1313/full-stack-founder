---
name: market
description: Marketing department for any product, no code changes. Copy, posts, carousels, videos, emails, case study, announcements, plan, calendar. Drafts you approve and post; every asset logged.
argument-hint: "copy | post | carousel | video | email | case-study | announce <what> | launch | plan | calendar   [product]"
disable-model-invocation: true
---

# /founder:market

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`, `knowledge.md`. Gate: `showcase` (copy-only work can run without FFmpeg).

**Inputs:**
- `.agents/product-marketing.md`. If it's missing, build it first with the `product-marketing` skill.
- Real facts only: the changelog, shipped specs, and quotes from `research/voice/` that have permission.
- **CTA:** Track 1 sends people to the case study and its early-access form; Track 2 to sign-up.
- **UTM:** `utm_source=<channel>&utm_medium=<organic|paid|email|referral|community>&utm_campaign=<campaign>`.

| Item | Makes | Skills |
|---|---|---|
| `copy <page>` | Landing, pricing or onboarding copy, 2 headline options, a CRO pass | `copywriting`, `cro` |
| `post <topic>` | LinkedIn, X and Instagram versions, plus target-community versions where their rules allow | `social` |
| `carousel <topic>` | An 8–10 slide PDF at 1080×1350 | HTML slides in the product's tokens → Playwright CLI PDF |
| `video demo\|vertical\|brag` | 60–90 s at 1920×1080, 30 s at 1080×1920, or a launch reel, recorded with `scripts/demo-walkthrough.mjs` | `hyperframes`, `brag`. Credit brag's CC BY music in every post that uses it |
| `email <purpose>` | Waitlist, launch, onboarding or win-back emails | `emails` |
| `case-study` | Problem, research highlights, personas, USP, design, architecture, demo, what's next | `copywriting` |
| `announce <feature\|vX.Y.Z>` | A post, an email update and a changelog line, from the release notes | `social`, `emails` |
| `launch` | A cheap real-world test first, then a dated countdown, the launch-day run sheet (Product Hunt kit, directories, community posts) and the first 30 days | `launch`, `directory-submissions` |
| `plan` | `marketing/plan.md`: ICP, positioning, messaging (3 pillars with proof), channels, 90-day calendar, budget, KPIs | `marketing-plan` |
| `calendar` | The next 4 weeks in `marketing/calendar.md` | `content-strategy` |

**Save:**
- **Copy** goes in `marketing/<item>/<date>-<slug>.md`.
- **Media** goes in `<media>/<Name>/Marketing/<date>-<campaign>/<channel>-<slug>.<ext>`, with `prompts.md` for images the user makes.
- **Log** each asset in the `Content log` Sheet, or tell the user which rows to add.

**Rules:** drafts only, and the user posts. No invented numbers, quotes or testimonials. `builder` writes; positioning changes go to `architect`, then the user. Close with previews, where each asset is saved, and posting times.
