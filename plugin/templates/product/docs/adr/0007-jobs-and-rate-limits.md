# 0007. Background jobs and rate limits

Status: accepted (studio default)

- **Scheduled and background work:** Supabase `pg_cron` calling Edge Functions. No separate queue service until there's a measured need.
- **Rate limits:** go through `apps/web/lib/adapters/ratelimit.ts`, which uses memory locally and Upstash Redis in production (serverless instances don't share memory).
