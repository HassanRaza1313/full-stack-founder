# {{NAME}}

Studio product (`{{SLUG}}`). Stage and next step: `product/STATE.md`.

## Commands

| Command | Does |
|---|---|
| `pnpm dev` | Run the web app |
| `pnpm check` / `check:fix` | Biome lint and format |
| `pnpm typecheck` · `test` · `build` | Run via Turborepo |
| `pnpm db:reset` | Re-run migrations and `supabase/seed.sql` |
| `pnpm db:types` | Regenerate the DB types after a migration |

## Code

- Reuse before writing.
- Make the smallest complete change, including the callers and tests it breaks. Nothing speculative; deleting beats adding.
- Fix bugs at the root, in shared code.
- Never cut validation at trust boundaries, data-loss handling, security or accessibility.
- New logic gets a test.
- A known shortcut gets a `shortcut: <limit>, <when to upgrade>` comment.
- Comments explain why, not what.
- Run `/simplify` before a PR.

## Deploy-ready

- **Settings** come only from env, through `serverEnv()` in `packages/shared/src/env.ts`. Add every new variable there and to `.env.example`.
- **Outside services** are reached only through `apps/web/lib/adapters/`: email, analytics, errors, ratelimit, captcha. Each works locally without keys.
- **Schema** changes only through `supabase/migrations/`. Row-level security on every table. Expand, then contract.
- **Seed data** is realistic, with a demo account and no real personal data.
- **Payments:** Stripe test mode locally.

## Sessions and knowledge

- Local services are listed in `product/services.json`; keep it in step with the code.
  - Start one only when a task needs it: `/founder:resume up <id>`.
  - When the user stops or pauses: `/founder:pause`.
- Results live under `product/`, as dated files with a summary header. Check `product/INDEX.md` before researching again.
- Anything that names a person goes in the media folder, never this repo.
- Before spec, design or build work, read `docs/engineering.md`. It covers spec contents, ticket routing (`builder` or `architect`), one PR per spec, and design rules.
