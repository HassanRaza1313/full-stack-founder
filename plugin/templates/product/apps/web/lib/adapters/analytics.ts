import { serverEnv } from "@repo/shared";

/** Server-side event capture. Does nothing without a PostHog key; analytics must never break a request. */
export async function track(distinctId: string, event: string, properties: Record<string, unknown> = {}): Promise<void> {
  const env = serverEnv();
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) return;
  const host = env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  try {
    await fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: env.NEXT_PUBLIC_POSTHOG_KEY, event, distinct_id: distinctId, properties }),
    });
  } catch (error) {
    console.warn("[analytics] capture failed", error);
  }
}
