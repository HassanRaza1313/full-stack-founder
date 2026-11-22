# 0006. Environments

Status: accepted (studio default)

| Environment | When | Database |
|---|---|---|
| Local | Always | Supabase in Docker (`pnpm db:start`) |
| CI | Every PR | A temporary local Supabase |
| Demo | Optional, portfolio track | Its own free Supabase project, or a schema in the studio project. Demo account only, reset nightly |
| Production | After `/founder:deploy` | The Supabase production project |

Configuration differs only through environment variables (`packages/shared/src/env.ts`).
