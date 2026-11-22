# How this product is specced, designed and built

Read this before spec, design or build work. It's studio's layer on top of Matt Pocock's engineering skills and Impeccable.

## Spec

`/founder:spec` chains `grill-with-docs` → `to-spec` → your approval → `to-tickets`. Every spec includes:
- user stories with Given/When/Then
- the data model, with row-level security per role
- server actions
- loading, empty, error and offline states
- analytics events
- budgets: LCP under 2.5 s, INP under 200 ms, CLS under 0.1, API p95 under 300 ms
- security notes
- WCAG 2.2 AA
- a feature flag `ff_<feature>`
- the success metric

The first spec also writes ADR-0008, the deployment target. A new local service goes into `product/services.json` in the same change.

Tickets get `complexity:low|medium|high`, `area:*` and `risk:*`. Track-2-only work (account deletion, legal pages, payments, production email) is labelled `launch-blocker`.

## Build: `/founder:build` (Pocock's implement-spec)

- **Implementer subagents:** `builder` by default. A `complexity:high` or `risk:*` ticket, or one that failed twice, goes to `architect`. Security and payment code never goes to a cheaper model.
- **Services:** start only what a ticket needs (`/founder:resume up <id>`).
- **Migrations:** `supabase/migrations/<ts>_<name>.sql`, with row-level security on every table, expand then contract, then `pnpm db:types`.
- **Review:** one PR per spec, reviewed by the user. CI must be green.
- **After merge:** run `/founder:verify` before a release or showcase. `/founder:pause` ends the session.

## Design: `/founder:design` (Impeccable)

- **New UI:** `shape`, then build, with `generate` for variants to pick from. `document` keeps `DESIGN.md` current.
- **Before shipping:** `critique`, `audit` and `polish`.
- **Motion:** the GSAP skills. **Landing, marketing and portfolio pages:** MengTo's `build-awwwards-quality-sites`. **Quality gate on all UI:** `no-ai-design-slop`.
- **Tokens** live in `packages/shared/src/tokens.ts`, and the Tailwind and shadcn theme follows them.
- **Brand assets** (wordmark, favicons, a 1024² app icon, OG template) go in `apps/web/public/` and the media folder's `Brand/`.
- **Always:** WCAG 2.2 AA contrast and focus, a reduced-motion fallback for every animation, and the spec's performance budgets.

## Studio state

- **Spec created:** the idea gets `status:specced` and `spec: #<n>`.
- **Build started:** the idea gets `status:building`.
- **Released:** `/founder:release` sets `shipped`.
