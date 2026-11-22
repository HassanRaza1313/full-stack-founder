# 0008. Deployment target

Status: proposed. Confirmed in the first `/founder:spec`, implemented in `/founder:deploy`.

| Item | Choice |
|---|---|
| Web hosting | Vercel (Hobby for a portfolio demo; Pro once it charges) |
| Region | (pick the one closest to most users, and use the same for Supabase) |
| Database | Supabase production project, same region |
| Domain | (the product domain from `discovery/03-brand/naming.md`, bought at `/founder:graduate`) |
| Email | Resend, on a verified domain |
| Errors and analytics | Sentry, PostHog |
| Payments | Stripe, or a merchant of record (decision D3) |
| Load target | (e.g. 50 concurrent users, p95 under 500ms) |
