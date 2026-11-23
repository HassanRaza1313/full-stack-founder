---
name: design
description: Design with Impeccable under the repo's studio rules. shape, build screens, generate variants to pick from, critique, audit, polish, document DESIGN.md.
argument-hint: "[shape | critique | audit | polish | document | generate <n> <element> | <any impeccable command>]"
disable-model-invocation: true
---

# /founder:design

Rules: `${CLAUDE_PLUGIN_ROOT}/references/journey.md` and the "Design" section of the engineering rules (the repo's `docs/engineering.md`, or `engineering.md` in the knowledge folder). Gate: `build`.

- **Product UI:** run the `impeccable` skill with the user's arguments. With no arguments, use `shape` if there's no real `DESIGN.md` yet; otherwise show Impeccable's menu.
- **Landing, marketing or portfolio pages:** use MengTo's `build-awwwards-quality-sites`.
- **Every UI change:** `no-ai-design-slop` is the quality gate.

Then apply the studio rules:
- tokens live in `packages/shared/src/tokens.ts`
- GSAP skills handle motion, each with a reduced-motion fallback
- WCAG 2.2 AA
- brand assets go to `apps/web/public/` and the media folder's `Brand/`

Close with screenshots (Playwright CLI, 1440×900 and 390×844). Next: `/founder:build`.
