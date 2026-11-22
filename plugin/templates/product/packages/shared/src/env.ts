import { z } from "zod";

// Every service variable is optional, because locally each adapter works without its key.
// Production checks run in assertProductionEnv(), which /deploy wires into the build.
const optional = z.string().trim().min(1).optional().catch(undefined);

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: optional,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optional,
  SUPABASE_SERVICE_ROLE_KEY: optional,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optional,
  TURNSTILE_SECRET_KEY: optional,
  STRIPE_SECRET_KEY: optional,
  STRIPE_WEBHOOK_SECRET: optional,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optional,
  RESEND_API_KEY: optional,
  EMAIL_FROM: optional,
  NEXT_PUBLIC_POSTHOG_KEY: optional,
  NEXT_PUBLIC_POSTHOG_HOST: optional,
  SENTRY_DSN: optional,
  UPSTASH_REDIS_REST_URL: optional,
  UPSTASH_REDIS_REST_TOKEN: optional,
});

export type ServerEnv = z.infer<typeof schema>;

/** Parses process.env on every call, so tests can change variables between calls. Server code only. */
export function serverEnv(source: Record<string, string | undefined> = process.env): ServerEnv {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`);
  }
  return parsed.data;
}

/** Variables production can't run without. /deploy adds this check to the production build. */
export const PRODUCTION_REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "TURNSTILE_SECRET_KEY",
  "RESEND_API_KEY",
  "EMAIL_FROM",
] as const satisfies readonly (keyof ServerEnv)[];

export function assertProductionEnv(env: ServerEnv = serverEnv()): void {
  const missing = PRODUCTION_REQUIRED.filter((key) => !env[key]);
  if (missing.length > 0) throw new Error(`Missing production variables: ${missing.join(", ")}`);
}
