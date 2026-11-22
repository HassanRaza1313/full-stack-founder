import { describe, expect, it } from "vitest";
import { limitInMemory } from "./ratelimit";

describe("limitInMemory", () => {
  it("allows up to max requests per window, then blocks until the window resets", () => {
    const key = `test-${Math.random()}`;
    expect(limitInMemory(key, 2, 1000, 0)).toEqual({ ok: true, remaining: 1 });
    expect(limitInMemory(key, 2, 1000, 10)).toEqual({ ok: true, remaining: 0 });
    expect(limitInMemory(key, 2, 1000, 20).ok).toBe(false);
    expect(limitInMemory(key, 2, 1000, 1000)).toEqual({ ok: true, remaining: 1 });
  });
});
