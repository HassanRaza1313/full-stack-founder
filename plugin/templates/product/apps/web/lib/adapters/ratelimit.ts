import { serverEnv } from "@repo/shared";

export type LimitResult = { ok: boolean; remaining: number };

const windows = new Map<string, { count: number; resetAt: number }>();

/** Fixed-window limit kept in memory. Fine locally; on serverless every instance has its own memory, hence Upstash in production. */
export function limitInMemory(key: string, max: number, windowMs: number, now = Date.now()): LimitResult {
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }
  current.count += 1;
  return { ok: current.count <= max, remaining: Math.max(0, max - current.count) };
}

async function limitUpstash(url: string, token: string, key: string, max: number, windowMs: number): Promise<LimitResult> {
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", `rl:${key}`],
      ["PEXPIRE", `rl:${key}`, String(windowMs), "NX"],
    ]),
  });
  if (!res.ok) throw new Error(`Upstash rate limit failed: ${res.status}`);
  const [incr] = (await res.json()) as [{ result: number }];
  return { ok: incr.result <= max, remaining: Math.max(0, max - incr.result) };
}

/** Uses Upstash when its variables are set, otherwise memory. */
export async function limit(key: string, max: number, windowMs: number): Promise<LimitResult> {
  const env = serverEnv();
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return limitUpstash(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN, key, max, windowMs);
  }
  return limitInMemory(key, max, windowMs);
}
