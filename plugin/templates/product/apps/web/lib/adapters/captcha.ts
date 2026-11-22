import { serverEnv } from "@repo/shared";

/** Verifies a Cloudflare Turnstile token. Locally the public test secret always passes; in production a missing secret fails closed. */
export async function verifyCaptcha(token: string | null | undefined, ip?: string): Promise<boolean> {
  const env = serverEnv();
  if (!env.TURNSTILE_SECRET_KEY) {
    if (env.NODE_ENV === "production") return false;
    return true;
  }
  if (!token) return false;
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  if (ip) body.set("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  if (!res.ok) return false;
  const result = (await res.json()) as { success: boolean };
  return result.success;
}
