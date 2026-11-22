---
title: Health check
target: product
time: about an hour, unattended
---
1. `/founder:verify`: tests, accessibility, performance, and a security audit.
2. Dependency and secret scan (Dependabot alerts, gitleaks).
3. `/founder:design critique` and `/founder:design audit`: a UX and design review.
4. Stale knowledge: refresh anything the index marks stale. **Stop:** pick which to refresh.
5. Every finding becomes a `type:bug` or `type:idea` issue, labelled by risk.
