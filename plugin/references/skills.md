# Who does the work

Studio skills target, add context, save and track. The work itself is done by these proven skills: the most-used option for each job. They ship inside the plugin as pinned, unchanged copies (`<plugin>/vendor/`; versions and licences in `vendor.json`), so every user runs the versions this release was tested with. Load one with `node "<plugin>/scripts/skill.mjs" <name>` and follow the file exactly. `<plugin>` is the parent of this `references/` folder.

| Job | Skill (source) | Used by |
|---|---|---|
| Finding new ideas: complaints, reviews, community pain, competitor gaps | `customer-research` (its online-intel mode), `competitor-profiling` (Corey Haines) | hunt |
| Deep discovery: market, competitors, customers, strategy, brand, MVP, financials, validation | `startup-design` (ferdinandobons/startup-skill) | discover |
| Positioning | `startup-positioning` (ferdinandobons) | research |
| Fundraising pitch | `startup-pitch` (ferdinandobons) | raise playbook |
| Customers, competitors, pricing, offers | `customer-research`, `competitor-profiling`, `pricing`, `offers` (Corey Haines, marketingskills) | research, finance |
| Board of directors (Offers, Monopoly and Product lenses) | `founder-board` (Jakeschincariol/founder-skill) | board, discover |
| Unit economics, break-even, cash needed | `founder-cfo` (founder-skill; needs Python) | finance |
| Brief, copy, CRO, social, SEO, launch, plan, calendar, emails, onboarding, ASO, directories | `product-marketing`, `copywriting`, `cro`, `social`, `seo-audit`, `launch`, `marketing-plan`, `content-strategy`, `emails`, `onboarding`, `aso`, `directory-submissions` (Corey Haines) | market, showcase |
| Prospects, outreach, sales assets | `prospecting`, `cold-email`, `sales-enablement` (Corey Haines) | sales |
| Retention | `churn-prevention` (Corey Haines) | support |
| Framing the idea | `grilling` (Matt Pocock) | discover --frame |
| Spec and tickets | `grill-with-docs`, `to-spec`, `to-tickets` (Matt Pocock) | spec |
| Build | `implement-spec`, `tdd`, `code-review` (Matt Pocock) | build |
| Adopting an existing repo | `product-marketing` (Corey Haines), for positioning from the README | adopt |
| Repo setup | `setup-matt-pocock-skills` (Matt Pocock) | setup-product |
| Product UI, design system, reviews | `impeccable` (Paul Bakaus), with `no-ai-design-slop` (Meng To) as a quality gate | design |
| Marketing, landing and portfolio sites | `build-awwwards-quality-sites` (Meng To), `gsap-*` (GreenSock) | design, showcase |
| Security | `security-audit` (Cloudflare), built-in `/security-review` | verify |
| Browser QA, screenshots, recordings | Playwright CLI | verify, market, showcase |
| Video | `hyperframes`, `brag` (installed at the showcase stage, pinned) | market |
| Compliance, contracts, NDAs | `compliance-check`, `review-contract`, `triage-nda` (Anthropic, from its legal plugin) | legal |
| Support triage, replies, help articles | `ticket-triage`, `draft-response`, `kb-article` (Anthropic, from its customer-support plugin) | support |
| Library docs while coding | Context7 MCP | build |

Only Impeccable (a plugin, `/founder:setup build`) and the video skills (`/founder:setup showcase`) are installed separately. If a skill can't be found, say which one. Don't quietly do the job without it.
