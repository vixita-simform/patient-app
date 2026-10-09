import { afterEach, describe, expect, it, vi } from "vitest";

import { issueAccessToken } from "../../src/lib";
import { withAuth } from "../../src/middlewares";

const request = (authorization?: string): Request =>
  new Request("http://localhost/api/test", {
    headers: authorization ? { authorization } : {},
  });

describe("withAuth", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("runs the handler with the verified patient id", async () => {
    const handler = vi.fn(async () => Response.json({ ok: true }));
    const response = await withAuth("GET /api/test", handler)(request(`Bearer ${issueAccessToken("42")}`));
    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledWith(expect.any(Request), { patientId: "42" });
  });

  it.each([undefined, "Basic abc", "Bearer forged.123.sig"])("returns 401 for %p without calling the handler", async (value) => {
    const handler = vi.fn(async () => Response.json({}));
    const response = await withAuth("GET /api/test", handler)(request(value));
    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("turns a handler error into a generic 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = vi.fn(async (): Promise<Response> => {
      throw new Error("db down");
    });
    const response = await withAuth("GET /api/test", handler)(request(`Bearer ${issueAccessToken("42")}`));
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("db down");
  });

  it("returns a generic 500 when the auth secret is not configured", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("AUTH_TOKEN_SECRET", "");
    const response = await withAuth("GET /api/test", vi.fn())(request("Bearer 42.9999999999.abc"));
    expect(response.status).toBe(500);
  });
});
