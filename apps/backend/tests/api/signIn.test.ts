import bcrypt from "bcryptjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../../src/app/api/auth/sign-in/route";
import { query } from "../../src/config";
import { resetRateLimits, verifyAccessToken } from "../../src/lib";
import * as authService from "../../src/services/auth";

vi.mock("../../src/config", () => ({ query: vi.fn() }));

const mockQuery = vi.mocked(query);
const DEMO_PASSWORD = "Patient@123";
// bcrypt hash of DEMO_PASSWORD, in the format the `users` table stores.
const PASSWORD_HASH = bcrypt.hashSync(DEMO_PASSWORD, 4);

const ACCOUNT_ROW = {
  user_id: "2",
  password_hash: PASSWORD_HASH,
  user_mobile: "+919825011223",
  user_email: "priya.patel@example.com",
  patient_id: "2",
  first_name: "Priya",
  last_name: "Patel",
  gender: "female",
  blood_group: "O+",
  patient_mobile: "+919825011223",
  patient_email: "priya.patel@example.com",
  date_of_birth: "1990-05-17",
  weight_kg: 61.5,
  uhid: "CW-2024-08813",
};

/** The account lookup finds the row only for these usernames; anything else matches nothing. */
const KNOWN_USERNAMES = ["cw-2024-08813", "+919825011223"];

const stubDatabase = (): void => {
  mockQuery.mockImplementation((async (text: string, params: readonly unknown[] = []) => {
    if (text.includes("FROM users")) {
      return KNOWN_USERNAMES.includes(String(params[0]).toLowerCase()) ? [ACCOUNT_ROW] : [];
    }
    return [];
  }) as typeof query);
};

const request = (body: unknown): Request =>
  new Request("http://localhost/api/auth/sign-in", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe("POST /api/auth/sign-in", () => {
  beforeEach(() => {
    resetRateLimits();
    stubDatabase();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockQuery.mockReset();
  });

  it.each([
    ["patient ID", "CW-2024-08813"],
    ["lowercase patient ID", "cw-2024-08813"],
    ["mobile number", "+919825011223"],
  ])("signs in with a %s", async (_name, username) => {
    const response = await POST(request({ username, password: DEMO_PASSWORD }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.patient).toEqual({
      id: "2",
      firstName: "Priya",
      lastName: "Patel",
      phone: "+919825011223",
      email: "priya.patel@example.com",
      gender: "female",
      bloodGroup: "O+",
      uhid: "CW-2024-08813",
      dateOfBirth: "1990-05-17",
      weight: 61.5,
    });
    expect(verifyAccessToken(body.accessToken)).toBe("2");
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("UPDATE users"), ["2"]);
  });

  it.each([
    ["a wrong password", { username: "CW-2024-08813", password: "wrong" }],
    ["an unknown username", { username: "CW-0000-00000", password: DEMO_PASSWORD }],
  ])("returns 401 for %s", async (_name, body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "invalid_credentials", message: "Incorrect username or password." },
    });
  });

  it("answers an OTP-only account (no password) exactly like a wrong password", async () => {
    mockQuery.mockImplementation((async (text: string) =>
      text.includes("FROM users") ? [{ ...ACCOUNT_ROW, password_hash: null }] : []) as typeof query);
    const response = await POST(request({ username: "CW-2024-08813", password: DEMO_PASSWORD }));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "invalid_credentials", message: "Incorrect username or password." },
    });
  });

  it("returns 429 after too many attempts for the same username", async () => {
    const attempt = () => POST(request({ username: "CW-2024-08813", password: "wrong" }));
    for (let i = 0; i < 5; i += 1) {
      expect((await attempt()).status).toBe(401);
    }
    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect((await blocked.json()).error.code).toBe("too_many_requests");
  });

  it.each([
    ["invalid JSON", "{"],
    ["a non-object body", "null"],
    ["a missing password", { username: "CW-2024-08813" }],
    ["a blank username", { username: "  ", password: DEMO_PASSWORD }],
    ["a non-string field", { username: 42, password: DEMO_PASSWORD }],
    ["an oversized password", { username: "CW-2024-08813", password: "x".repeat(129) }],
  ])("returns 400 for %s", async (_name, body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("invalid_request");
  });

  it("returns a generic 500 when the service fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(authService, "signInWithPassword").mockRejectedValue(new Error("db down"));
    const response = await POST(request({ username: "CW-2024-08813", password: DEMO_PASSWORD }));
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe("internal_error");
    expect(JSON.stringify(body)).not.toContain("db down");
  });
});
