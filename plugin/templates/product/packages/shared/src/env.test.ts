import { describe, expect, it } from "vitest";
import { assertProductionEnv, serverEnv } from "./env";

describe("serverEnv", () => {
  it("applies defaults and treats empty strings as unset", () => {
    const env = serverEnv({ RESEND_API_KEY: "" });
    expect(env.APP_URL).toBe("http://localhost:3000");
    expect(env.RESEND_API_KEY).toBeUndefined();
  });

  it("rejects a malformed URL", () => {
    expect(() => serverEnv({ APP_URL: "not a url" })).toThrow(/APP_URL/);
  });
});

describe("assertProductionEnv", () => {
  it("names every missing production variable", () => {
    expect(() => assertProductionEnv(serverEnv({}))).toThrow(/RESEND_API_KEY/);
  });
});
