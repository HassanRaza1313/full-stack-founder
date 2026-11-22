# {{NAME}}

> One-line description, written by `/founder:showcase`.

## Run it locally

Requirements: Node 22+, pnpm, Docker Desktop.

```bash
pnpm install
cp .env.example .env.local   # then paste the keys printed by the next command
pnpm db:start                # local Supabase (Docker must be running)
pnpm dev                     # http://localhost:3000
pnpm db:stop                 # when you're done (data is kept)
```

Sign in with the demo account listed in `supabase/seed.sql`.

## Structure

| Path | Contents |
|---|---|
| `apps/web` | Next.js app |
| `packages/shared` | Environment schema, shared types and design tokens |
| `supabase` | Migrations and seed data |
| `docs/adr` | Architecture decisions |
| `product` | Research, plans, audits, showcase and marketing text |

Copyright © {{YEAR}} {{OWNER_NAME}}. All rights reserved.
