---
title: Idea to launched product, end to end
target: a product idea (starts from its current stage) or plain text for a new one
time: days to weeks; mostly unattended between your decisions
---
1. `/founder:idea add` (skip if the idea exists).
2. `/founder:check` (it captures the idea first). **Stop:** prove it, a better version, build it anyway, or park.
3. `/founder:prove` (skipped if they chose "build it anyway", recorded in `decisions/`). **Stop:** your conversations. **Stop:** build it, change it, build it anyway, park it, or drop it.
4. `/founder:setup-product <slug> "<name>"`: the name (from startup-design's brand phase, run here) and the private repo; the research moves in. **Stop:** confirm the name and the repo.
5. `/founder:spec mvp`, from Prove's first version. **Stop:** approve the spec.
6. `/founder:design` (shape, then variants). **Stop:** pick a direction.
7. `/founder:build`. **Stop:** review and merge the PR.
8. `/founder:verify`. Fix P1s with `/founder:build`, then continue.
9. `/founder:legal check`, fixing launch-blockers.
10. Playbook `showcase`. **Stop:** approve public pieces; you post.
11. Playbook `customer-test` on the live case study, then `/founder:listen` weekly until the graduation gate.
