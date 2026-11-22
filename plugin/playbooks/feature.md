---
title: Add a feature end to end
target: enhancement (or text for a new one)
time: from an hour to a few days, depending on size
---
1. `/founder:idea add <text>` (skip if the enhancement already exists).
2. `/founder:discover <product>#<n>`: the product review (who it's for, evidence, fit, metric impact) and the technical review (approach, schema, risk, effort, new services). **Stop:** build now, keep in the backlog, park, or reject.
3. `/founder:spec <product>#<n>`: spec and tickets. **Stop:** approve the spec. You can end here and build later; the feature stays `specced`.
4. `/founder:design shape`, then build the screens (only if the feature has new screens).
5. `/founder:build`: one PR for the whole spec. **Stop:** review and merge it. `/founder:verify` before release.
6. `/founder:release`: changelog and release notes.
7. `/founder:market announce <feature>`: a post and an update email, drafts only. **Stop:** you post them.
