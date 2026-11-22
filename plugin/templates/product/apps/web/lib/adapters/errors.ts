/**
 * The single place errors are reported from.
 * shortcut: it only logs for now. /deploy installs @sentry/nextjs and forwards to it here once SENTRY_DSN is set.
 */
export function captureError(error: unknown, context: Record<string, unknown> = {}): void {
  console.error("[error]", error, context);
}
