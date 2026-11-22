---
name: sales
description: Founder-led sales for any idea or product. ICP, qualified prospects or problem-holders to talk to, outreach drafts you send, sales assets, pipeline, call prep and summaries. Personal data stays in the media folder.
argument-hint: "icp | prospects [--signal] | outreach | assets | pipeline | call <prep|summary>   [target]"
disable-model-invocation: true
---

# /founder:sales

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md`, `knowledge.md`. Gate: `showcase`. Names and contacts live only in `<media>/<Name>/Sales/`; repo files carry counts and patterns.

| Item | Does | Saves |
|---|---|---|
| `icp` | Built from personas, `segments`, `/founder:listen` and wins: an ICP paragraph, a pass/fail checklist, triggers, disqualifiers, where these people are found | `sales/icp/<date>.md` |
| `prospects` | `prospecting` skill (it reads the ICP; run `icp` first if missing): 15–25 accounts or contacts, each with fit evidence, source URL, confidence, a Hot/Warm/Cold/Skip score and a tier. **`--signal`:** 10–15 people who have the problem, from public posts, communities and competitor reviews, to *talk to*, not sell to | CSV in Sales/; `sales/prospects/<date>.md` (counts and sources only) |
| `outreach` | `cold-email` skill: for each approved prospect, a first message about their situation plus follow-ups on day 3–4 and day 8–10, or a LinkedIn note and message | Drafts in Sales/, or Gmail drafts if asked |
| `assets` | `sales-enablement` skill: one-pager, objection handling (from `competitors` and real replies), demo script, case study once results exist | `sales/assets/`; PDFs in media |
| `pipeline` | Updates the `Pipeline` Sheet (`company · contact · source · score · first/last touch · next step · next date · status · notes`) with the replies the user reports, and lists today's follow-ups. Customer signals become `/founder:idea note` evidence | `sales/pipeline/<date>.md` (stage counts, reply rate, objection themes) |
| `call prep` · `call summary` | **Prep:** context, attendees' roles, agenda, 5 discovery questions. **Summary:** follow-up draft, pipeline update, anonymised quotes for `research/voice/` | — |

**Rules:**
- **Sources:** public and free first. Use paid tools only if the user has one. No bulk scraping of LinkedIn or Google Maps.
- **The user reviews every list and sends every message.**
- **Compliance** (CAN-SPAM, GDPR, CASL): a real sender, an opt-out line, business contacts with a clear reason. At most 20–30 new contacts a day from a personal domain.

**Close** with what's ready, the user's action, and when to run `pipeline` again (about 3 days).
