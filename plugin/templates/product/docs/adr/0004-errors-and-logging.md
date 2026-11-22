# 0004. Errors and logging

Status: accepted (studio default)

- **Reporting:** errors are reported only through `captureError` in `apps/web/lib/adapters/errors.ts`, which logs locally and goes to Sentry in production.
- **User-facing messages** never include stack traces or internal IDs.
- **Logs** never contain secrets, tokens or personal data.
