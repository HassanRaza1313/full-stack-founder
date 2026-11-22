# 0002. Data access and row-level security

Status: accepted (studio default)

- **Default path:** the client calls Supabase directly, and row-level security policies enforce access. Every table has RLS enabled, with a policy per role, written in the same migration that creates the table.
- **Privileged work** runs server-side (route handlers or Edge Functions) with the service-role key: payment webhooks, admin actions, cross-user jobs. The service-role key never reaches the browser.
- **Generated types:** `pnpm db:types`.

**Why:** RLS keeps authorization next to the data and works for both web and mobile, with no API layer to maintain.
