---
name: legal
description: Legal and compliance for any product (not legal advice). Launch check (privacy, cookies, GDPR/CCPA, email law, accessibility, AI disclosure, app stores), privacy policy and terms from the product's real data flows, contract and NDA review, trademark check.
argument-hint: "check | docs | contract <file> | trademark <name>   [product]"
disable-model-invocation: true
---

# /founder:legal

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`, `knowledge.md`. Gate: `showcase`. Every output starts: *"Not legal advice. Have a lawyer review this before you rely on it, especially before taking payments."*

| Item | Done by | Output |
|---|---|---|
| `check` | Anthropic legal's `compliance-check` skill, given the product's facts: the data it collects (its settings at `paths.env` or `.env.example`, the outside services it calls, its database tables, forms), its regions, its emails, analytics and cookies, any AI features and app-store builds | `audits/legal-<date>.md`; each gap becomes an issue (`launch-blocker` if it must be fixed before going public) |
| `docs` | Rewrite the privacy and terms pages (at `paths.legal`, or wherever the app keeps its pages) from those same facts: what's collected, why, the processors it actually uses (for example Supabase, Vercel, Resend, PostHog, Stripe), retention, user rights, contact | A PR for the user to review |
| `contract <file>` | Anthropic legal's `review-contract`, or `triage-nda` for NDAs | A plain-English summary, red flags, and suggested redlines in `decisions/` (no personal details) |
| `trademark <name>` | USPTO, EUIPO and WIPO search links, `.com`/`.dev` availability (RDAP), similar marks in the product's class | `research/market/<date>-trademark-<name>.md` |

The early-access form needs a privacy notice before `/founder:showcase`, so the `showcase` playbook runs `check` first.
