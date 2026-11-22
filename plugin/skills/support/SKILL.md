---
name: support
description: Customer support and retention for a live product. Triage the support inbox into answers, bugs and ideas; draft replies you send; turn repeat questions into help articles; plan retention and win-back. Feeds /founder:listen.
argument-hint: "triage | reply | help-docs | retention   [product]"
disable-model-invocation: true
---

# /founder:support

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`, `knowledge.md`. Gate: `graduate`. Customer names and messages stay in the inbox and the media folder; repo files hold patterns and counts.

| Item | Done by | Output |
|---|---|---|
| `triage` | Anthropic customer-support's `ticket-triage`, on the Gmail label `support/<name>` (or pasted messages) | Each message is sorted into answer, bug or idea. Bugs become `type:bug` issues; requests become evidence comments on ideas (or new `type:idea` drafts) |
| `reply` | `draft-response`, in the product's voice from `.agents/product-marketing.md` | Gmail drafts or text; the user sends them |
| `help-docs` | `kb-article`, from questions asked 3 or more times | Pages in `app/help`, as a PR |
| `retention` | Corey Haines's `churn-prevention`, `onboarding` and `emails`, using activation and churn data from `/founder:listen` | `marketing/retention/<date>.md` and email drafts |

Close with counts (answered, bugs, ideas), anything urgent, and the next step: usually `/founder:listen`, so the evidence reaches the backlog.
