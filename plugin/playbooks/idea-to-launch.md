---
title: Idea to launched product, end to end
target: a product idea (starts from its current stage) or plain text for a new one
time: days to weeks; mostly unattended between your decisions
---
1. `/founder:idea add` (skip if the idea exists).
2. Playbook `validate`. **Stop:** Ready to build, park, or kill.
3. `/founder:setup-product <slug> "<name>"`. **Stop:** confirm the name and the private repo.
4. `/founder:spec mvp`. **Stop:** approve the spec.
5. `/founder:design` (shape, then variants). **Stop:** pick a direction.
6. `/founder:build`. **Stop:** review and merge the PR.
7. `/founder:verify`. Fix P1s with `/founder:build`, then continue.
8. `/founder:legal check`, fixing launch-blockers.
9. Playbook `showcase`. **Stop:** approve public pieces; you post.
10. Playbook `customer-test` on the live case study, then `/founder:listen` weekly until the graduation gate.
