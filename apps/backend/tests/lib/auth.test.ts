import { describe, expect, it } from "vitest";

import { getAuthenticatedPatientId, issueAccessToken, verifyAccessToken } from "../../src/lib";
import { ACCESS_TOKEN_TTL_SECONDS } from "../../src/lib/auth";

const withAuth = (value?: string): Request =>
  new Request("http://localhost/api", value ? { headers: { authorization: value } } : undefined);

describe("access tokens", () => {
  it("verifies a token it issued", () => {
    expect(verifyAccessToken(issueAccessToken("p_001"))).toBe("p_001");
  });

  it.each([
    ["a tampered signature", `${issueAccessToken("p_001")}x`],
    ["another patient's signature", `p_002.${issueAccessToken("p_001").split(".").slice(1).join(".")}`],
    ["a tampered expiry", issueAccessToken("p_001").replace(/\.(\d+)\./, ".99999999999.")],
    ["no separator", "p_001"],
    ["an empty patient id", ".abc"],
    ["an invalid patient id", "p 001.abc"],
  ])("rejects %s", (_name, token) => {
    expect(verifyAccessToken(token)).toBeNull();
  });

  it("rejects an expired token", () => {
    const issuedAt = Date.now() - (ACCESS_TOKEN_TTL_SECONDS + 60) * 1000;
    expect(verifyAccessToken(issueAccessToken("p_001", issuedAt))).toBeNull();
  });

  it("accepts a token just before it expires", () => {
    const issuedAt = Date.now() - (ACCESS_TOKEN_TTL_SECONDS - 60) * 1000;
    expect(verifyAccessToken(issueAccessToken("p_001", issuedAt))).toBe("p_001");
  });

  it("refuses to issue a token for an invalid patient id", () => {
    expect(() => issueAccessToken("bad id")).toThrow();
  });
});

describe("getAuthenticatedPatientId", () => {
  it("reads a valid bearer token", () => {
    expect(getAuthenticatedPatientId(withAuth(`Bearer ${issueAccessToken("p_007")}`))).toBe("p_007");
  });

  it.each([undefined, "Basic abc", "Bearer", "Bearer not-a-token"])("returns null for %p", (value) => {
    expect(getAuthenticatedPatientId(withAuth(value))).toBeNull();
  });
});
