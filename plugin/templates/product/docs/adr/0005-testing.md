# 0005. Testing

Status: accepted (studio default)

- **Unit tests (Vitest)** for any non-trivial logic: branches, parsers, money and security code.
- **End to end (Playwright)** for the core flows from each spec's acceptance criteria, run in CI against a temporary local Supabase.
- **Exploratory QA (Playwright CLI)** at each release candidate, recorded in `product/audits/`.
- **Coverage** is not a target. The acceptance criteria are.
