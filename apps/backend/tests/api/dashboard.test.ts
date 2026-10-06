import { afterEach, describe, expect, it, vi } from "vitest";

import { dynamic, GET } from "../../src/app/api/patients/me/dashboard/route";
import { issueAccessToken } from "../../src/lib";
import * as dashboardService from "../../src/services/dashboard";

const request = (authorization?: string): Request =>
  new Request("http://localhost/api/patients/me/dashboard", {
    headers: authorization ? { authorization } : {},
  });

describe("GET /api/patients/me/dashboard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("is never statically prerendered", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("returns the signed-in patient's dashboard", async () => {
    const response = await GET(request(`Bearer ${issueAccessToken("p_001")}`));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.patient.id).toBe("p_001");
  });

  it("returns 401 without a token", async () => {
    const response = await GET(request());
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "UNAUTHORIZED", message: "Please sign in again." },
    });
  });

  it("returns 401 for a forged token", async () => {
    const response = await GET(request("Bearer p_001.forged"));
    expect(response.status).toBe(401);
  });

  it("returns a generic 500 when the service fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(dashboardService, "getDashboard").mockRejectedValue(new Error("db down"));
    const response = await GET(request(`Bearer ${issueAccessToken("p_001")}`));
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(body)).not.toContain("db down");
  });

  it("returns a generic 500 when the auth secret is not configured", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("AUTH_TOKEN_SECRET", "");
    const response = await GET(request("Bearer p_001.abc"));
    expect(response.status).toBe(500);
  });
});
